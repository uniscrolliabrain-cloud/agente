// COMPANY_API_V1 - datos del espacio "Hoy".
import { apiFetch } from "./client";

export type CompanyRole = "owner" | "admin" | "member";

export interface CompanyMember {
  userId: string;
  name: string;
  email: string;
  role: CompanyRole;
  active: boolean;
}

export interface CompanyAgent {
  id: string;
  name: string;
  active: boolean;
  owner: string;
}

export interface CompanyTask {
  id: string;
  title: string;
  kind: string;
  status: string;
  updatedAt: string;
  assignedTo?: string;
  owner: string;
}

export interface CompanyOverview {
  tenant: { id: string; name: string };
  role: CompanyRole;
  canManageMembers: boolean;
  members: CompanyMember[];
  agents: CompanyAgent[];
  tasks: {
    total: number;
    running: number;
    waiting: number;
    succeeded: number;
    failed: number;
    recent: CompanyTask[];
  };
}

export async function getCompanyOverview(): Promise<CompanyOverview> {
  return apiFetch<CompanyOverview>("/api/company");
}

export interface InviteMemberInput {
  email: string;
  name?: string;
  password?: string;
  role: "admin" | "member";
}

export interface InviteMemberResult {
  ok: boolean;
  created: boolean;
  tenantId: string;
  user: { id: string; email: string; name: string };
  role: CompanyRole;
}

export async function addCompanyMember(input: InviteMemberInput): Promise<InviteMemberResult> {
  return apiFetch<InviteMemberResult>("/api/company/members", { method: "POST", body: input });
}
