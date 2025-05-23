
import { z } from "zod";
import { experienceSchema } from "../_schema/experience-schema";

export type ExperienceFormValues = z.infer<typeof experienceSchema>;
