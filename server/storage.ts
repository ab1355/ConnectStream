import { IStorage } from "./storage";
import { db } from "./db";
import { users, posts, comments, messages } from "@shared/schema";
import type { User, Post, Comment, Message, InsertUser, InsertMessage } from "@shared/schema";
import { eq, and, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(posts.createdAt);
  }

  async createPost(post: Omit<Post, "id" | "createdAt">): Promise<Post> {
    const [newPost] = await db.insert(posts)
      .values({
        ...post,
        createdAt: new Date()
      })
      .returning();
    return newPost;
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const [newComment] = await db.insert(comments)
      .values({
        ...comment,
        createdAt: new Date()
      })
      .returning();
    return newComment;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(message: Omit<Message, "id" | "createdAt" | "read">): Promise<Message> {
    const [newMessage] = await db.insert(messages)
      .values({
        ...message,
        createdAt: new Date(),
        read: false
      })
      .returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db.update(messages)
      .set({ read: true })
      .where(eq(messages.id, messageId));
  }
}

export const storage = new DatabaseStorage();