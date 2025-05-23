import { createExperience } from "@/api/user/experience/create-experience";
import { ExperienceFormValues } from "@/app/(authenticated)/form-user-data/_types/experience-types";
import { useMutation } from "@tanstack/react-query";

export const useCreateExperienceQuery = () => {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: ExperienceFormValues;
    }) => createExperience(userId, data),
    onError: (error: any) => console.error("createExperience failed", error),
  });
};
