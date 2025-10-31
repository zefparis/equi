import type { Express } from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Route d'administration pour exécuter les migrations manuellement
 * Endpoint sécurisé : /api/admin/run-migrations
 */
export function registerMigrationRoutes(app: Express) {
  
  // Endpoint pour exécuter les migrations
  app.post("/api/admin/run-migrations", async (req, res) => {
    try {
      console.log("🔧 Running database migrations manually...");
      
      // Vérifier si DATABASE_URL existe
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ 
          success: false,
          message: "DATABASE_URL not configured" 
        });
      }

      // Exécuter drizzle-kit push
      const { stdout, stderr } = await execPromise("npm run db:push");
      
      console.log("✅ Migrations executed successfully");
      console.log("stdout:", stdout);
      if (stderr) console.log("stderr:", stderr);

      res.json({
        success: true,
        message: "Database migrations executed successfully",
        output: stdout,
        stderr: stderr || null
      });

    } catch (error: any) {
      console.error("❌ Migration error:", error);
      res.status(500).json({
        success: false,
        message: "Migration failed",
        error: error.message,
        stderr: error.stderr || null,
        stdout: error.stdout || null
      });
    }
  });

  // Endpoint pour exécuter le seed
  app.post("/api/admin/run-seed", async (req, res) => {
    try {
      console.log("🌱 Running database seed manually...");
      
      const { stdout, stderr } = await execPromise("npm run db:seed");
      
      console.log("✅ Seed executed successfully");
      
      res.json({
        success: true,
        message: "Database seeded successfully",
        output: stdout,
        stderr: stderr || null
      });

    } catch (error: any) {
      console.error("❌ Seed error:", error);
      res.status(500).json({
        success: false,
        message: "Seed failed",
        error: error.message,
        stderr: error.stderr || null,
        stdout: error.stdout || null
      });
    }
  });

  // Endpoint pour vérifier l'état de la base de données
  app.get("/api/admin/db-status", async (req, res) => {
    try {
      const { db } = await import("../db");
      const { products } = await import("@shared/schema");
      
      // Tester une requête simple
      const productCount = await db.select().from(products).limit(1);
      
      res.json({
        success: true,
        message: "Database connection OK",
        hasProducts: productCount.length > 0,
        databaseUrl: process.env.DATABASE_URL ? "✅ Configured" : "❌ Missing"
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message,
        databaseUrl: process.env.DATABASE_URL ? "✅ Configured" : "❌ Missing"
      });
    }
  });
}
