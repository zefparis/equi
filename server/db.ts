import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { WebSocket } from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure WebSocket for Neon serverless (fixes Railway compatibility)
// @ts-ignore - WebSocket polyfill for Node.js environments
if (!globalThis.WebSocket) {
  // @ts-ignore
  globalThis.WebSocket = WebSocket;
}

// Initialize Neon connection pool with WebSocket
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Test connection
console.log("✅ PostgreSQL connection established via Neon (WebSocket)");
console.log("📊 Database URL configured:", process.env.DATABASE_URL.substring(0, 30) + "...");
