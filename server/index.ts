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

  // Set up Vite in development mode before starting the server
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use REPLIT_DOMAIN for host if available, otherwise use 0.0.0.0
  const host = process.env.REPLIT_DOMAIN || "0.0.0.0";
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;

  const startServer = (attemptPort: number, maxAttempts = 10) => {
    if (maxAttempts <= 0) {
      log(`Failed to find an available port after multiple attempts`);
      process.exit(1);
      return;
    }

    server.listen({
      port: attemptPort,
      host,
      reusePort: true,
    }, () => {
      // Log the full server URL for debugging
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      log(`Server running at ${protocol}://${host}:${attemptPort}`);
      log(`WebSocket server available at ${protocol === 'https' ? 'wss' : 'ws'}://${host}:${attemptPort}/api/ws`);
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