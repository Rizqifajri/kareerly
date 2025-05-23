import { createSkills } from "@/api/user/skills/create-skills";
import { SkillsFormValues } from "@/app/(authenticated)/form-user-data/_types/skills-types";
import { useMutation } from "@tanstack/react-query";

export const useCreateSkillsQuery = () => {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: SkillsFormValues;
      //@ts-ignore
    }) => createSkills(userId, data),
    onError: (error: any) => console.error("create skill failed", error),
  });
};
