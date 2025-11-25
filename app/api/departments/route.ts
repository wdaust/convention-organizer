import { NextResponse } from 'next/server';
import { notion, departmentsDatabaseId } from '@/lib/notion';

export async function GET() {
    if (!departmentsDatabaseId) {
        console.warn('NOTION_DEPARTMENTS_DB_ID is not set. Returning mock data.');
        return NextResponse.json([
            { id: 'oversight', name: 'OVERSIGHT', category: 'OVERSIGHT' },
            { id: 'attendants', name: 'ATTENDANTS', category: 'ATTENDANTS' },
            { id: 'cleaning', name: 'CLEANING', category: 'CLEANING' },
        ]);
    }

    try {
        const response = await notion.databases.query({
            database_id: departmentsDatabaseId,
            sorts: [
                {
                    property: 'Name',
                    direction: 'ascending',
                },
            ],
        });

        const departments = response.results.map((page: any) => {
            const name = page.properties.Name?.title?.[0]?.plain_text || 'Untitled';
            return {
                id: page.properties.Department_ID?.rich_text?.[0]?.plain_text || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                notionId: page.id,
                name: name,
                description: page.properties.Description?.rich_text?.[0]?.plain_text,
                departmentId: page.properties.Department_ID?.rich_text?.[0]?.plain_text,
            };
        });

        return NextResponse.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json({
            error: 'Failed to fetch departments',
            message: (error as any).message,
            code: (error as any).code
        }, { status: 500 });
    }
}
