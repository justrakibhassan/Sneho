"use client";

import React from "react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

interface IForgotPasswordInput {
  email: string;
}

interface IErrorResponse {
  message: string;
  success: boolean;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IForgotPasswordInput>();

  const onSubmit: SubmitHandler<IForgotPasswordInput> = async (data) => {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", data);
      if (response.data.success) {
        toast.success(response.data.message || "Reset link sent!");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<IErrorResponse>;
        toast.error(
          serverError.response?.data?.message || "Failed to send reset link."
        );
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FB] p-4 lg:p-8 pt-32 pb-20">
      <div className="w-full max-w-xl bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl overflow-hidden p-8 md:p-12 lg:p-16 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black text-[#1E293B]">
            Forgot Password?
          </h1>
          <p className="text-slate-500 font-medium">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 active:scale-95 text-lg"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#4F81C7] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
