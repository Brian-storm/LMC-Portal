import { z } from "zod";

export const registerSchema = z.object({
  nameZh: z.string().min(1, "nameZh is required"),
  nameEn: z.string().min(1, "nameEn is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(1, "phone is required"),
  idDocNumber: z.string().min(1, "idDocNumber is required"),
  iaLicense: z.string().optional(),
  organization: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;