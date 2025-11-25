import { NextResponse } from 'next/server';
import { notion } from '@/lib/notion';

const levelsDbId = process.env.NOTION_LEVELS_DATABASE_ID;

export async function GET() {
    try {
        if (!levelsDbId) {
            // Return default images if no levels database configured
            return NextResponse.json({
                'Arena Level': '/arena-floor.png',
                'Concourse': '/arena-floor.png',
                'Suite Level': '/arena-floor.png',
                'Upper Level': '/arena-floor.png',
                'Parking': '/arena-floor.png',
            });
        }

        // @ts-ignore
        const response = await notion.databases.query({
            database_id: levelsDbId,
        });

        const levelImages: Record<string, string> = {};

        response.results.forEach((page: any) => {
            const levelName = page.properties.Level?.title?.[0]?.plain_text;

            // Try to get image from Files property
            const filesProperty = page.properties.Image?.files?.[0];
            let imageUrl = '/arena-floor.png'; // default fallback

            if (filesProperty) {
                // Handle both external and internal Notion files
                imageUrl = filesProperty.external?.url || filesProperty.file?.url || imageUrl;
            } else {
                // Fallback to URL property if Files property doesn't exist
                const urlProperty = page.properties.ImageURL?.url;
                if (urlProperty) {
                    imageUrl = urlProperty;
                }
            }

            if (levelName) {
                levelImages[levelName] = imageUrl;
            }
        });

        return NextResponse.json(levelImages);
    } catch (error) {
        console.error('Error fetching levels:', error);
        // Return defaults on error
        return NextResponse.json({
            'Arena Level': '/arena-floor.png',
            'Concourse': '/arena-floor.png',
            'Suite Level': '/arena-floor.png',
            'Upper Level': '/arena-floor.png',
            'Parking': '/arena-floor.png',
        });
    }
}
