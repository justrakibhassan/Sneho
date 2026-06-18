"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Loader2, ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";

interface IResetPasswordInput {
  password: string;
  confirmPassword: string;
}

interface IErrorResponse {
  message: string;
  success: boolean;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IResetPasswordInput>();

  const onSubmit: SubmitHandler<IResetPasswordInput> = async (data) => {
    if (!token) {
      toast.error("Invalid reset token. Please request a new one.");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        token,
        password: data.password,
      });

      if (response.data.success) {
        toast.success("Password reset successful!");
        router.push("/login");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<IErrorResponse>;
        toast.error(
          serverError.response?.data?.message || "Failed to reset password."
        );
      }
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">
          No reset token found.
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#F97316] hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-600 ml-1">
          New Password
        </label>
        <div className="relative group/pass">
          <input
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            })}
            type={showPassword ? "text" : "password"}
            className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 pr-11 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-[#F97316] outline-none transition-all placeholder:text-slate-300"
            placeholder="Enter new password"
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

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-600 ml-1">
          Confirm Password
        </label>
        <div className="relative group/pass">
          <input
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val: string) => {
                if (watch("password") !== val) {
                  return "Passwords do not match";
                }
              },
            })}
            type={showConfirmPassword ? "text" : "password"}
            className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 pr-11 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-[#F97316] outline-none transition-all placeholder:text-slate-300"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-50"
            aria-label={
              showConfirmPassword ? "Hide password" : "Show password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 font-bold ml-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#1E293B] hover:bg-black text-white font-black py-4 rounded-xl shadow-lg shadow-slate-900/10 transition-all flex justify-center items-center gap-2 disabled:opacity-70 active:scale-95 text-lg"
      >
        {isSubmitting ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FB] p-4 lg:p-8 pt-32 pb-20">
      <div className="w-full max-w-xl bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl overflow-hidden p-8 md:p-12 lg:p-16 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 text-teal-600 rounded-full mb-4">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-[#1E293B]">
            Set New Password
          </h1>
          <p className="text-slate-500 font-medium">
            Please enter your new password below.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center pt-4 border-t border-slate-50">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
