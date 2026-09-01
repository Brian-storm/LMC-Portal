import { z } from "zod";

// ── Nested schemas used by course create/update ──

const syllabusItemSchema = z.object({
  moduleNumber: z.number().int().positive(),
  titleZh: z.string().min(1, "titleZh is required"),
  titleEn: z.string().min(1, "titleEn is required"),
  duration: z.string().min(1, "duration is required"),
  topicsZh: z.array(z.string()),
  topicsEn: z.array(z.string()),
  sortOrder: z.number().int().min(0).default(0),
});

const scheduleSchema = z.object({
  dateAndTime: z.string().min(1, "dateAndTime is required"),
  venue: z.string().min(1, "venue is required"),
  quotaRemaining: z.number().int().min(0, "quotaRemaining cannot be negative"),
  isActive: z.boolean().default(true),
});

const faqSchema = z.object({
  questionZh: z.string().min(1, "questionZh is required"),
  questionEn: z.string().min(1, "questionEn is required"),
  answerZh: z.string().min(1, "answerZh is required"),
  answerEn: z.string().min(1, "answerEn is required"),
  sortOrder: z.number().int().min(0).default(0),
});

// Reference to an existing instructor — only the ID is needed
const instructorIdSchema = z.object({
  instructorId: z.string().min(1, "instructorId is required"),
});

// ── Full create schema — all fields required except nested arrays ──

export const courseCreateSchema = z.object({
  slug: z
    .string()
    .min(1, "slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  nameZh: z.string().min(1, "nameZh is required"),
  nameEn: z.string().min(1, "nameEn is required"),
  descriptionZh: z.string().optional(),
  descriptionEn: z.string().optional(),
  category: z.string().min(1, "category is required"),
  iaRefNumber: z.string().optional(),
  accreditationBody: z.string().optional(),
  cpdHours: z.number().int().min(0, "cpdHours cannot be negative"),
  price: z.number().min(0, "price cannot be negative"),
  capacity: z.number().int().min(0, "capacity cannot be negative"),
  registrationStatus: z
    .enum(["OPEN", "FEW_SEATS", "FULL", "CLOSED"])
    .default("OPEN"),
  deliveryMode: z.string().optional(),
  language: z.string().optional(),
  instructors: z.array(instructorIdSchema).optional(),
  syllabusItems: z.array(syllabusItemSchema).optional(),
  schedules: z.array(scheduleSchema).optional(),
  faqs: z.array(faqSchema).optional(),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;

// ── Partial update — derived from create, all optional, slug excluded ──

export const courseUpdateSchema = courseCreateSchema.partial().omit({ slug: true });

export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;