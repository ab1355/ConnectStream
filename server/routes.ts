import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { insertMessageSchema } from "@shared/schema";
import { db } from "./db";
import { spaces, spaceMembers, users } from "@shared/schema"; // Added import for users table
import { eq, or, and, sql } from "drizzle-orm";
import { insertSpaceSchema } from "@shared/schema"; // Import the schema
import { insertPollSchema, insertPollOptionSchema, insertPollResponseSchema } from "@shared/schema";
import { polls, pollOptions, pollResponses } from "@shared/schema";
import { hashtags, postHashtags, mentions } from "@shared/schema";

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

  // Hashtags routes
  app.get("/api/hashtags/trending", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const trendingHashtags = await db.select()
        .from(hashtags)
        .orderBy(hashtags.count, "desc")
        .limit(10);
      res.json(trendingHashtags);
    } catch (error) {
      console.error("Error fetching trending hashtags:", error);
      res.status(500).json({ error: "Failed to fetch trending hashtags" });
    }
  });

  app.get("/api/users/search", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const query = req.query.q as string;
      if (!query) return res.json([]);

      const matchingUsers = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl
      })
      .from(users)
      .where(
        or(
          sql`${users.username} ILIKE ${`%${query}%`}`,
          sql`${users.displayName} ILIKE ${`%${query}%`}`
        )
      )
      .limit(5);

      res.json(matchingUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ error: "Failed to search users" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const validation = insertPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      // Extract mentions and hashtags from content
      const mentionRegex = /@(\w+)/g;
      const hashtagRegex = /#(\w+)/g;

      const mentions = [...validation.data.content.matchAll(mentionRegex)].map(m => m[1]);
      const hashtagNames = [...validation.data.content.matchAll(hashtagRegex)].map(h => h[1]);

      // Create post
      const [post] = await db.insert(posts)
        .values({
          ...validation.data,
          authorId: req.user.id,
          createdAt: new Date()
        })
        .returning();

      // Handle mentions
      if (mentions.length > 0) {
        const mentionedUsers = await db.select()
          .from(users)
          .where(sql`${users.username} = ANY(${mentions})`);

        await db.insert(mentions)
          .values(mentionedUsers.map(user => ({
            postId: post.id,
            userId: user.id,
            createdAt: new Date()
          })));
      }

      // Handle hashtags
      if (hashtagNames.length > 0) {
        for (const name of hashtagNames) {
          // Try to find existing hashtag or create new one
          const [hashtag] = await db.insert(hashtags)
            .values({ name, count: 1 })
            .onConflictDoUpdate({
              target: hashtags.name,
              set: { 
                count: sql`${hashtags.count} + 1`,
                lastUsedAt: new Date()
              }
            })
            .returning();

          await db.insert(postHashtags)
            .values({
              postId: post.id,
              hashtagId: hashtag.id,
              createdAt: new Date()
            });
        }
      }

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
      const usersList = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        role: users.role,
        avatarUrl: users.avatarUrl
      })
        .from(users)
        .where(
          eq(users.id, req.user?.id ?? 0) 
        );
      res.json(usersList);
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

  // Spaces route
  app.get("/api/spaces", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const spacesList = await db.select().from(spaces)
        .leftJoin(spaceMembers, eq(spaces.id, spaceMembers.spaceId))
        .where(
          or(
            eq(spaces.privacy, "public"),
            and(
              eq(spaceMembers.userId, req.user.id),
              or(
                eq(spaces.privacy, "private"),
                eq(spaces.privacy, "secret")
              )
            )
          )
        )
        .orderBy(spaces.createdAt);

      res.json(spacesList);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      res.status(500).json({ error: "Failed to fetch spaces" });
    }
  });

  app.post("/api/spaces", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertSpaceSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [space] = await db.insert(spaces)
        .values({
          ...validation.data,
          ownerId: req.user.id,
          createdAt: new Date()
        })
        .returning();

      // Add owner as the first member and admin
      await db.insert(spaceMembers)
        .values({
          spaceId: space.id,
          userId: req.user.id,
          role: "admin",
          joinedAt: new Date()
        });

      res.json(space);
    } catch (error) {
      console.error("Error creating space:", error);
      res.status(500).json({ error: "Failed to create space" });
    }
  });


  // Polls routes
  app.get("/api/polls", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const allPolls = await db.select().from(polls)
        .orderBy(polls.createdAt);
      res.json(allPolls);
    } catch (error) {
      console.error("Error fetching polls:", error);
      res.status(500).json({ error: "Failed to fetch polls" });
    }
  });

  app.post("/api/polls", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertPollSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [poll] = await db.insert(polls)
        .values({
          ...validation.data,
          creatorId: req.user.id,
          createdAt: new Date()
        })
        .returning();

      // Insert poll options if provided
      if (req.body.options && Array.isArray(req.body.options)) {
        const options = req.body.options.map((text: string, index: number) => ({
          pollId: poll.id,
          text,
          order: index
        }));

        await db.insert(pollOptions)
          .values(options);
      }

      res.status(201).json(poll);
    } catch (error) {
      console.error("Error creating poll:", error);
      res.status(500).json({ error: "Failed to create poll" });
    }
  });

  app.post("/api/polls/:pollId/respond", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertPollResponseSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [response] = await db.insert(pollResponses)
        .values({
          ...validation.data,
          userId: req.user.id,
          createdAt: new Date()
        })
        .returning();

      res.status(201).json(response);
    } catch (error) {
      console.error("Error submitting poll response:", error);
      res.status(500).json({ error: "Failed to submit poll response" });
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
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws'
  });

  // Keep track of connected clients
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    if (!req.url) return;

    const userId = new URL(
      req.url,
      `${req.headers.origin || 'http://localhost'}`
    ).searchParams.get('userId');

    if (!userId) return;

    clients.set(userId, ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        // Broadcast to the intended recipient
        const recipientWs = clients.get(message.receiverId?.toString());
        if (recipientWs?.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify(message));
        }
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