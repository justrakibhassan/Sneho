"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import Script from "next/script";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getErrorMessage } from "@/utils/error-handler";
import {
  User,
  MapPin,
  Briefcase,
  Loader2,
  Save,
  Phone,
  Settings as SettingsIcon,
  Navigation,
  Info,
  Camera,
  Award,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import EmergencyContactManager from "@/modules/account/components/EmergencyContactManager";

// ✅ Type Safety: Input Interface
interface IProfileInput {
  name: string;
  phone: string;
  location: string;
  profilePicture?: string;
  // Parent fields
  minBudget?: number;
  maxBudget?: number;
  situation?: string;
  requiredDays?: string;
  // Sitter fields
  bio?: string;
  experienceYears?: number;
  hourlyRate?: number;
  dob?: string;
  gender?: string;
  skills?: string;
  // GPS fields
  latitude?: number;
  longitude?: number;
}

function SettingsContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "emergency">(
    "profile"
  );

  const { register, handleSubmit, setValue, watch } = useForm<IProfileInput>();

  // Check for setup mode from query params
  useEffect(() => {
    const isSetup = searchParams?.get("setup") === "parent";
    const redirect = searchParams?.get("redirect");

    if (isSetup) {
      setSetupMode(true);
      if (redirect) setRedirectPath(redirect);
      toast("Please complete your parent profile to book a sitter", {
        icon: "👨‍👩‍👧",
        duration: 5000,
      });
    }
  }, [searchParams]);

  // 🌐 GPS: Get Current Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue("latitude", latitude);
        setValue("longitude", longitude);
        toast.success("GPS coordinates captured!");
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        toast.error("Permission denied. Please allow location access.");
        setIsLocating(false);
      }
    );
  };

  // 📥 Load Data from Backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        const data = response.data.user;

        // Basic Info
        setValue("name", data.name);
        setValue("phone", data.phoneNumber || "");
        setValue("profilePicture", data.profilePicture || "");

        // Role Based Data
        if (data.role === "PARENT" && data.parent) {
          setValue("location", data.parent.locationAddress || "");
          setValue("minBudget", data.parent.minBudget);
          setValue("maxBudget", data.parent.maxBudget);
          setValue("situation", data.parent.situation || "");
          setValue("requiredDays", data.parent.requiredDays || "");
        } else if (data.role === "BABYSITTER" && data.babysitter) {
          setValue("location", data.babysitter.locationAddress || "");
          setValue("bio", data.babysitter.bio || "");
          setValue("experienceYears", data.babysitter.experienceYears);
          setValue("hourlyRate", data.babysitter.hourlyRate);
          setValue("latitude", data.babysitter.latitude);
          setValue("longitude", data.babysitter.longitude);
          setValue(
            "dob",
            data.babysitter.dob
              ? new Date(data.babysitter.dob).toISOString().split("T")[0]
              : ""
          );
          setValue("gender", data.babysitter.gender || "");
          setValue("skills", data.babysitter.skills || "");
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        toast.error(getErrorMessage(error, "Could not load profile data."));
      }
    };

    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated, setValue]);

  // ☁️ Cloudinary Upload Widget
  const openUploadWidget = () => {
    if (typeof window !== "undefined" && window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: "input-gears",
          uploadPreset: "input-gears",
          sources: ["local", "url", "camera"],
          multiple: false,
          cropping: true,
          showSkipCropButton: false,
          croppingAspectRatio: 1,
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            setValue("profilePicture", imageUrl, { shouldDirty: true });
            toast.success("Profile picture updated!");
            widget.close();
          }

          // 🔥 Critical Fix: Restore scrolling if it gets stuck
          if (
            result &&
            (result.event === "closed" || result.event === "close")
          ) {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "auto";
          }
        }
      );
      widget.open();
    } else {
      toast.error("Cloudinary widget not ready");
    }
  };

  // 📤 Update Profile
  const onSubmit: SubmitHandler<IProfileInput> = async (formData) => {
    setIsSaving(true);
    try {
      const response = await axiosInstance.put(
        "/user/update-profile",
        formData
      );

      if (response.data.success) {
        toast.success("Settings updated successfully!");
        // Update LocalStorage to reflect new user data
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Redirect back if in setup mode
        if (setupMode && redirectPath) {
          setTimeout(() => {
            router.push(redirectPath);
          }, 1000);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to update settings."));
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading)
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-teal-600 h-10 w-10" />
        <p className="text-slate-500 font-medium">Loading settings...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 pb-20">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
        {/* Setup Mode Alert */}
        {setupMode && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-1 shadow-xl shadow-purple-200">
            <div className="bg-white rounded-[1.4rem] p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg text-slate-900 mb-1">
                  Complete Your Parent Profile
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  To book a babysitter, please complete your parent profile
                  below. Add your location, budget, and preferences.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Hero Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2.5rem] blur-2xl opacity-10 -z-10" />
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-2xl shadow-slate-200/50">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
                  <SettingsIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Account Settings
                  </h1>
                  <p className="text-slate-500 mt-1 font-medium">
                    Manage your professional profile
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="px-5 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-full border border-teal-100">
                  <span className="text-xs font-black text-teal-700 uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <User size={18} />
              <span>Profile Info</span>
            </button>
            <button
              onClick={() => setActiveTab("emergency")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "emergency"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ShieldAlert size={18} />
              <span>Emergency</span>
            </button>
          </div>
        </div>

        {activeTab === "profile" ? (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Modern Section Header */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-teal-50 opacity-50" />
              <div className="relative px-10 py-8 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Personal Information
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Update your profile details
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-10">
              {/* Section 0: Avatar Upload */}
              <div className="flex flex-col items-center gap-4 pb-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-slate-50 p-1.5 shadow-xl ring-4 ring-white overflow-hidden">
                    {watch("profilePicture") ? (
                      <Image
                        src={watch("profilePicture")!}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300">
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openUploadWidget}
                    className="absolute inset-0 bg-black/40 text-white rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">
                        Change
                      </span>
                    </div>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  Click image to upload a new profile picture
                </p>
              </div>

              {/* Section 1: Basic Info */}
              <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="group relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                      <input
                        {...register("name", { required: true })}
                        placeholder="Enter your name"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      Phone Number
                    </label>
                    <div className="group relative">
                      <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                      <input
                        {...register("phone")}
                        placeholder="017xxxxxxxx"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      Primary Address
                    </label>
                    <div className="group relative">
                      <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                      <input
                        {...register("location")}
                        placeholder="House, Road, Area, City"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 2: Role Based Inputs */}
              {user?.role === "PARENT" || setupMode ? (
                <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white shadow-sm space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Info className="h-4 w-4 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                      Parent Preferences
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Min Budget (TK)
                      </label>
                      <input
                        type="number"
                        {...register("minBudget")}
                        className="w-full p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Max Budget (TK)
                      </label>
                      <input
                        type="number"
                        {...register("maxBudget")}
                        className="w-full p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Required Days
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => {
                          const isSelected = watch("requiredDays")?.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const current = watch("requiredDays") || "";
                                const days = current
                                  .split(",")
                                  .filter((d) => d.trim());
                                if (isSelected) {
                                  const updated = days
                                    .filter((d) => d !== day)
                                    .join(",");
                                  setValue("requiredDays", updated);
                                } else {
                                  const updated = [...days, day].join(",");
                                  setValue("requiredDays", updated);
                                }
                              }}
                              className={`px-5 py-3 rounded-2xl text-[11px] font-black transition-all border-2 ${
                                isSelected
                                  ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-transparent shadow-lg shadow-teal-100 scale-105"
                                  : "bg-white text-slate-500 border-slate-100 hover:border-teal-200 hover:bg-teal-50/50"
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-tighter">
                        Select the days you need babysitting services
                      </p>
                    </div>
                    <div className="md:col-span-2 space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Special Situation / Notes
                      </label>
                      <textarea
                        {...register("situation")}
                        rows={4}
                        placeholder="Describe your family or any specific requirements..."
                        className="w-full p-5 bg-slate-50/50 border border-slate-200/60 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all resize-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white shadow-sm space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                      Professional Sitter Profile
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Birthday
                      </label>
                      <input
                        type="date"
                        {...register("dob")}
                        className="w-full p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Gender
                      </label>
                      <select
                        {...register("gender")}
                        className="w-full p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        {...register("experienceYears")}
                        className="w-full p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Hourly Rate (TK)
                      </label>
                      <div className="group relative">
                        <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm group-focus-within:text-teal-500 transition-colors">
                          ৳
                        </span>
                        <input
                          type="number"
                          {...register("hourlyRate")}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Specialized Skills
                      </label>
                      <div className="group relative">
                        <Award className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                          {...register("skills")}
                          placeholder="e.g. CPR, First Aid, Cooking"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Professional Bio
                      </label>
                      <textarea
                        {...register("bio")}
                        rows={5}
                        placeholder="Write a short professional bio..."
                        className="w-full p-5 bg-slate-50/50 border border-slate-200/60 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all resize-none placeholder:text-slate-400"
                      />
                    </div>

                    {/* GPS Location Capture Section */}
                    <div className="md:col-span-2 bg-gradient-to-br from-teal-50/50 to-emerald-50/30 p-8 rounded-[2rem] border border-teal-100/50 space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="font-black text-teal-900 text-sm uppercase tracking-wider">
                            GPS Tracking
                          </h4>
                          <p className="text-xs text-teal-600 font-medium">
                            Ensure parents find you based on your live location.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isLocating}
                          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95 disabled:opacity-50"
                        >
                          {isLocating ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Navigation className="h-4 w-4" />
                          )}
                          {isLocating ? "Locating..." : "Get Live GPS"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">
                            Latitude
                          </label>
                          <input
                            {...register("latitude")}
                            readOnly
                            className="w-full bg-white/80 backdrop-blur-sm border border-teal-100 p-3.5 rounded-xl text-xs font-bold text-slate-600 outline-none shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">
                            Longitude
                          </label>
                          <input
                            {...register("longitude")}
                            readOnly
                            className="w-full bg-white/80 backdrop-blur-sm border border-teal-100 p-3.5 rounded-xl text-xs font-bold text-slate-600 outline-none shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100/60">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Ready to update
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="group relative w-full md:w-auto overflow-hidden bg-slate-900 text-white px-12 py-4 rounded-[1.5rem] font-black text-sm transition-all hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3">
                    {isSaving ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>
                      {isSaving ? "Synchronizing..." : "Save All Changes"}
                    </span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-8 lg:p-12">
            <EmergencyContactManager />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="animate-spin text-teal-600 h-10 w-10" />
          <p className="text-slate-500 font-medium">Loading settings...</p>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
