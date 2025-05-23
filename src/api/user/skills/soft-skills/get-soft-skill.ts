import { client } from "@/db/instance";


export const getSoftSkill = async () => {
  return await client.collection("soft_skill").getFullList(); 
};