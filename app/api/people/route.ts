import { NextResponse } from 'next/server';
import { notion, peopleDatabaseId } from '@/lib/notion';

export async function GET(request: Request) {
    if (!peopleDatabaseId) {
        return NextResponse.json([]);
    }

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const query: any = {
            database_id: peopleDatabaseId,
        };

        if (search) {
            query.filter = {
                property: 'Name',
                title: {
                    contains: search,
                },
            };
        }

        const response = await notion.databases.query(query);

        const people = response.results.map((page: any) => {
            return {
                id: page.id,
                personId: page.properties.Person_ID?.rich_text?.[0]?.plain_text,
                name: page.properties.Name?.title?.[0]?.plain_text || 'Untitled',
                email: page.properties.Email?.email,
                phone: page.properties.Phone?.phone_number,
                photo: page.properties.Photo?.files?.[0]?.file?.url || page.properties.Photo?.files?.[0]?.external?.url,
                status: page.properties.Status?.select?.name,
                notes: page.properties.Notes?.rich_text?.[0]?.plain_text,
            };
        });

        return NextResponse.json(people);
    } catch (error) {
        console.error('Error fetching people:', error);
        return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!peopleDatabaseId) {
        return NextResponse.json({ error: 'Database ID not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { name, email, phone, city } = body;

        const response = await notion.pages.create({
            parent: { database_id: peopleDatabaseId },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: name,
                            },
                        },
                    ],
                },
                Email: {
                    email: email,
                },
                Phone: {
                    phone_number: phone,
                },
                Status: {
                    select: {
                        name: 'Active',
                    },
                },
            },
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error creating person:', error);
        return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
    }
}
