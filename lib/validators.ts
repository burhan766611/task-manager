import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional(),
});