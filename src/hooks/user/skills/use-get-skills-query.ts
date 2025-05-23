import { getExperience } from "@/api/user/experience/get-experience";
import { getAllSkills, getSkills } from "@/api/user/skills/get-skills";
import { useQuery } from "@tanstack/react-query";

export const useGetAllSkillsQuery = () => {
  return useQuery({
    queryKey: ["all_skills"],
    queryFn: () => getAllSkills(),
  });
}

export const useGetSkillsQuery = (userId: string) => {
  return useQuery({
    queryKey: ["skills", userId],
    queryFn: () => getSkills(userId),
    enabled: !!userId, 
  });
};
