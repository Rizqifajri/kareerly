import { getGeneralInfo } from "@/api/user/general/get-general-info";
import { useQuery } from "@tanstack/react-query";

export const useGetGeneralQuery = (userId: string) => {
  return useQuery({
    queryKey: ["generalInfo", userId],
    queryFn: () => getGeneralInfo(userId),
    enabled: !!userId,
  });
};
