import { client } from "@/db/instance";

export const getLanguage = async () => {
  return await client.collection("languages").getFullList(); 
};