// src/hooks/use-user-query.ts
import { getCurrentUser } from "@/api/user/user";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUserQuery = (userId?: string) => {
  return useQuery({
    queryKey: ["current-user", userId],
    queryFn: () => getCurrentUser(userId!), // kita sudah guard di enabled
    enabled: !!userId, // hanya jalan kalau userId sudah ada
  });
};
