import { client } from "@/db/instance";
import { User } from "../user";

export const updateGeneralInfo = async (
  userId: string,
  {
    data,
  }: {
    data: Partial<User>;
  }
) => {
  try {
    const mergedData = { ...data };

    if (data?.experience) {
      mergedData.experience = data.experience;
    }

    if (data?.skills) {
      mergedData.skills = data.skills;
    }

    return await client.collection("users").update(userId, mergedData);
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
};
