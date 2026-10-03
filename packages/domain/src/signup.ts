// SIGNUP_V1 - contrato del registro publico.
// El signup solo crea la cuenta; el tenant real se crea al verificar el email.

import { z } from "zod";

export const signupRequestSchema = z.object({
  email: z.email().max(300),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
  organization: z.string().trim().min(2).max(120),
});
export type SignupRequest = z.infer<typeof signupRequestSchema>;

export const verificationTokenSchema = z.object({
  id: z.string().min(1).max(200),
  email: z.email().max(300),
  name: z.string().max(120),
  passwordHash: z.string().min(1).max(500),
  organization: z.string().max(120),
  tenantSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  createdAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
  usedAt: z.iso.datetime({ offset: true }).optional(),
});
export type VerificationToken = z.infer<typeof verificationTokenSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}