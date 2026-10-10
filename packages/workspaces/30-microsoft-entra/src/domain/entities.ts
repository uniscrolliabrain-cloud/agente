// 30-microsoft-entra — entidades canonicas del workspace de identidad.
// Derivado del analisis de Microsoft Entra ID + Microsoft Graph API
// (users, groups, directoryRoles, roleAssignments, accessPolicies,
// signInSessions, conditionalAccess).

import { z } from "zod";

export const principalSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  email: z.string().max(500).optional(),
  userPrincipalName: z.string().max(500).optional(),
  kind: z.enum(["user","service_principal","group","device","guest"]).default("user"),
  department: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  managerId: z.string().max(200).optional(),
  status: z.enum(["active","disabled","deleted","invited"]).default("active"),
  lastSignInAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const groupSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(2000).optional(),
  kind: z.enum(["security","microsoft365","distribution","dynamic"]).default("security"),
  memberIds: z.array(z.string().min(1).max(200)).default([]),
  ownerIds: z.array(z.string().min(1).max(200)).default([]),
  createdAt: z.string(),
});

export const roleSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(2000).optional(),
  scope: z.enum(["tenant","resource","custom"]).default("tenant"),
  builtin: z.boolean().default(false),
});

export const roleAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  principalId: z.string().min(1).max(200),
  roleId: z.string().min(1).max(200),
  scopeId: z.string().max(200).optional(),
  scopeType: z.enum(["tenant","workspace","entity","resource"]).default("tenant"),
  assignedAt: z.string(),
  assignedBy: z.string().max(200).optional(),
  expiresAt: z.string().optional(),
});

export const accessPolicySchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  kind: z.enum(["conditional_access","mfa_requirement","session","privileged_access","custom"]).default("conditional_access"),
  rules: z.array(z.record(z.string(), z.unknown())).default([]),
  enabled: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const sessionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  principalId: z.string().min(1).max(200),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  ip: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  device: z.string().max(200).optional(),
  clientApp: z.string().max(200).optional(),
  status: z.enum(["active","expired","revoked","failed"]).default("active"),
});

export const authEventSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  principalId: z.string().max(200).optional(),
  kind: z.enum(["sign_in","sign_out","mfa_challenge","password_reset","role_change","policy_applied"]),
  result: z.enum(["success","failure","blocked"]).default("success"),
  reason: z.string().max(1000).optional(),
  occurredAt: z.string(),
  ip: z.string().max(100).optional(),
  userAgent: z.string().max(500).optional(),
});

export type Principal = z.infer<typeof principalSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Role = z.infer<typeof roleSchema>;
export type RoleAssignment = z.infer<typeof roleAssignmentSchema>;
export type AccessPolicy = z.infer<typeof accessPolicySchema>;
export type Session = z.infer<typeof sessionSchema>;
export type AuthEvent = z.infer<typeof authEventSchema>;