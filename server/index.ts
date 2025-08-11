import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Set Railway database URL as environment variable (correct region: ap-southeast-1)
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_wBYtJn5Vh0IA@ep-long-mode-a179pxgk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logging function
function log(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [express] ${message}`);
}

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
    userId?: string;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ttrave-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("🚀 Starting server initialization...");
  
  try {
    const server = await registerRoutes(app);
    console.log("✅ Routes registered successfully");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("❌ Express error:", err);
      res.status(status).json({ message });
    });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    // Serve static files from dist directory in production
    app.use(express.static(__dirname, { index: false }));
    
    // Serve index.html for all non-API routes (SPA fallback)
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      const indexPath = path.join(__dirname, "index.html");
      console.log(`📄 Serving index.html from: ${indexPath}`);
      try {
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          console.error(`❌ index.html not found at: ${indexPath}`);
          console.log(`📁 Files in ${__dirname}:`, fs.readdirSync(__dirname));
          res.status(404).send("Application files not found");
        }
      } catch (error) {
        console.error(`❌ Error serving static files:`, error);
        res.status(500).send("Server error");
      }
    });
  } else {
    // Development mode - dynamic import to avoid production issues
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Enhanced Railway deployment support
  server.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
    
    // Railway-specific logging and health check preparation
    if (process.env.NODE_ENV === "production") {
      console.log(`🚀 Production server started successfully`);
      console.log(`✅ Health endpoint: http://0.0.0.0:${port}/health`);
      console.log(`✅ Environment: ${process.env.NODE_ENV}`);
      console.log(`✅ Server binding: 0.0.0.0:${port}`);
      console.log(`✅ Railway deployment ready for health checks`);
    }
  }).on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    if (process.env.NODE_ENV === "production") {
      console.error('❌ Railway deployment failed - server binding error');
      process.exit(1);
    }
  });
  
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})().catch((error) => {
  console.error('❌ Unhandled server error:', error);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});
