import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users, contactMessages, newsletterSubscribers,
  type User, type InsertUser,
  type ContactMessage, type InsertContact,
  type NewsletterSubscriber, type InsertNewsletter,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(msg: InsertContact): Promise<ContactMessage>;
  getSubscriber(email: string): Promise<NewsletterSubscriber | undefined>;
  createSubscriber(data: InsertNewsletter): Promise<NewsletterSubscriber>;
}

export class DrizzleStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async createContactMessage(data: InsertContact): Promise<ContactMessage> {
    const [msg] = await db.insert(contactMessages).values(data).returning();
    return msg;
  }

  async getSubscriber(email: string) {
    const [sub] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return sub;
  }

  async createSubscriber(data: InsertNewsletter): Promise<NewsletterSubscriber> {
    const [sub] = await db.insert(newsletterSubscribers).values(data).returning();
    return sub;
  }
}

export const storage = new DrizzleStorage();
