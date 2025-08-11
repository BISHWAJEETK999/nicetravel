import * as schema from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Use environment variable to determine if we should use real database
const databaseUrl = process.env.DATABASE_URL;

let db: any = null;
let pool: any = null;

if (databaseUrl) {
  // Production: Use Neon database
  console.log("🗄️ Using Neon database for production environment");
  console.log(`🔗 Connecting to database...`);
  try {
    pool = neon(databaseUrl);
    db = drizzle(pool, { schema });
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    db = null;
    pool = null;
  }
} else {
  // Development: Use in-memory storage
  console.log("🔧 Using in-memory storage for development environment");
  db = null;
  pool = null;
}

export { db, pool };
