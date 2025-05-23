import { client } from "@/db/instance";
import { updateGeneralInfo } from "../general/update-general-info";

export const createSkills = async (
  userId: string,
  data: {
    soft_skill: string[];
    hard_skill: string[];
    languages: string[];
  }
) => {
  const formData = new FormData();
  formData.append("user", userId);
  formData.append("soft_skill", JSON.stringify(data.soft_skill));
  formData.append("hard_skill", JSON.stringify(data.hard_skill));
  formData.append("languages", JSON.stringify(data.languages));

  const skillsRecord = await client.collection("skills").create(formData);


  const user = await client.collection("users").getOne(userId);
  const updatedSkills = [...(user.skills || []), skillsRecord.id];

  await updateGeneralInfo(userId, {
    data: { skills: updatedSkills },
  });

  return skillsRecord;
};
