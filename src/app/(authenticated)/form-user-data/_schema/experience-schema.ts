import { z } from "zod";

const experienceItemSchema = z.object({
  job_title: z.string().min(1),
  company_name: z.string().min(1),
  from: z.coerce.date(),
  to: z.coerce.date(),
  responsibilities: z.string().min(1, "Responsibilities is required"),
});

export const experienceSchema = z
  .object({
    have_experience_before: z
      .enum(["true", "false"])
      .transform((val) => val === "true"),
    experience: z.array(experienceItemSchema),
  })
  .refine(
    (data) => {
      if (data.have_experience_before) {
        return data.experience.length > 0;
      }
      return true; // kalau tidak punya pengalaman, boleh kosong
    },
    {
      message: "Please add at least one experience",
      path: ["experience"],
    }
  );
