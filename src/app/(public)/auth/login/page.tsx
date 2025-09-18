"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { client } from "@/db/instance";
import { AuthProviderInfo } from "pocketbase";
import { useEffect } from "react";
import { usePbAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof formSchema>;

const Login = () => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const { setUserData, googleSignIn, isPending } = usePbAuth();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const authResponse = await client
        .collection("users")
        .authWithPassword(values.email, values.password);

      const user = await client.collection("users").getOne(authResponse.record.id);
      setUserData(user);
      router.push("/home");
    } catch (err: any) {
      console.error("Login failed", err);
      alert("Login failed: " + (err?.message || "Unknown error"));
    }
  };

  const storeUserAndRedirect = (user: any) => {
    setUserData(user);
    router.replace("/home");
  };

  useEffect(() => {
    const localAuthProvider: AuthProviderInfo = JSON.parse(
      localStorage.getItem("provider") as string
    );
    const params = new URL(location.href).searchParams;
    const redirectUrl = `${location.origin}/auth/login`;
    const code = params.get("code");

    if (
      !localAuthProvider ||
      !code ||
      localAuthProvider.state !== params.get("state")
    )
      return;

    client
      .collection("users")
      .authWithOAuth2Code(
        localAuthProvider.name,
        code,
        localAuthProvider.codeVerifier,
        redirectUrl
      )
      .then(async (response) => {
        const user = await client.collection("users").getOne(response.record.id);
        if (user.name && user.avatarUrl) {
          storeUserAndRedirect(user);
        } else {
          client
            .collection("users")
            .update(response.record.id, {
              name: response.meta?.name,
              avatarUrl: response.meta?.avatarUrl,
              emailVisibility: true,
            })
            .then((res) => {
              storeUserAndRedirect(res);
            })
            .catch((err) => {
              console.error(err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="h-screen w-[500px] mx-auto flex flex-col items-center justify-center">
      <h1 className="text-[48px] font-extrabold text-left w-full dark:text-white">Login</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} className="cursor-pointer rounded-full border bg-white text-black hover:bg-white " type="submit"> {isPending ? "Logging in..." : "Login"} <ArrowRight  className="ml-2" /></Button>
        </form>
      </Form>

      <p className="text-center my-4">or</p>

      <div className="flex flex-col gap-3 w-full">
        {/* <Button
          disabled={isPending}
          onClick={googleSignIn}
          className="cursor-pointer rounded-full border bg-white hover:bg-white text-black"
        >
         <Image src={"/google.png"} alt="Google Logo" width={20} height={20} /> Login with Google Account
        </Button> */}
        <p>Don&apos;t have an account? <Link className="underline dark:text-white " href="/auth/sign-up">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
