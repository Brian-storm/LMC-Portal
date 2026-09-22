import { z } from "zod";

// ── GeneralFaqCategory schemas ──

export const generalFaqCategoryCreateSchema = z.object({
  nameZh: z.string().min(1, "nameZh is required"),
  nameEn: z.string().min(1, "nameEn is required"),
  nameZhCn: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export type GeneralFaqCategoryCreateInput = z.infer<typeof generalFaqCategoryCreateSchema>;

export const generalFaqCategoryUpdateSchema = generalFaqCategoryCreateSchema.partial();

export type GeneralFaqCategoryUpdateInput = z.infer<typeof generalFaqCategoryUpdateSchema>;

// ── GeneralFaq schemas ──

export const generalFaqCreateSchema = z.object({
  categoryId: z.string().min(1, "categoryId is required"),
  questionZh: z.string().min(1, "questionZh is required"),
  questionEn: z.string().min(1, "questionEn is required"),
  questionZhCn: z.string().optional(),
  answerZh: z.string().min(1, "answerZh is required"),
  answerEn: z.string().min(1, "answerEn is required"),
  answerZhCn: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export type GeneralFaqCreateInput = z.infer<typeof generalFaqCreateSchema>;

export const generalFaqUpdateSchema = generalFaqCreateSchema.partial();

export type GeneralFaqUpdateInput = z.infer<typeof generalFaqUpdateSchema>;