import { IStorage } from "./storage";
import createMemoryStore from "memorystore";
import session from "express-session";
import { User, Post, Comment, Message, InsertUser, InsertMessage } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  public users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private messages: Map<number, Message>;
  public sessionStore: session.Store;
  private currentUserId: number;
  private currentPostId: number;
  private currentCommentId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentCommentId = 1;
    this.currentMessageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { 
      ...insertUser, 
      id, 
      role: "user",
      avatarUrl: null,
      displayName: insertUser.displayName || null
    };
    this.users.set(id, user);
    return user;
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async createPost(post: Omit<Post, "id" | "createdAt">): Promise<Post> {
    const id = this.currentPostId++;
    const newPost = { ...post, id, createdAt: new Date() };
    this.posts.set(id, newPost);
    return newPost;
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const id = this.currentCommentId++;
    const newComment = { ...comment, id, createdAt: new Date() };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }

  async createMessage(message: Omit<Message, "id" | "createdAt" | "read">): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage = { ...message, id, createdAt: new Date(), read: false };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      this.messages.set(messageId, { ...message, read: true });
    }
  }
}

export const storage = new MemStorage();