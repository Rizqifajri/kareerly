import { client } from "@/db/instance";
import { RecordModel } from "pocketbase";
import { useState } from "react"

interface SignUpData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    // login logic
    try {
      const authData = await client.collection("users").authWithPassword(email, password);
      return authData
    } catch(err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed");
      throw err;
    }finally{
      setIsLoading(false);
    }

  }

  const signUp = async (data: SignUpData): Promise<RecordModel> => {
    setIsLoading(true);
    setError(null);
    try{
      const newUser = await client.collection("users").create({
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm
      });
      return newUser
    }catch(err: any) {
      console.error("Sign up failed:", err);
      setError(err.message || "Sign up failed");
      throw err;
    }finally{
      setIsLoading(false);
    }
  }

  return {
    login,
    signUp,
    isLoading,
    error
  }
}
