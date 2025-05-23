import { getExperience } from "@/api/user/experience/get-experience";
import { useQuery } from "@tanstack/react-query";

export const useGetExperienceQuery = (userId: string) => {
  return useQuery({
    queryKey: ["experience", userId],
    queryFn: () => getExperience(userId),
    enabled: !!userId, 
  });
};
