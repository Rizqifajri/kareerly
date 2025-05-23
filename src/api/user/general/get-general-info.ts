import { client } from "@/db/instance";

export const getGeneralInfo = async (userId: string) => {
  return await client.collection("users").getOne(userId);
};