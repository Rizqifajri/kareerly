// src/api/user/user.ts
import { instance } from "@/lib/instance";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  experience?: string[];
  skills?: string[];
};

export const getCurrentUser = async (id: string): Promise<User> => {
  try {
    const response = await instance.get(`api/collections/users/records/${id}`);
    console.log("Response data:", response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    throw err;
  }
};


