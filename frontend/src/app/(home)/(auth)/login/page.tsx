"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ILoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface IErrorResponse {
  message: string;
  success: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginInput>();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/account");
    }
  }, [isLoading, isAuthenticated, router]);

  const onSubmit: SubmitHandler<ILoginInput> = async (data) => {
    try {
      const response = await axiosInstance.post("/auth/login", data);
      if (response.data.success) {
        login(response.data.token, response.data.user);
        toast.success("Login successful!");
        router.push("/account");
        router.refresh();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<IErrorResponse>;
        toast.error(serverError.response?.data?.message || "Login failed.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <Loader2 className="animate-spin text-teal-600 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FB] p-4 lg:p-8 pt-32 pb-20">
      <div className="w-full max-w-5xl bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-700">
        {/* Left Section: Form */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#1E293B]">
              Welcome Back!
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">
                Email
              </label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-[#F97316] outline-none transition-all placeholder:text-slate-300"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-bold ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">
                Password
              </label>
              <div className="relative group/pass">
                <input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 pr-11 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-[#F97316] outline-none transition-all placeholder:text-slate-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-bold ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 rounded border-slate-300 text-[#F97316] focus:ring-[#F97316]"
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                  Remember Me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-[#4F81C7] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 active:scale-95 text-lg"
            >
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center gap-4 py-2 text-slate-400">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
              Or login with
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all group active:scale-95">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-xs font-black text-slate-700">
                Continue with Google
              </span>
            </button>
            <button className="flex items-center justify-center gap-3 px-4 py-3 bg-[#3B5998] hover:bg-[#344e86] border border-[#3B5998] rounded-lg transition-all group active:scale-95">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-xs font-black text-white">
                Continue with Facebook
              </span>
            </button>
          </div>

          <p className="text-center text-sm font-bold text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#F97316] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Right Section: Illustration */}
        <div className="hidden lg:flex flex-1 bg-[#F8F9FB] items-center justify-center p-12">
          <div className="relative w-full aspect-square max-w-md">
            <Image
              src="/images/login-illustration.png"
              alt="Login illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
