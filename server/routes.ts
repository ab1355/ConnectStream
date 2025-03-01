import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Posts
  app.get("/api/posts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const posts = await storage.getAllPosts();
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const validation = insertPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }
      const post = await storage.createPost({
        ...validation.data,
        authorId: req.user.id
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Comments
  app.post("/api/comments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const validation = insertCommentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }
      const comment = await storage.createComment({
        ...validation.data,
        authorId: req.user.id,
        postId: req.body.postId
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket Server Setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    if (!req.url) return;
    const userId = req.url.split('=')[1];
    if (!userId) return;

    clients.set(userId, ws);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        // Broadcast to all connected clients except sender
        clients.forEach((client, id) => {
          if (id !== userId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(userId);
    });
  });

  return httpServer;
}