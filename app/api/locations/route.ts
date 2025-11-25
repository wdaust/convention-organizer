import { NextResponse } from 'next/server';
import { notion, databaseId } from '@/lib/notion';

export async function GET() {
    try {
        if (!databaseId) {
            return NextResponse.json({ error: 'Notion credentials not configured' });
        }

        // @ts-ignore - Notion SDK v5 type inference issue with databases.query
        const response = await notion.databases.query({
            database_id: databaseId,
            // filter: {
            //   property: 'Status',
            //   select: {
            //     equals: 'Active',
            //   },
            // },
        });

        const locations = response.results.map((page: any) => {
            const name = page.properties.Name?.title?.[0]?.plain_text || 'Unknown';
            const coordinates = page.properties.Coordinates?.rich_text?.[0]?.plain_text || '0,0';
            const [lat, lng] = coordinates.split(',').map(Number);
            const color = page.properties.Color?.select?.name?.toLowerCase() || undefined;
            const level = page.properties.Level?.select?.name || undefined;
            const category = page.properties.Category?.rich_text?.[0]?.plain_text || undefined;

            return {
                id: page.id,
                name,
                lat: isNaN(lat) ? 0 : lat,
                lng: isNaN(lng) ? 0 : lng,
                color,
                level,
                category,
            };
        });

        return NextResponse.json(locations);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { id, lat, lng } = await request.json();

        await notion.pages.update({
            page_id: id,
            properties: {
                Coordinates: {
                    rich_text: [
                        {
                            text: {
                                content: `${lat},${lng}`,
                            },
                        },
                    ],
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        if (!databaseId) {
            return NextResponse.json({ error: 'Notion credentials not configured' }, { status: 500 });
        }

        const { name, lat, lng, color, level, category } = await request.json();

        const properties: any = {
            Name: {
                title: [{ text: { content: name } }],
            },
            Coordinates: {
                rich_text: [{ text: { content: `${lat},${lng}` } }],
            },
        };

        // Add color if provided
        if (color) {
            properties.Color = { select: { name: color } };
        }

        // Add level if provided
        if (level) {
            properties.Level = { select: { name: level } };
        }

        // Add category if provided
        if (category) {
            properties.Category = { rich_text: [{ text: { content: category } }] };
        }

        // @ts-ignore - Notion SDK v5 type inference issue
        const newPage = await notion.pages.create({
            parent: { database_id: databaseId },
            properties,
        });

        return NextResponse.json({
            success: true,
            id: newPage.id,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
    }
}
