import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Initialize Neon connection with HTTP
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Test connection
console.log("✅ PostgreSQL connection established via Neon");
console.log("📊 Database URL configured:", process.env.DATABASE_URL.substring(0, 30) + "...");
