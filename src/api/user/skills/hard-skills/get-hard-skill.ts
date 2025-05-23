import { client } from "@/db/instance";


export const getHardSkill = async () => {
  return await client.collection("hard_skill").getFullList(); 
};