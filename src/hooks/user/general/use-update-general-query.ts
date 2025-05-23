import { updateGeneralInfo } from "@/api/user/general/update-general-info";
import { useMutation } from "@tanstack/react-query";

export const useUpdateGeneralQuery = () => {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      updateGeneralInfo(userId, data),
  });
};
