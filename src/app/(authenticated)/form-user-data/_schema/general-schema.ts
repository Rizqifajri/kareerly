import { z } from "zod";


export const generalInfoSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  major: z.string().min(1, "Major is required"),
  work_preference: z.string().min(1, "Work preference is required"),
  country: z.string().min(1, "Country is required"),
  location: z.string().min(1, "Location is required"),
  preferred_work_setting: z.string()
  .min(1, "Preferred work settings is required")
  .transform(val => z.enum(["internship", "fulltime"]).parse(val)),
});