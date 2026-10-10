// 23-buffer — entidades canonicas del workspace de redes sociales.
// Derivado del analisis de Buffer API (posts, channels, profiles,
// schedules, analytics, ideas, comments).

import { z } from "zod";

export const socialChannelSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  kind: z.enum(["instagram","facebook","twitter","linkedin","tiktok","youtube","pinterest","threads","google_business"]),
  accountName: z.string().max(200),
  accountId: z.string().max(200).optional(),
  avatarUrl: z.string().max(2000).optional(),
  connected: z.boolean().default(false),
  connectedAt: z.string().optional(),
  revokedAt: z.string().optional(),
});

export const socialPostSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  channelId: z.string().min(1).max(200),
  body: z.string().max(10000),
  title: z.string().max(500).optional(),
  link: z.string().max(2000).optional(),
  assetUrls: z.array(z.string().max(2000)).default([]),
  hashtags: z.array(z.string().max(100)).default([]),
  mentions: z.array(z.string().max(100)).default([]),
  kind: z.enum(["post","story","reel","thread","short","live"]).default("post"),
  status: z.enum(["draft","needs_approval","scheduled","published","failed","cancelled","rejected"]).default("draft"),
  createdBy: z.string().max(200).optional(),
  approvedBy: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publishingScheduleSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  postId: z.string().min(1).max(200),
  scheduledFor: z.string(),
  timezone: z.string().max(100).default("Europe/Madrid"),
  publishedAt: z.string().optional(),
  failureReason: z.string().max(2000).optional(),
});

export const postMetricSchema = z.object({
  id: z.string().min(1).max(200),
  postId: z.string().min(1).max(200),
  measuredAt: z.string(),
  impressions: z.number().int().nonnegative().default(0),
  reach: z.number().int().nonnegative().default(0),
  clicks: z.number().int().nonnegative().default(0),
  likes: z.number().int().nonnegative().default(0),
  comments: z.number().int().nonnegative().default(0),
  shares: z.number().int().nonnegative().default(0),
  saves: z.number().int().nonnegative().default(0),
  engagementRate: z.number().min(0).default(0),
});

export const socialIdeaSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  title: z.string().max(400),
  notes: z.string().max(5000).optional(),
  sourceUrl: z.string().max(2000).optional(),
  tags: z.array(z.string().max(100)).default([]),
  status: z.enum(["idea","planned","used","discarded"]).default("idea"),
  createdAt: z.string(),
});

export type SocialChannel = z.infer<typeof socialChannelSchema>;
export type SocialPost = z.infer<typeof socialPostSchema>;
export type PublishingSchedule = z.infer<typeof publishingScheduleSchema>;
export type PostMetric = z.infer<typeof postMetricSchema>;
export type SocialIdea = z.infer<typeof socialIdeaSchema>;