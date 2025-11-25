import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { notion, peopleDatabaseId } from '@/lib/notion';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Email',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "brother@example.com" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !peopleDatabaseId) return null;

                try {
                    // Check if email exists in Notion People DB
                    const response = await notion.databases.query({
                        database_id: peopleDatabaseId,
                        filter: {
                            property: 'Email',
                            email: {
                                equals: credentials.email
                            }
                        }
                    });

                    if (response.results.length > 0) {
                        const page: any = response.results[0];
                        return {
                            id: page.id,
                            name: page.properties.Name?.title[0]?.plain_text || 'Unknown',
                            email: page.properties.Email?.email,
                            image: page.properties.Photo?.files[0]?.file?.url || page.properties.Photo?.files[0]?.external?.url,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
