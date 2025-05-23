import { getSoftSkill } from "@/api/user/skills/soft-skills/get-soft-skill";
import { useQuery } from "@tanstack/react-query";

export const useGetSoftSkill = () => {
  return useQuery({
    queryKey: ["soft_skill"],
    queryFn: () => getSoftSkill(),
  });
};
