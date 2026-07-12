// Deferred v1: auth & contact features use Shopify instead.
// The users/contactMessages/orders tables in @shared/schema are commented out,
// so the Drizzle implementation is stubbed until they're re-enabled. To
// restore: uncomment the tables in @shared/schema, then reinstate the Drizzle
// version of this file (see git history: DrizzleStorage).

import type { Order, OrderStatus } from "@shared/schema";

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  firstName: string | null;
  lastName: string | null;
  /** ISO timestamp; set by the storage layer on creation. */
  createdAt: string;
}

export type InsertUser = Omit<User, "id" | "createdAt">;

export type InsertOrder = Omit<Order, "id" | "createdAt" | "items"> & {
  items: Array<Omit<Order["items"][number], "id" | "orderId">>;
};

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type InsertContact = Omit<ContactMessage, "id">;

export interface IStorage {
  // User auth (backend kept; UI deferred to future launch)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Orders (groundwork; checkout stays on Shopify for v1, so nothing writes
  // these yet — the shape exists so order history can be built against it)
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;

  // Contact messages (route deferred; table ready for future use)
  createContactMessage(msg: InsertContact): Promise<ContactMessage>;
}

class DeferredStorage implements IStorage {
  async getUser(_id: string): Promise<User | undefined> {
    throw new Error("User storage is deferred for v1 launch (users table not provisioned)");
  }

  async getUserByEmail(_email: string): Promise<User | undefined> {
    throw new Error("User storage is deferred for v1 launch (users table not provisioned)");
  }

  async createUser(_user: InsertUser): Promise<User> {
    throw new Error("User storage is deferred for v1 launch (users table not provisioned)");
  }

  async createOrder(_order: InsertOrder): Promise<Order> {
    throw new Error("Order storage is deferred for v1 launch (orders table not provisioned)");
  }

  async getOrder(_id: string): Promise<Order | undefined> {
    throw new Error("Order storage is deferred for v1 launch (orders table not provisioned)");
  }

  async getOrdersByUser(_userId: string): Promise<Order[]> {
    throw new Error("Order storage is deferred for v1 launch (orders table not provisioned)");
  }

  async updateOrderStatus(_id: string, _status: OrderStatus): Promise<Order | undefined> {
    throw new Error("Order storage is deferred for v1 launch (orders table not provisioned)");
  }

  async createContactMessage(_msg: InsertContact): Promise<ContactMessage> {
    throw new Error("Contact storage is deferred for v1 launch (contact_messages table not provisioned)");
  }
}

export const storage = new DeferredStorage();
