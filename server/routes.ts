import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { insertMessageSchema } from "@shared/schema";
import { db } from "./db";
import { spaces, spaceMembers, users, threads, threadReplies, bookmarks, polls, pollOptions, pollResponses, hashtags, postHashtags, mentions, mediaFiles, posts, courses, courseSections, courseBlocks, lessonDiscussions, lessonDiscussionReplies, lessons, lessonProgress, courseEnrollments, learningPaths, learningPathCourses, learningPathProgress, roles, rolePermissions, tasks } from "@shared/schema"; 
import { eq, or, and, sql, desc } from "drizzle-orm";
import { insertSpaceSchema } from "@shared/schema"; 
import { insertPollSchema, insertPollOptionSchema, insertPollResponseSchema, insertBookmarkSchema, insertCourseSchema, insertCourseSectionSchema, insertCourseBlockSchema } from "@shared/schema";
import { insertThreadSchema, insertThreadReplySchema } from '@shared/schema'; 
import { userScores, achievements, userAchievements } from "@shared/schema";
import { notifications } from "@shared/schema";
import { insertNotificationSchema } from "@shared/schema";
import { customLinks } from "@shared/schema";
import { insertCustomLinkSchema } from "@shared/schema"; 
import { z } from "zod"; 
import multer from 'multer';
import { mediaStorageService } from './services/media-storage';
import path from 'path';
import { insertLessonSchema, insertLessonDiscussionSchema, insertLessonDiscussionReplySchema, insertTaskSchema } from "@shared/schema";

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
        content: validation.data.content,
        senderId: req.user.id,
        receiverId: validation.data.receiverId,
        read: false
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

      const spacesList = await db.select({
        id: spaces.id,
        name: spaces.name,
        description: spaces.description,
        privacy: spaces.privacy,
        ownerId: spaces.ownerId,
        createdAt: spaces.createdAt,
        memberCount: sql<number>`count(${spaceMembers.userId})::int`,
      })
        .from(spaces)
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
        .groupBy(spaces.id)
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

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const allCourses = await db.select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        coverImage: courses.coverImage,
        authorId: courses.authorId,
        published: courses.published,
        createdAt: courses.createdAt,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
        .from(courses)
        .leftJoin(users, eq(courses.authorId, users.id))
        .orderBy(desc(courses.createdAt));

      res.json(allCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertCourseSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [course] = await db.insert(courses)
        .values({
          ...validation.data,
          authorId: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  app.post("/api/course-sections", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertCourseSectionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [section] = await db.insert(courseSections)
        .values({
          ...validation.data,
          createdAt: new Date(),
        })
        .returning();

      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating course section:", error);
      res.status(500).json({ error: "Failed to create course section" });
    }
  });

  app.post("/api/course-blocks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertCourseBlockSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [block] = await db.insert(courseBlocks)
        .values({
          ...validation.data,
          createdAt: new Date(),
        })
        .returning();

      res.status(201).json(block);
    } catch (error) {
      console.error("Error creating course block:", error);
      res.status(500).json({ error: "Failed to create course block" });
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
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });

  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const mediaFile = await mediaStorageService.saveFile(req.file, req.user.id);

      // Ensure we return the correct type including the id
      res.status(201).json({
        id: mediaFile.id,
        filename: mediaFile.filename,
        url: `/uploads/${path.basename(mediaFile.path)}`,
        mimeType: mediaFile.mimeType,
        size: mediaFile.size
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.get("/uploads/:filename", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Failed to serve file" });
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
      if(!validation.success) {
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

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating email preferences:", error);
      res.status(500).json({ error: "Failed to update email preferences" });
    }
  });

  // Add this endpoint after the email preferences endpoint
  app.patch("/api/user/theme", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const schema = z.object({
        themePreference: z.enum(["light", "dark", "system"]),
        themeColor: z.string(),
        themeRadius: z.string(),
        themeVariant: z.enum(["professional", "tint", "vibrant"]),
      });

      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [updatedUser] = await db.update(users)
        .set({
          themePreference: validation.data.themePreference,
          themeColor: validation.data.themeColor,
          themeRadius: validation.data.themeRadius,
          themeVariant: validation.data.themeVariant,
        })
        .where(eq(users.id, req.user.id))
        .returning();

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating theme preferences:", error);
      res.status(500).json({ error: "Failed to update theme preferences" });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const lessonId = parseInt(req.params.id);
      const [lesson] = await db.select()
        .from(lessons)
        .where(eq(lessons.id, lessonId));

      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  app.get("/api/lessons/:lessonId/discussions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const lessonId = parseInt(req.params.lessonId);
      const discussions = await db.select({
        id: lessonDiscussions.id,
        title: lessonDiscussions.title,
        content: lessonDiscussions.content,
        isPinned: lessonDiscussions.isPinned,
        createdAt: lessonDiscussions.createdAt,
        updatedAt: lessonDiscussions.updatedAt,
        authorId: lessonDiscussions.authorId,
        author: {
          username: users.username,
          displayName: users.displayName,
        },
      })
        .from(lessonDiscussions)
        .leftJoin(users, eq(lessonDiscussions.authorId, users.id))
        .where(eq(lessonDiscussions.lessonId, lessonId))
        .orderBy(desc(lessonDiscussions.createdAt));

      res.json(discussions);
    } catch (error) {
      console.error("Error fetching lesson discussions:", error);
      res.status(500).json({ error: "Failed to fetch lesson discussions" });
    }
  });

  app.post("/api/lessons/:lessonId/discussions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertLessonDiscussionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [discussion] = await db.insert(lessonDiscussions)
        .values({
          ...validation.data,
          authorId: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json(discussion);
    } catch (error) {
      console.error("Error creating lesson discussion:", error);
      res.status(500).json({ error: "Failed to create lesson discussion" });
    }
  });

  app.post("/api/discussions/:discussionId/replies", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertLessonDiscussionReplySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [reply] = await db.insert(lessonDiscussionReplies)
        .values({
          ...validation.data,
          authorId: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating discussion reply:", error);
      res.status(500).json({ error: "Failed to create discussion reply" });
    }
  });

  app.patch("/api/discussions/:discussionId/pin", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const discussionId = parseInt(req.params.discussionId);
      const [discussion] = await db.update(lessonDiscussions)
        .set({ isPinned: true })
        .where(eq(lessonDiscussions.id, discussionId))
        .returning();

      res.json(discussion);
    } catch (error) {
      console.error("Error pinning discussion:", error);
      res.status(500).json({ error: "Failed to pin discussion" });
    }
  });

  // Add progress tracking endpoints
  app.post("/api/courses/:courseId/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const courseId = parseInt(req.params.courseId);
      const { lessonId, completed } = req.body;

      if (!courseId || !lessonId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      console.log(`Updating progress for course ${courseId}, lesson ${lessonId}, completed: ${completed}`);

      // First verify the lesson belongs to the course
      const [lessonExists] = await db.select()
        .from(lessons)
        .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
        .where(
          and(
            eq(courseSections.courseId, courseId),
            eq(lessons.id, lessonId)
          )
        );

      if (!lessonExists) {
        return res.status(404).json({ error: "Lesson not found in this course" });
      }

      // Update lesson progress
      const [progress] = await db.insert(lessonProgress)
        .values({
          lessonId,
          userId: req.user.id,
          completed: completed || false,
          lastAccessed: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [lessonProgress.lessonId, lessonProgress.userId],
          set: {
            completed: completed || false,
            lastAccessed: new Date(),
            updatedAt: new Date(),
          },
        })
        .returning();

      // Get course progress statistics
      const [{ count: totalLessons }] = await db.select({
        count: sql<number>`count(*)::int`
      })
        .from(lessons)
        .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
        .where(eq(courseSections.courseId, courseId));

      const [{ count: completedLessons }] = await db.select({
        count: sql<number>`count(*)::int`
      })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
        .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
        .where(
          and(
            eq(courseSections.courseId, courseId),
            eq(lessonProgress.userId, req.user.id),
            eq(lessonProgress.completed, true)
          )
        );

      const progressPercentage = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      // Update course enrollment progress
      await db.insert(courseEnrollments)
        .values({
          courseId,
          userId: req.user.id,
          progress: progressPercentage,
          completedAt: progressPercentage === 100 ? new Date() : null,
        })
        .onConflictDoUpdate({
          target: [courseEnrollments.courseId, courseEnrollments.userId],
          set: {
            progress: progressPercentage,
            completedAt: progressPercentage === 100 ? new Date() : null,
          },
        });

      console.log(`Updated course progress: ${progressPercentage}% complete`);

      res.json({
        lessonProgress: progress,
        courseProgress: {
          totalLessons,
          completedLessons,
          percentageComplete: progressPercentage
        }
      });
    } catch (error) {
      console.error("Error updating course progress:", error);
      res.status(500).json({ error: "Failed to update course progress" });
    }
  });

  app.get("/api/courses/:courseId/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const courseId = parseInt(req.params.courseId);
      if (!courseId) {
        return res.status(400).json({ error: "Invalid course ID" });
      }

      // Verify course exists
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.id, courseId));

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const [{ count: totalLessons }] = await db.select({
        count: sql<number>`count(*)::int`
      })
        .from(lessons)
        .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
        .where(eq(courseSections.courseId, courseId));

      const [{ count: completedLessons }] = await db.select({
        count: sql<number>`count(*)::int`
      })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
        .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
        .where(
          and(
            eq(courseSections.courseId, courseId),
            eq(lessonProgress.userId, req.user.id),
            eq(lessonProgress.completed, true)
          )
        );

      res.json({
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        percentageComplete: totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0
      });
    } catch (error) {
      console.error("Error fetching course progress:", error);
      res.status(500).json({ error: "Failed to fetch course progress" });
    }
  });

  app.get("/api/user/courses/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const enrollments = await db.select()
        .from(courseEnrollments)
        .where(eq(courseEnrollments.userId, req.user.id));

      const totalCourses = enrollments.length;
      const completedCourses = enrollments.filter(e => e.completedAt).length;

      res.json({
        totalCourses,
        completedCourses,
        percentageComplete: totalCourses > 0
          ? Math.round((completedCourses / totalCourses) * 100)
          : 0
      });
    } catch (error) {
      console.error("Error fetching user course progress:", error);
      res.status(500).json({ error: "Failed to fetch user course progress" });
    }
  });

  // Mark lesson as completed
  app.post("/api/lessons/:lessonId/complete", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const lessonId = parseInt(req.params.lessonId);

      const [progress] = await db.insert(lessonProgress)
        .values({
          lessonId,
          userId: req.user.id,
          completed: true,
          lastAccessed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [lessonProgress.lessonId, lessonProgress.userId],
          set: {
            completed: true,
            updatedAt: new Date(),
          }
        })
        .returning();

      res.status(201).json(progress);
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      res.status(500).json({ error: "Failed to mark lesson as completed" });
    }
  });

  // Add this endpoint to the existing routes
  app.get("/api/admin/course-enrollments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (req.user.role !== "admin") return res.sendStatus(403);

      // Get total enrollments
      const [totalEnrollments] = await db.select({ count: sql<number>`count(*)` })
        .from(courseEnrollments);

      // Get active courses (has at least one enrollment)
      const [activeCourses] = await db.select({ count: sql<number>`count(distinct ${courseEnrollments.courseId})` })
        .from(courseEnrollments);

      // Calculate average completion rate
      const [completionStats] = await db.select({
        completed: sql<number>`count(*) filter (where completed_at is not null)`,
        total: sql<number>`count(*)`
      })
        .from(courseEnrollments);

      const averageCompletionRate = Math.round((completionStats.completed / completionStats.total) * 100) || 0;

      // Get detailed enrollment data
      const enrollmentDetails = await db.select({
        id: courseEnrollments.id,
        courseId: courseEnrollments.courseId,
        userId: courseEnrollments.userId,
        progress: courseEnrollments.progress,
        completedAt: courseEnrollments.completedAt,
        createdAt: courseEnrollments.createdAt,
        course: {
          title: courses.title,
        },
        user: {
          username: users.username,
          displayName: users.displayName,
        },
      })
        .from(courseEnrollments)
        .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
        .leftJoin(users, eq(courseEnrollments.userId, users.id))
        .orderBy(desc(courseEnrollments.createdAt));

      res.json({
        totalEnrollments: totalEnrollments.count,
        activeCourses: activeCourses.count,
        averageCompletionRate,
        enrollments: enrollmentDetails,
      });
    } catch (error) {
      console.error("Error fetching admin course enrollments:", error);
      res.status(500).json({ error: "Failed to fetch admin course enrollments" });
    }
  });

  // Add this endpoint after the existing admin endpoints
  app.get("/api/admin/role-stats", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (req.user.role !== "admin") return res.sendStatus(403);

      // Get role distribution
      const distribution = await db.select({
        role: users.role,
        count: sql<number>`count(*)`,
      })
        .from(users)
        .groupBy(users.role)
        .orderBy(users.role);

      // Count pending approvals
      const [pendingApprovals] = await db.select({
        count: sql<number>`count(*)`
      })
        .from(users)
        .where(eq(users.status, "pending"));

      res.json({
        distribution,
        pendingApprovals: pendingApprovals.count
      });
    } catch (error) {
      console.error("Error fetching role stats:", error);
      res.status(500).json({ error: "Failed to fetch role stats" });
    }
  });

  // Add this after the existing course routes
  app.post("/api/admin/courses/generate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (req.user.role !== "admin") return res.sendStatus(403);

      const { topic, description } = req.body;

      if (!topic || !description) {
        return res.status(400).json({ error: "Topic and description are required" });
      }

      // TODO: Integrate with actual AI service
      // For now, create a basic course structure
      const [course] = await db.insert(courses)
        .values({
          title: topic,
          description: description,
          authorId: req.user.id,
          published: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create default sections
      const sections = [
        "Introduction",
        "Core Concepts",
        "Practical Applications",
        "Advanced Topics",
        "Summary and Next Steps"
      ];

      for (let i = 0; i < sections.length; i++) {
        await db.insert(courseSections)
          .values({
            courseId: course.id,
            title: sections[i],
            order: i + 1,
            createdAt: new Date()
          });
      }

      res.status(201).json(course);
    } catch (error) {
      console.error("Error generating course:", error);
      res.status(500).json({ error: "Failed to generate course" });
    }
  });

  // Add this after the existing course routes
  app.post("/api/courses/import", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (req.user.role !== "admin") return res.sendStatus(403);

      // Parse the uploaded JSON file
      const coursesData = JSON.parse(req.body.toString());

      // Validate the courses data structure
      if (!Array.isArray(coursesData)) {
        return res.status(400).json({ error: "Invalid courses data format" });
      }

      const importedCourses = [];

      for (const courseData of coursesData) {
        // Create the course
        const [course] = await db.insert(courses)
          .values({
            title: courseData.title,
            description: courseData.description,
            coverImage: courseData.coverImage,
            authorId: req.user.id,
            published: courseData.published || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        // Create sections if they exist
        if (Array.isArray(courseData.sections)) {
          for (let i = 0; i < courseData.sections.length; i++) {
            const section = courseData.sections[i];
            const [courseSection] = await db.insert(courseSections)
              .values({
                courseId: course.id,
                title: section.title,
                order: i + 1,
                createdAt: new Date(),
              })
              .returning();

            // Create lessons if they exist
            if (Array.isArray(section.lessons)) {
              for (let j = 0; j < section.lessons.length; j++) {
                const lesson = section.lessons[j];
                await db.insert(lessons)
                  .values({
                    sectionId: courseSection.id,
                    title: lesson.title,
                    content: lesson.content,
                    order: j + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });
              }
            }
          }
        }

        importedCourses.push(course);
      }

      res.status(201).json(importedCourses);
    } catch (error) {
      console.error("Error importing courses:", error);
      res.status(500).json({ error: "Failed to import courses" });
    }
  });

  // Add this after the existing course routes
  app.post("/api/learning-paths/generate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const { title, description, difficulty } = req.body;

      if (!title || !description || !difficulty) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Create the learning path
      const [learningPath] = await db.insert(learningPaths)
        .values({
          userId: req.user.id,
          title,
          description,
          difficulty,
          estimatedHours: 20, // Default estimate
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Get relevant courses based on difficulty
      const relevantCourses = await db.select()
        .from(courses)
        .where(sql`${courses.published} = true`)
        .limit(5); // Start with 5 courses per path

      // Add courses to the learning path
      for (let i = 0; i < relevantCourses.length; i++) {
        await db.insert(learningPathCourses)
          .values({
            pathId: learningPath.id,
            courseId: relevantCourses[i].id,
            order: i + 1,
            isRequired: true,
            createdAt: new Date(),
          });
      }

      // Initialize progress tracking
      await db.insert(learningPathProgress)
        .values({
          pathId: learningPath.id,
          userId: req.user.id,
          currentCourseId: relevantCourses[0].id,
          progressPercentage: 0,
          startedAt: new Date(),
          lastAccessedAt: new Date(),
        });

      res.status(201).json(learningPath);
    } catch (error) {
      console.error("Error generating learning path:", error);
      res.status(500).json({ error: "Failed to generate learning path" });
    }
  });

  // Add endpoint to get user's learning paths
  app.get("/api/learning-paths", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const userPaths = await db.select({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        difficulty: learningPaths.difficulty,
        estimatedHours: learningPaths.estimatedHours,
        isActive: learningPaths.isActive,
        progress: learningPathProgress.progressPercentage,
        currentCourse: {
          id: courses.id,
          title: courses.title,
        },
      })
        .from(learningPaths)
        .leftJoin(
          learningPathProgress,
          and(
            eq(learningPaths.id, learningPathProgress.pathId),
            eq(learningPathProgress.userId, req.user.id)
          )
        )
        .leftJoin(
          courses,
          eq(learningPathProgress.currentCourseId, courses.id)
        )
        .where(eq(learningPaths.userId, req.user.id))
        .orderBy(desc(learningPaths.createdAt));

      res.json(userPaths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  // Add these routes after the existing role-related routes

  // Role Management Routes
  app.get("/api/admin/roles", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (req.user.role !== "admin") return res.sendStatus(403);

      const roles = await db.select().from(roles)
        .orderBy(roles.name);

      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.post("/api/admin/roles", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (req.user.role !== "admin") return res.sendStatus(403);

      const roleSchema = z.object({
        name: z.string().min(1),
        description: z.string()
      });

      const validation = roleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [role] = await db.insert(roles)
        .values({
          ...validation.data,
          createdAt: new Date()
        })
        .returning();

      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ error: "Failed to create role" });
    }
  });

  app.get("/api/admin/permissions/:roleId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (req.user.role !== "admin") return res.sendStatus(403);

      const rolePermissions = await db.select()
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, parseInt(req.params.roleId)));

      res.json(rolePermissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });

  app.patch("/api/admin/roles/:roleId/permissions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (req.user.role !== "admin") return res.sendStatus(403);

      const schema = z.object({
        permissions: z.array(z.string())
      });

      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const roleId = parseInt(req.params.roleId);

      // First remove all existing permissions
      await db.delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));

      // Then add the new permissions
      if (validation.data.permissions.length > 0) {
        await db.insert(rolePermissions)
          .values(
            validation.data.permissions.map(permissionId => ({
              roleId,
              permissionId,
              grantedAt: new Date()
            }))
          );
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Error updating permissions:", error);
      res.status(500).json({ error: "Failed to update permissions" });
    }
  });

  // Add these routes before the WebSocket server setup
  app.get("/api/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const userTasks = await db.select()
        .from(tasks)
        .where(eq(tasks.userId, req.user.id))
        .orderBy(desc(tasks.createdAt));

      res.json(userTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validation = insertTaskSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const [task] = await db.insert(tasks)
        .values({
          ...validation.data,
          userId: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const taskId = parseInt(req.params.id);
      const [task] = await db.update(tasks)
        .set({
          status: req.body.status,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(tasks.id, taskId),
            eq(tasks.userId, req.user.id)
          )
        )
        .returning();

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Add this new search endpoint after the other API endpoints
  app.get("/api/search", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({
          users: [],
          posts: [],
          spaces: [],
          courses: [],
          discussions: []
        });
      }

      const searchPattern = `%${query}%`;

      // Search users
      const users = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl
      })
        .from(users)
        .where(
          or(
            sql`${users.username} ILIKE ${searchPattern}`,
            sql`${users.displayName} ILIKE ${searchPattern}`
          )
        )
        .limit(5);

      // Search posts
      const posts = await db.select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        createdAt: posts.createdAt
      })
        .from(posts)
        .where(
          or(
            sql`${posts.title} ILIKE ${searchPattern}`,
            sql`${posts.content} ILIKE ${searchPattern}`
          )
        )
        .limit(5);

      // Search spaces
      const spaces = await db.select({
        id: spaces.id,
        name: spaces.name,
        description: spaces.description,
        privacy: spaces.privacy
      })
        .from(spaces)
        .where(
          and(
            or(
              sql`${spaces.name} ILIKE ${searchPattern}`,
              sql`${spaces.description} ILIKE ${searchPattern}`
            ),
            or(
              eq(spaces.privacy, "public"),
              exists(
                db.select()
                  .from(spaceMembers)
                  .where(
                    and(
                      eq(spaceMembers.spaceId, spaces.id),
                      eq(spaceMembers.userId, req.user.id)
                    )
                  )
              )
            )
          )
        )
        .limit(5);

      // Search courses
      const courses = await db.select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        coverImage: courses.coverImage,
        authorId: courses.authorId
      })
        .from(courses)
        .where(
          or(
            sql`${courses.title} ILIKE ${searchPattern}`,
            sql`${courses.description} ILIKE ${searchPattern}`
          )
        )
        .limit(5);

      // Search discussions
      const discussions = await db.select({
        id: threads.id,
        title: threads.title,
        content: threads.content,
        authorId: threads.authorId
      })
        .from(threads)
        .where(
          or(
            sql`${threads.title} ILIKE ${searchPattern}`,
            sql`${threads.content} ILIKE ${searchPattern}`
          )
        )
        .limit(5);

      res.json({
        users,
        posts,
        spaces,
        courses,
        discussions
      });
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}