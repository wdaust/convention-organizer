import { NextResponse } from 'next/server';
import { notion } from '@/lib/notion';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name, color, level, category } = await request.json();

        const properties: any = {};

        if (name !== undefined) {
            properties.Name = { title: [{ text: { content: name } }] };
        }

        if (color !== undefined) {
            properties.Color = color ? { select: { name: color } } : { select: null };
        }

        if (level !== undefined) {
            properties.Level = level ? { select: { name: level } } : { select: null };
        }

        if (category !== undefined) {
            properties.Category = category ? { rich_text: [{ text: { content: category } }] } : { rich_text: [] };
        }

        await notion.pages.update({
            page_id: id,
            properties,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Notion doesn't actually delete pages, it archives them
        await notion.pages.update({
            page_id: id,
            archived: true,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }
}
