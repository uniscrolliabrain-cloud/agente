import { z } from "zod";

export const paymentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const refundSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const disputeSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const paymentCustomerSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type Refund = z.infer<typeof refundSchema>;
export type Dispute = z.infer<typeof disputeSchema>;
export type PaymentCustomer = z.infer<typeof paymentCustomerSchema>;
