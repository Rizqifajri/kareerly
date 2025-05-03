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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthMiddleware } from "../middleware";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "../_hooks/use-auth";
import { ArrowBigRight, ArrowRight } from "lucide-react";

// Schema validasi menggunakan Zod
const formSchema = z
  .object({
    name: z.string().min(1, "Fullname is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignUpFormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        passwordConfirm: values.confirmPassword,
      });

      toast.success("Account created successfully!", {
        duration: 5000
      });
      form.reset();

      // Redirect ke halaman home setelah berhasil
      router.push("/auth/login");
    } catch (err: any) {
      toast.error("Create account failed: " + (err?.message || "Unknown error"),{
        duration: 5000
      });
    }
  };

  return (
    <AuthMiddleware>
      <div className="h-screen w-[500px] mx-auto flex flex-col items-center justify-center">
        <h1 className="text-[48px] font-extrabold text-left w-full dark:text-white">Sign Up</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fullname</FormLabel>
                  <FormControl>
                    <Input placeholder="Fullname" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="rounded-full cursor-pointer bg-white text-black hover:bg-white border" type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"} <ArrowRight className="ml-2 items-center" />
            </Button>
          </form>
        </Form>
        <Toaster position="bottom-right" />       
      </div>
    </AuthMiddleware>
  );
};

export default SignUp;
