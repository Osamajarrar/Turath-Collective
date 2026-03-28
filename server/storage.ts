import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users, contactMessages,
  type User, type InsertUser,
  type ContactMessage, type InsertContact,
} from "@shared/schema";

export interface IStorage {
  // User auth (backend kept; UI deferred to future launch)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Contact messages (route deferred; table ready for future use)
  createContactMessage(msg: InsertContact): Promise<ContactMessage>;
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
}

export const storage = new DrizzleStorage();
