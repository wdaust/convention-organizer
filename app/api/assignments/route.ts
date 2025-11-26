import { NextResponse } from 'next/server';
import { notion, assignmentsDatabaseId } from '@/lib/notion';

export async function GET(request: Request) {
    if (!assignmentsDatabaseId) {
        return NextResponse.json([]);
    }

    try {
        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get('departmentId');
        const personId = searchParams.get('personId');

        const query: any = {
            database_id: assignmentsDatabaseId,
        };

        const filters = [];

        if (departmentId) {
            filters.push({
                property: 'Department',
                relation: {
                    contains: departmentId,
                },
            });
        }

        if (personId) {
            filters.push({
                property: 'Person',
                relation: {
                    contains: personId,
                },
            });
        }

        if (filters.length > 0) {
            query.filter = filters.length === 1 ? filters[0] : {
                and: filters,
            };
        }

        const response = await notion.databases.query(query);

        const assignments = await Promise.all(response.results.map(async (page: any) => {
            // We need to fetch the related person details
            // This causes N+1 problem. Ideally we'd use a rollup or include, but Notion API doesn't support include.
            // We'll fetch the person name from the relation if possible, or just return the IDs

            // Optimization: The client should probably fetch People and Assignments separately and join them.
            // But to make it easy for the UI, let's try to get some basic info.

            return {
                id: page.id,
                assignmentId: page.properties.Assignment_ID?.rich_text?.[0]?.plain_text,
                personId: page.properties.Person?.relation?.[0]?.id,
                departmentId: page.properties.Department?.relation?.[0]?.id,
                role: page.properties.Role?.select?.name,
                reportsTo: page.properties['Reports To']?.relation?.[0]?.id, // Parent assignment ID
                tags: [], // Tags property missing in Notion
            };
        }));

        return NextResponse.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return NextResponse.json({
            error: 'Failed to fetch assignments',
            message: (error as any).message,
            code: (error as any).code
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!assignmentsDatabaseId) {
        return NextResponse.json({ error: 'Database ID not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { personId, departmentId, role, reportsTo } = body;

        const properties: any = {
            Person: {
                relation: [
                    {
                        id: personId,
                    },
                ],
            },
            Department: {
                relation: [
                    {
                        id: departmentId,
                    },
                ],
            },
            Role: {
                select: {
                    name: role,
                },
            },
            // Tags removed as property is missing in Notion
        };

        if (reportsTo) {
            properties['Reports To'] = {
                relation: [
                    {
                        id: reportsTo,
                    },
                ],
            };
        }

        const response = await notion.pages.create({
            parent: { database_id: assignmentsDatabaseId },
            properties: properties,
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error creating assignment:', error);
        return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
    }
}
