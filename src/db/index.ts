/**
 * Database client. Neon's serverless driver speaks HTTP, which is what
 * makes this safe in serverless functions (no TCP connection pooling
 * to manage). Import { db } anywhere on the server; never on the client.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
