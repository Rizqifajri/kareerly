import { client } from "@/db/instance";
import { ExperienceFormValues } from "@/app/(authenticated)/form-user-data/_types/experience-types";
import { updateGeneralInfo } from "../general/update-general-info";

export const createExperience = async (userId: string, data: ExperienceFormValues) => {
  const experienceRecord = await client.collection("experience").create({
    user: userId,
    ...data,
  });

  // Ambil user saat ini
  const user = await client.collection("users").getOne(userId);

  // Gabungkan experience baru ke relasi users.experience[]
  const updatedExperience = [...(user.experience || []), experienceRecord.id];

  // Gunakan fungsi yang sudah ada untuk update users
  await updateGeneralInfo(userId, {
    data: { experience: updatedExperience },
  });

  return experienceRecord;
};
