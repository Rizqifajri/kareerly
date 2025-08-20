import { client } from "@/db/instance";
import type { RecordModel } from "pocketbase";
import { useCallback, useState } from "react";

interface SignUpData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  username?: string; // optional override
}

/** Gabung pesan error field-level dari PocketBase */
function getPbErrorMessage(e: any): string {
  const base = e?.response?.message || e?.message || "Request failed";
  const data = e?.response?.data;
  if (!data) return base;

  const fields = Object.entries(data)
    .map(([k, v]: any) => {
      const msg = v?.message || v?.code || "invalid";
      return `${k}: ${msg}`;
    })
    .join(", ");

  return fields ? `${base} (${fields})` : base;
}

/** Buat username unik dari email/nama */
function makeUsername(email: string, name?: string) {
  const seed =
    (name?.trim() || email.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "user";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${seed}_${suffix}`.slice(0, 32); // jaga-jaga max length rule
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authData = await client.collection("users").authWithPassword(email, password);
      return authData; // { record, token }
    } catch (e: any) {
      const msg = getPbErrorMessage(e);
      console.error("Login failed:", e?.response ?? e);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData): Promise<RecordModel> => {
    setIsLoading(true);
    setError(null);
    try {
      // Banyak instance PB prod mewajibkan "username" unik → kita isi selalu agar aman.
      const username = data.username ?? makeUsername(data.email, data.name);

      const newUser = await client.collection("users").create({
        username,
        name: data.name ?? "",
        email: data.email,
        emailVisibility: true,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        // Tambah field lain yang mungkin required di PROD (isi default kosong):
        // full_name: "",
        // phone: "",
      });

      // (opsional) auto-login setelah signup
      await client.collection("users").authWithPassword(data.email, data.password);

      // (opsional) kalau verifikasi email diaktifkan di PB, kirim email verifikasi
      try {
        await client.collection("users").requestVerification(data.email);
      } catch {
        /* abaikan kalau fitur tidak aktif */
      }

      return newUser;
    } catch (e: any) {
      const msg = getPbErrorMessage(e);
      console.error("Sign up failed:", e?.response ?? e);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logOut = useCallback(() => {
    client.authStore.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, []);

  return { login, signUp, logOut, isLoading, error };
};
