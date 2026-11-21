import { z } from "zod";

export const privacyRequestType = z.enum([
  "access",
  "portability",
  "rectification",
  "erasure",
  "restriction",
  "objection",
]);

export const privacyRequestInput = z.strictObject({
  id: z.uuid(),
  type: privacyRequestType,
});

export type PrivacyRequestType = z.infer<typeof privacyRequestType>;
export interface PrivacyRequest {
  id: string;
  type: PrivacyRequestType;
  status: "received" | "in_review" | "answered";
  createdAt: string;
  updatedAt: string;
}
