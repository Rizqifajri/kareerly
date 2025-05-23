import { client } from "@/db/instance";

export const getAllSkills = async () => {
  return await client.collection("skills").getFullList(); 
};

export const getSkills = async (userId: string) => {
  return await client.collection("skills").getFullList({
    filter: `user = '${userId}'`,
  }); 
};