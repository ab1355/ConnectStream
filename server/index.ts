import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve the app on port 5000, but use another port if it's not available
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  const startServer = (attemptPort: number, maxAttempts = 10) => {
    if (maxAttempts <= 0) {
      log(`Failed to find an available port after multiple attempts`);
      process.exit(1);
      return;
    }
    
    server.listen({
      port: attemptPort,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${attemptPort}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = attemptPort + 1;
        log(`Port ${attemptPort} is in use, trying port ${nextPort}`);
        startServer(nextPort, maxAttempts - 1);
      } else {
        log(`Error starting server: ${err.message}`);
        throw err;
      }
    });
  };
  
  startServer(port);
})();
