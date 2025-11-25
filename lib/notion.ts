import { Client } from '@notionhq/client';

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DATABASE_ID;

export const notion = new Client({ auth: token });
export const databaseId = dbId;
export const levelsDatabaseId = process.env.NOTION_LEVELS_DATABASE_ID;
export const departmentsDatabaseId = process.env.NOTION_DEPARTMENTS_DB_ID;
export const peopleDatabaseId = process.env.NOTION_PEOPLE_DB_ID;
export const assignmentsDatabaseId = process.env.NOTION_ASSIGNMENTS_DB_ID;
