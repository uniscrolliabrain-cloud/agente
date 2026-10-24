// 06-google-calendar — entidades canonicas del workspace de agenda.
// Derivado del analisis de Google Calendar API v3 (events, calendars,
// acl, freebusy, settings).

import { z } from "zod";

export const calendarSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  timezone: z.string().max(100).default("Europe/Madrid"),
  primary: z.boolean().default(false),
  color: z.string().max(50).optional(),
});

export const calendarEventSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  calendarId: z.string().min(1).max(200),
  externalId: z.string().max(200).optional(),
  title: z.string().max(500),
  description: z.string().max(10000).optional(),
  location: z.string().max(1000).optional(),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean().default(false),
  timezone: z.string().max(100).default("Europe/Madrid"),
  status: z.enum(["confirmed","tentative","cancelled"]).default("confirmed"),
  visibility: z.enum(["default","public","private"]).default("default"),
  recurrence: z.array(z.string().max(500)).default([]),
  participantIds: z.array(z.string().min(1).max(200)).default([]),
  organizerId: z.string().max(200).optional(),
  linkedEntityId: z.string().max(200).optional(),
  linkedEntityType: z.string().max(100).optional(),
  reminders: z.array(z.object({
    minutesBefore: z.number().int().nonnegative(),
    method: z.enum(["email","popup","sms"]).default("popup"),
  })).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const participantSchema = z.object({
  id: z.string().min(1).max(200),
  eventId: z.string().min(1).max(200),
  contactId: z.string().max(200).optional(),
  email: z.string().max(500).optional(),
  displayName: z.string().max(400).optional(),
  role: z.enum(["organizer","attendee","optional","resource"]).default("attendee"),
  responseStatus: z.enum(["accepted","declined","tentative","needsAction"]).default("needsAction"),
});

export const reminderSchema = z.object({
  id: z.string().min(1).max(200),
  eventId: z.string().min(1).max(200),
  minutesBefore: z.number().int().nonnegative(),
  method: z.enum(["email","popup","sms"]).default("popup"),
  sent: z.boolean().default(false),
  sentAt: z.string().optional(),
});

export const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  available: z.boolean(),
});

export type Calendar = z.infer<typeof calendarSchema>;
export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type TimeSlot = z.infer<typeof timeSlotSchema>;