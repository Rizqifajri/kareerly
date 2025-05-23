import { client } from "@/db/instance";

export const getExperience = async (userId: string) => {
  return await client.collection("experience").getFullList({
    filter: `user = '${userId}'`,
  }); 
};
