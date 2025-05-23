import { z } from "zod";
import { fullSkillSchema } from "../_schema/skills-schema";

export type SkillsFormValues = z.infer<typeof fullSkillSchema>;
