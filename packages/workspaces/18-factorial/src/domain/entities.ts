// 18-factorial — entidades canonicas del workspace de recursos humanos.
// Derivado del analisis de Factorial API (employees, contracts,
// leave requests, attendance, payroll, documents, teams).

import { z } from "zod";

export const employeeSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  firstName: z.string().max(200).optional(),
  lastName: z.string().max(200).optional(),
  email: z.string().max(500).optional(),
  phone: z.string().max(100).optional(),
  nationalId: z.string().max(50).optional(),
  position: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  managerId: z.string().max(200).optional(),
  teamId: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active","on_leave","terminated","draft"]).default("active"),
  kind: z.enum(["employee","contractor","intern","external"]).default("employee"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const leaveRequestSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  employeeId: z.string().min(1).max(200),
  kind: z.enum(["vacation","sick","personal","parental","unpaid","other"]).default("vacation"),
  from: z.string(),
  to: z.string(),
  days: z.number().nonnegative(),
  reason: z.string().max(2000).optional(),
  status: z.enum(["pending","approved","rejected","cancelled"]).default("pending"),
  approvedBy: z.string().max(200).optional(),
  approvedAt: z.string().optional(),
  createdAt: z.string(),
});

export const workScheduleSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  employeeId: z.string().min(1).max(200),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().max(10),
  endTime: z.string().max(10),
  breakMinutes: z.number().int().nonnegative().default(0),
  effectiveFrom: z.string().optional(),
});

export const employmentRecordSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  employeeId: z.string().min(1).max(200),
  contractType: z.enum(["permanent","temporary","freelance","internship","other"]).default("permanent"),
  workingHours: z.number().nonnegative().optional(),
  from: z.string(),
  to: z.string().optional(),
  salary: z.number().nonnegative().optional(),
  currency: z.string().max(10).default("EUR"),
  notes: z.string().max(2000).optional(),
});

export const attendanceRecordSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  employeeId: z.string().min(1).max(200),
  date: z.string(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  workedMinutes: z.number().int().nonnegative().default(0),
  source: z.enum(["manual","clock","import"]).default("manual"),
});

export const hrDocumentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  employeeId: z.string().min(1).max(200),
  name: z.string().max(400),
  kind: z.enum(["contract","payslip","certificate","id","other"]).default("other"),
  url: z.string().max(2000),
  uploadedAt: z.string(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type LeaveRequest = z.infer<typeof leaveRequestSchema>;
export type WorkSchedule = z.infer<typeof workScheduleSchema>;
export type EmploymentRecord = z.infer<typeof employmentRecordSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type HRDocument = z.infer<typeof hrDocumentSchema>;