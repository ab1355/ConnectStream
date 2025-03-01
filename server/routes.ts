import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { insertMessageSchema } from "@shared/schema";
import { db } from "./db";
import { spaces, spaceMembers, users, threads, threadReplies, bookmarks } from "@shared/schema"; // Added import for users table and bookmarks table
import { eq, or, and, sql } from "drizzle-orm";
import { insertSpaceSchema } from "@shared/schema"; // Import the schema
import { insertPollSchema, insertPollOptionSchema, insertPollResponseSchema, insertBookmarkSchema } from "@shared/schema";
import { polls, pollOptions, pollResponses, hashtags, postHashtags, mentions } from "@shared/schema";
import { insertThreadSchema, insertThreadReplySchema } from '@shared/schema'; //Import thread schemas
import { userScores, achievements, userAchievements } from "@shared/schema";
import { desc } from "drizzle-orm";
import { notifications } from "@shared/schema";
import { insertNotificationSchema } from "@shared/schema";
import { customLinks } from "@shared/schema";
import { insertCustomLinkSchema } from "@shared/schema"; // Import the new schema
import { posts } from "@shared/schema"; // Add missing import at the top with other imports
import { z } from "zod"; // Added import for zod

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

      const mentionsArray = Array.from(validation.data.content.matchAll(mentionRegex)).map(m => m[1]);
      const hashtagsArray = Array.from(validation.data.content.matchAll(hashtagRegex)).map(h => h[1]);

      // Create post
      const [post] = await db.insert(posts)
        .values({
          ...validation.data,
          authorId: req.user.id,
          createdAt: new Date()
        })
        .returning();

      // Handle mentions
      if (mentionsArray.length > 0) {
        const mentionedUsers = await db.select()
          .from(users)
          .where(sql`${users.username} = ANY(${mentionsArray})`);

        await db.insert(mentions).values(
          mentionedUsers.map(user => ({
            postId: post.id,
            userId: user.id,
            createdAt: new Date()
          }))
        );
      }

      // Handle hashtags
      if (hashtagsArray.length > 0) {
        for (const name of hashtagsArray) {
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

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const topUsers = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        points: userScores.points,
        level: userScores.level,
      })
        .from(users)
        .leftJoin(userScores, eq(users.id, userScores.userId))
        .orderBy(desc(userScores.points))
        .limit(10);

      res.json(topUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const userAchievs = await db.select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        points: achievements.points,
        icon: achievements.icon,
        badgeColor: achievements.badgeColor,
        badgeType: achievements.badgeType,
        earnedAt: userAchievements.earnedAt,
      })
        .from(achievements)
        .innerJoin(
          userAchievements,
          and(
            eq(achievements.id, userAchievements.achievementId),
            eq(userAchievements.userId, parseInt(req.params.userId))
          )
        );

      res.json(userAchievs);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  // Add these routes in the registerRoutes function
  app.get("/api/threads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const allThreads = await db.select().from(threads)
        .orderBy(threads.createdAt);
      res.json(allThreads);
    } catch (error) {
      console.error("Error fetching threads:", error);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  app.post("/api/threads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertThreadSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [thread] = await db.insert(threads)
        .values({
          ...validation.data,
          authorId: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.status(201).json(thread);
    } catch (error) {
      console.error("Error creating thread:", error);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  app.post("/api/threads/:threadId/replies", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertThreadReplySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [reply] = await db.insert(threadReplies)
        .values({
          ...validation.data,
          authorId: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ error: "Failed to create reply" });
    }
  });

  //Bookmark routes
  app.get("/api/bookmarks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const userBookmarks = await db.select({
        id: bookmarks.id,
        createdAt: bookmarks.createdAt,
        post: {
          id: posts.id,
          title: posts.title,
          content: posts.content,
          createdAt: posts.createdAt,
          authorId: posts.authorId,
        }
      })
        .from(bookmarks)
        .innerJoin(posts, eq(posts.id, bookmarks.postId))
        .where(eq(bookmarks.userId, req.user.id))
        .orderBy(desc(bookmarks.createdAt));

      res.json(userBookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertBookmarkSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [bookmark] = await db.insert(bookmarks)
        .values({
          ...validation.data,
          userId: req.user.id,
        })
        .returning();

      res.status(201).json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });

  app.delete("/api/bookmarks/:postId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const postId = parseInt(req.params.postId);

      await db.delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, req.user.id),
            eq(bookmarks.postId, postId)
          )
        );

      res.sendStatus(200);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, req.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);

      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/mark-read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      await db.update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, req.user.id),
            eq(notifications.isRead, false)
          )
        );

      res.sendStatus(200);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  // GIF routes
  app.get("/api/gifs/search", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const params = new URLSearchParams({
        api_key: process.env.GIPHY_API_KEY!,
        q: req.query.q as string,
        limit: req.query.limit as string || "20",
        rating: "g",
      });

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?${params}`
      );

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
      res.status(500).json({ error: "Failed to fetch GIFs" });
    }
  });

  // Media upload route
  app.post("/api/upload", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      // TODO: Implement file upload with proper storage
      // For now, return a mock response
      res.json({
        url: "https://picsum.photos/seed/upload/800/400"
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.get("/api/custom-links", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const links = await db.select()
        .from(customLinks)
        .orderBy(customLinks.category, customLinks.order);

      res.json(links);
    } catch (error) {
      console.error("Error fetching custom links:", error);
      res.status(500).json({ error: "Failed to fetch custom links" });
    }
  });

  // Add this route after the GET /api/custom-links endpoint
  app.post("/api/custom-links", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertCustomLinkSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [link] = await db.insert(customLinks)
        .values({
          ...validation.data,
          createdAt: new Date()
        })
        .returning();

      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating custom link:", error);
      res.status(500).json({ error: "Failed to create custom link" });
    }
  });

  // Add these routes to handle user approvals
  app.get("/api/users/pending", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      // Check if user has admin/moderator privileges
      if (!["admin", "moderator"].includes(req.user.role)) {
        return res.sendStatus(403);
      }

      const pendingUsers = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        status: users.status,
        createdAt: users.createdAt,
      })
        .from(users)
        .where(eq(users.status, "pending"))
        .orderBy(desc(users.createdAt));

      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ error: "Failed to fetch pending users" });
    }
  });

  app.post("/api/users/:userId/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      // Check if user has admin/moderator privileges
      if (!["admin", "moderator"].includes(req.user.role)) {
        return res.sendStatus(403);
      }

      const userId = parseInt(req.params.userId);

      // Update user status
      const [updatedUser] = await db.update(users)
        .set({
          status: "approved",
          approvedAt: new Date(),
          approvedBy: req.user.id,
        })
        .where(eq(users.id, userId))
        .returning();

      // Create notification
      await db.insert(notifications)
        .values({
          userId: userId,
          title: "Account Approved",
          content: "Your account has been approved. Welcome to the community!",
          type: "account_approval",
          link: "/",
        });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ error: "Failed to approve user" });
    }
  });

  app.post("/api/users/:userId/block", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      // Check if user has admin privileges
      if (req.user.role !== "admin") {
        return res.sendStatus(403);
      }

      const userId = parseInt(req.params.userId);

      // Update user status
      const [updatedUser] = await db.update(users)
        .set({
          status: "blocked",
        })
        .where(eq(users.id, userId))
        .returning();

      // Create notification
      await db.insert(notifications)
        .values({
          userId: userId,
          title: "Account Blocked",
          content: "Your account has been blocked. Please contact support for more information.",
          type: "account_blocked",
        });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  app.patch("/api/user/email-preferences", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const schema = z.object({
        emailDigestEnabled: z.boolean(),
        emailDigestFrequency: z.enum(["daily", "weekly"]),
        email: z.string().email(),
      });

      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [updatedUser] = await db.update(users)
        .set({
          email: validation.data.email,
          emailDigestEnabled: validation.data.emailDigestEnabled,
          emailDigestFrequency: validation.data.emailDigestFrequency,
        })
        .where(eq(users.id, req.user.id))
        .returning();

      // For demo purposes, we'll just log what would be sent in the digest
      console.log(`Email digest would be sent to ${updatedUser.email} ${updatedUser.emailDigestFrequency}`);

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating email preferences:", error);
      res.status(500).json({ error: "Failed to update email preferences" });
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

        // Handle different message types
        switch (message.type) {
          case 'notification':
            // Send notification to specific user
            const recipientWs = clients.get(message.userId?.toString());
            if (recipientWs?.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'notification',
                data: message.data
              }));
            }
            break;

          case 'chat':
            // Handle chat messages
            const chatRecipientWs = clients.get(message.receiverId?.toString());
            if (chatRecipientWs?.readyState === WebSocket.OPEN) {
              chatRecipientWs.send(JSON.stringify(message));
            }
            break;
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