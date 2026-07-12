// Deferred v1: auth & contact features use Shopify instead.
// The users/contactMessages tables in @shared/schema are commented out, so the
// Drizzle implementation is stubbed until they're re-enabled. To restore:
// uncomment the tables in @shared/schema, then reinstate the Drizzle version
// of this file (see git history: DrizzleStorage).

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  firstName: string | null;
  lastName: string | null;
}

export type InsertUser = Omit<User, "id">;

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

  async createContactMessage(_msg: InsertContact): Promise<ContactMessage> {
    throw new Error("Contact storage is deferred for v1 launch (contact_messages table not provisioned)");
  }
}

export const storage = new DeferredStorage();
