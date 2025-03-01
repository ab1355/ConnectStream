import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  role: text("role").default("user").notNull(),
  avatarUrl: text("avatar_url")
});

export const spaces = pgTable("spaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  privacy: text("privacy").default("public").notNull(), // public, private, or secret
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ownerId: serial("owner_id").references(() => users.id)
});

export const spaceMembers = pgTable("space_members", {
  id: serial("id").primaryKey(),
  spaceId: serial("space_id").references(() => spaces.id),
  userId: serial("user_id").references(() => users.id),
  role: text("role").default("member").notNull(), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: serial("sender_id").references(() => users.id),
  receiverId: serial("receiver_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false).notNull()
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: serial("author_id").references(() => users.id),
  spaceId: serial("space_id").references(() => spaces.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: serial("post_id").references(() => posts.id),
  authorId: serial("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  spaceId: serial("space_id").references(() => spaces.id),
  creatorId: serial("creator_id").references(() => users.id),
  type: text("type").default("poll").notNull(), // "poll" or "survey"
  multipleChoice: boolean("multiple_choice").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endsAt: timestamp("ends_at"),
  isActive: boolean("is_active").default(true).notNull()
});

export const pollOptions = pgTable("poll_options", {
  id: serial("id").primaryKey(),
  pollId: serial("poll_id").references(() => polls.id),
  text: text("text").notNull(),
  order: integer("order").notNull()
});

export const pollResponses = pgTable("poll_responses", {
  id: serial("id").primaryKey(),
  pollId: serial("poll_id").references(() => polls.id),
  userId: serial("user_id").references(() => users.id),
  optionId: serial("option_id").references(() => pollOptions.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true
});

export const insertSpaceSchema = createInsertSchema(spaces).pick({
  name: true,
  description: true,
  privacy: true
});

export const insertSpaceMemberSchema = createInsertSchema(spaceMembers).pick({
  spaceId: true,
  userId: true,
  role: true
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  receiverId: true
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  spaceId: true
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  postId: true
});

export const insertPollSchema = createInsertSchema(polls).pick({
  title: true,
  description: true,
  spaceId: true,
  type: true,
  multipleChoice: true,
  endsAt: true
});

export const insertPollOptionSchema = createInsertSchema(pollOptions).pick({
  pollId: true,
  text: true,
  order: true
});

export const insertPollResponseSchema = createInsertSchema(pollResponses).pick({
  pollId: true,
  optionId: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSpace = z.infer<typeof insertSpaceSchema>;
export type InsertSpaceMember = z.infer<typeof insertSpaceMemberSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type InsertPollOption = z.infer<typeof insertPollOptionSchema>;
export type InsertPollResponse = z.infer<typeof insertPollResponseSchema>;

export type User = typeof users.$inferSelect;
export type Space = typeof spaces.$inferSelect;
export type SpaceMember = typeof spaceMembers.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Poll = typeof polls.$inferSelect;
export type PollOption = typeof pollOptions.$inferSelect;
export type PollResponse = typeof pollResponses.$inferSelect;