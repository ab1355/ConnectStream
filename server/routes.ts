import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Posts
  app.get("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const posts = await storage.getAllPosts();
    // Sort posts by creation date, newest first
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
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
  });

  // Comments
  app.post("/api/comments", async (req, res) => {
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
  });

  const httpServer = createServer(app);
  return httpServer;
}