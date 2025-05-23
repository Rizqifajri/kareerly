import { getHardSkill } from "@/api/user/skills/hard-skills/get-hard-skill";
import { getSoftSkill } from "@/api/user/skills/soft-skills/get-soft-skill";
import { useQuery } from "@tanstack/react-query";

export const useGetHardSkill = () => {
  return useQuery({
    queryKey: ["hard_skill"],
    queryFn: () => getHardSkill(),
  });
};
