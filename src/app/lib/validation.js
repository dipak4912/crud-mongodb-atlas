import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  age: z.coerce.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120").optional().or(z.literal("")),
});
