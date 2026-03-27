import { randomUUID } from "crypto";
import type {
  User, InsertUser,
  ContactMessage, InsertContact,
  NewsletterSubscriber, InsertNewsletter,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Contact
  createContactMessage(msg: InsertContact): Promise<ContactMessage>;

  // Newsletter
  getSubscriber(email: string): Promise<NewsletterSubscriber | undefined>;
  createSubscriber(data: InsertNewsletter): Promise<NewsletterSubscriber>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private contacts = new Map<string, ContactMessage>();
  private subscribers = new Map<string, NewsletterSubscriber>();

  async getUser(id: string) { return this.users.get(id); }

  async getUserByEmail(email: string) {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(data: InsertUser): Promise<User> {
    const user: User = { ...data, id: randomUUID(), createdAt: new Date() };
    this.users.set(user.id, user);
    return user;
  }

  async createContactMessage(data: InsertContact): Promise<ContactMessage> {
    const msg: ContactMessage = { ...data, id: randomUUID(), createdAt: new Date() };
    this.contacts.set(msg.id, msg);
    return msg;
  }

  async getSubscriber(email: string) {
    return Array.from(this.subscribers.values()).find(s => s.email === email);
  }

  async createSubscriber(data: InsertNewsletter): Promise<NewsletterSubscriber> {
    const sub: NewsletterSubscriber = { ...data, id: randomUUID(), subscribed: true, createdAt: new Date() };
    this.subscribers.set(sub.id, sub);
    return sub;
  }
}

export const storage = new MemStorage();
