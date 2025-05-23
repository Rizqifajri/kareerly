// skills-schema.ts
import { z } from "zod";

export const fullSkillSchema = z.object({
  soft_skill: z.array(z.string()).max(10),
  hard_skill: z.array(z.string()).max(10),
  languages: z.array(z.string()).max(10),
});
