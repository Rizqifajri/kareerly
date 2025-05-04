'use client';

import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthProviderInfo, RecordModel as PbRecord } from "pocketbase";
import { client } from "@/db/instance";

interface PbUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string;
}

interface AuthContextType {
  isPending: boolean;
  user: PbUser | null;
  googleSignIn: () => void;
  setUserData: (user: PbRecord) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isPending, setIsPending] = useState(true);
  const [user, setUser] = useState<PbUser | null>(null);
  const [googleAuthProvider, setGoogleAuthProvider] = useState<AuthProviderInfo | null>(null);

  //set user data ke state dan localStorage
  const setUserData = (pbUser: PbRecord) => {
    const { id, name, email, username, avatarUrl } = pbUser;
    const userData = { id, name, email, username, avatarUrl };
    setUser(userData);
    localStorage.setItem("pb_user", JSON.stringify(userData));
  };

  //sign out
  const signOut = () => {
    setUser(null);
    localStorage.removeItem("pb_user");
    client.authStore.clear();
    router.push("/auth/login");
  };

  //google
  const googleSignIn = () => {
    signOut(); 
    if (!googleAuthProvider) return;
    localStorage.setItem("provider", JSON.stringify(googleAuthProvider));
    const redirectUrl = `${location.origin}/auth/login`;
    const url = googleAuthProvider.authURL + redirectUrl;
    router.push(url);
  };

  useEffect(() => {
    const initAuth = async () => {
      const authModel = client.authStore.model as PbRecord | null;

      if (authModel) {
        setUserData(authModel);
      } else {
        // fallback to localStorage
        const stored = localStorage.getItem("pb_user");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch (err) {
            console.error("Failed to parse stored user:", err);
          }
        }
      }

      if (pathname === "/auth/login") {
        try {
          const authMethods = await client.collection("users").listAuthMethods();
          const googleProvider = authMethods.oauth2.providers.find(p => p.name === "google");
          if (googleProvider) {
            setGoogleAuthProvider(googleProvider);
          }
        } catch (err) {
          console.error("Failed to list auth methods:", err);
        }
      }

      setIsPending(false);
    };

    initAuth();
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ isPending, user, googleSignIn, setUserData, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};


export const usePbAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("usePbAuth must be used within AuthWrapper");
  return context;
};

export default AuthWrapper;
