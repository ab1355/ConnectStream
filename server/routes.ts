import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { insertMessageSchema } from "@shared/schema";

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

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const users = Array.from(storage.users.values())
        .filter(u => u.id !== req.user?.id)
        .map(({ password, ...user }) => user);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Messages
  app.get("/api/messages/:userId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const messages = await storage.getMessages(parseInt(req.params.userId));
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const validation = insertMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }
      const message = await storage.createMessage({
        ...validation.data,
        senderId: req.user.id
      });
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Search routes
  app.get("/api/spaces", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      res.json([]);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      res.status(500).json({ error: "Failed to fetch spaces" });
    }
  });

  app.get("/api/courses", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      res.json([]);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.get("/api/discussions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      res.json([]);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      res.status(500).json({ error: "Failed to fetch discussions" });
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