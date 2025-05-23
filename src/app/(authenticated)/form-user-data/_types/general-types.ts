import { z } from "zod";
import { generalInfoSchema } from "../_schema/general-schema";

export type GeneralFormValues = z.infer<typeof generalInfoSchema>;
