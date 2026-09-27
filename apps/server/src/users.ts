import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export const userRoleSchema = z.enum(["admin", "user"]);

export const userSetupSchema = z.object({
  sopIds: z.array(z.string()).default([]),
  allowedTools: z.array(z.string()).default([]),
  greeting: z.string().max(2000).default(""),
});

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.email().transform((v) => v.toLowerCase().trim()),
  name: z.string().trim().min(1).max(120),
  role: userRoleSchema.default("user"),
  setup: userSetupSchema.default(() => ({ sopIds: [], allowedTools: [], greeting: "" })),
  active: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

interface UserRecord {
  id: string;
  data: User;
  passwordHash: string;
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) throw new AppError("Contrasena demasiado corta", 422, { password: "La contrasena debe tener al menos 8 caracteres" });
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[1], "base64");
    expected = Buffer.from(parts[2], "base64");
  } catch {
    return false;
  }
  const key = await scryptAsync(password, salt, expected.length);
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

export class UserService {
  constructor(private readonly db: Store) {}

  async list(): Promise<User[]> {
    const records = await this.db.list<UserRecord>("system", "users");
    return records.map((r) => r.data);
  }

  async getById(id: string): Promise<User | null> {
    const record = await this.db.get<UserRecord>("system", "users", id);
    return record?.data ?? null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const target = email.toLowerCase().trim();
    const records = await this.db.list<UserRecord>("system", "users");
    const found = records.find((r) => r.data.email === target);
    return found?.data ?? null;
  }

  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const records = await this.db.list<UserRecord>("system", "users");
    const found = records.find((r) => r.data.email === email.toLowerCase().trim());
    if (!found || !found.data.active) return null;
    const ok = await verifyPassword(password, found.passwordHash);
    return ok ? found.data : null;
  }

  async create(input: {
    email: string;
    name: string;
    password: string;
    role?: "admin" | "user";
    setup?: Partial<z.infer<typeof userSetupSchema>>;
  }): Promise<User> {
    const email = input.email.toLowerCase().trim();
    if (await this.getByEmail(email))
      throw new AppError("Email ya registrado", 409, { email: "Ya existe un usuario con ese email" });

    const now = new Date().toISOString();
    const user = userSchema.parse({
      id: randomUUID(),
      email,
      name: input.name,
      role: input.role ?? "user",
      setup: input.setup ?? {},
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    const passwordHash = await hashPassword(input.password);
    const record: UserRecord = { id: user.id, data: user, passwordHash };
    await this.db.put("system", "users", record);
    return user;
  }

  async update(
    id: string,
    patch: {
      name?: string;
      role?: "admin" | "user";
      active?: boolean;
      setup?: Partial<z.infer<typeof userSetupSchema>>;
      password?: string;
    },
  ): Promise<User> {
    const record = await this.db.get<UserRecord>("system", "users", id);
    if (!record) throw new AppError("Usuario no encontrado", 404);

    const merged: User = {
      ...record.data,
      name: patch.name ?? record.data.name,
      role: patch.role ?? record.data.role,
      active: patch.active ?? record.data.active,
      setup: { ...record.data.setup, ...(patch.setup ?? {}) },
      updatedAt: new Date().toISOString(),
    };
    const next: UserRecord = {
      id,
      data: userSchema.parse(merged),
      passwordHash: patch.password ? await hashPassword(patch.password) : record.passwordHash,
    };
    await this.db.put("system", "users", next);
    return next.data;
  }

  async remove(id: string): Promise<void> {
    const record = await this.db.get<UserRecord>("system", "users", id);
    if (!record) throw new AppError("Usuario no encontrado", 404);
    if (record.data.role === "admin") {
      const admins = (await this.list()).filter((u) => u.role === "admin" && u.active);
      if (admins.length <= 1)
        throw new AppError("No se puede borrar el ultimo admin activo", 409);
    }
    await this.db.remove("system", "users", id);
  }

  async ensureAdmin(email: string, password: string, name = "Admin"): Promise<User | null> {
    const existing = await this.list();
    if (existing.length > 0) return null;
    return this.create({ email, name, password, role: "admin" });
  }
}