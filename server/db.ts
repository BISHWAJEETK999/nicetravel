import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Railway DATABASE_URL: postgresql://neondb_owner:npg_wBYtJn5Vh0IA@ep-long-mode-a179pxgk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_wBYtJn5Vh0IA@ep-long-mode-a179pxgk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

console.log("🗄️ Initializing Neon database connection for Railway...");

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
