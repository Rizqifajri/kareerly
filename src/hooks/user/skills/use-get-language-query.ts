import { getLanguage } from "@/api/user/skills/languages/get-language";
import { useQuery } from "@tanstack/react-query";

export const useGetLanguageQuery = () => {
  return useQuery({
    queryKey: ["languages"],
    queryFn: () => getLanguage(),
  });
}