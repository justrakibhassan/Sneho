"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Baby,
  Plus,
  Trash2,
  Heart,
  Activity,
  Loader2,
  X,
  Pencil,
  AlertTriangle,
  Sparkles,
  Zap,
  Smile,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface IChild {
  id: number;
  name: string;
  age: number;
  gender: string;
  stubbornnessLvl: number;
  specialNeeds?: string;
  interests?: string;
  energyLevel?: number;
  temperament?: string;
}

interface IChildInput {
  name: string;
  age: number;
  gender: string;
  stubbornnessLvl: number;
  specialNeeds: string;
  interests: string;
  energyLevel: number;
  temperament: string;
}

export default function ChildrenPage() {
  const { isAuthenticated } = useAuth();
  const [children, setChildren] = useState<IChild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IChildInput>({
    defaultValues: {
      stubbornnessLvl: 1,
      energyLevel: 5,
      temperament: "Moderate",
    },
  });

  const stubbornnessValue = watch("stubbornnessLvl");
  const energyLevelValue = watch("energyLevel");

  // Fetch Data
  const fetchChildren = async () => {
    try {
      const response = await axiosInstance.get("/children");
      if (response.data.success) {
        setChildren(response.data.children);
      }
    } catch (error) {
      console.error("Fetch error", error);
      toast.error("Failed to load children");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchChildren();
  }, [isAuthenticated]);

  // Create or Update Handler
  const onSubmit: SubmitHandler<IChildInput> = async (data) => {
    setIsSubmitting(true);

    try {
      if (editingId) {
        const response = await axiosInstance.put(
          `/children/${editingId}`,
          data
        );

        if (response.data.success) {
          toast.success("Profile updated successfully!");
          setChildren(
            children.map((child) =>
              child.id === editingId ? response.data.child : child
            )
          );
        }
      } else {
        const response = await axiosInstance.post("/children", data);

        if (response.data.success) {
          toast.success("Child added successfully!");
          setChildren([response.data.child, ...children]);
        }
      }
      resetForm();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Operation failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (child: IChild) => {
    setEditingId(child.id);
    setShowForm(true);
    setValue("name", child.name);
    setValue("age", child.age);
    setValue("gender", child.gender);
    setValue("stubbornnessLvl", child.stubbornnessLvl);
    setValue("interests", child.interests || "");
    setValue("specialNeeds", child.specialNeeds || "");
    setValue("energyLevel", child.energyLevel || 5);
    setValue("temperament", child.temperament || "Moderate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const promptDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      await axiosInstance.delete(`/children/${deleteId}`);
      toast.success("Profile deleted");
      setChildren(children.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    reset({
      stubbornnessLvl: 1,
      energyLevel: 5,
      temperament: "Moderate",
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading)
    return (
      <div className="space-y-6 relative">
        {/* Header Skeleton */}
        <div className="bg-linear-to-br from-teal-500 via-teal-600 to-cyan-600 p-8 rounded-3xl">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-9 w-56 bg-white/20" />
              <Skeleton className="h-4 w-96 bg-white/20" />
            </div>
            <Skeleton className="h-12 w-32 rounded-2xl bg-white/20" />
          </div>
        </div>

        {/* Children Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/80 p-6 rounded-3xl border-2 border-slate-100">
              <div className="flex items-start gap-4 mb-6">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6 relative">
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-teal-400/20 to-purple-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-linear-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Delete Profile?
              </h3>
              <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                Are you sure you want to remove this child profile? This action
                cannot be undone and will affect matching.
              </p>
            </div>
            <div className="flex border-t border-slate-100">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all duration-200 border-r border-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-teal-500 via-teal-600 to-cyan-600 p-8 rounded-3xl shadow-xl shadow-teal-200/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Baby className="h-7 w-7 text-white" />
              </div>
              My Children
            </h1>
            <p className="text-teal-50 text-sm">
              Manage profiles for personalized babysitter matching
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3.5 bg-white text-teal-600 rounded-2xl font-bold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add Child
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 animate-in fade-in slide-in-from-top-4 duration-300 relative">
          <div className="absolute inset-0 bg-linear-to-br from-teal-50/50 to-purple-50/50 rounded-3xl -z-10"></div>

          <button
            onClick={resetForm}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-linear-to-br from-teal-500 to-purple-500 rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-linear-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              {editingId ? "Edit Child Profile" : "Add New Child"}
            </h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Smile className="h-4 w-4 text-teal-500" />
                  Child&apos;s Name
                </label>
                <input
                  {...register("name", { required: true })}
                  className="w-full p-3.5 bg-white/70 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-200 font-medium"
                  placeholder="Enter name"
                />
                {errors.name && (
                  <span className="text-xs text-red-500 font-medium">
                    Name is required
                  </span>
                )}
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Age
                  </label>
                  <input
                    type="number"
                    {...register("age", { required: true })}
                    className="w-full p-3.5 bg-white/70 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-200 font-medium"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Gender
                  </label>
                  <select
                    {...register("gender")}
                    className="w-full p-3.5 bg-white/70 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-200 font-medium"
                  >
                    <option value="Male">Boy</option>
                    <option value="Female">Girl</option>
                  </select>
                </div>
              </div>

              {/* Stubbornness Level */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Stubbornness Level (1-5)
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    For better matching
                  </span>
                </label>
                <div className="flex items-center gap-4 bg-linear-to-r from-orange-50 to-red-50 p-5 rounded-2xl border-2 border-orange-100">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    {...register("stubbornnessLvl")}
                    className="w-full h-2.5 bg-linear-to-r from-orange-200 to-red-300 rounded-full appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="min-w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <span className="font-black text-2xl bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      {stubbornnessValue || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  Interests & Hobbies
                </label>
                <input
                  {...register("interests")}
                  className="w-full p-3.5 bg-white/70 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-200 font-medium"
                  placeholder="Drawing, Sports, Music..."
                />
              </div>

              {/* Energy Level */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-teal-500" />
                    Energy Level (1-10)
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    Activity Matching
                  </span>
                </label>
                <div className="flex items-center gap-4 bg-linear-to-r from-teal-50 to-cyan-50 p-5 rounded-2xl border-2 border-teal-100">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    {...register("energyLevel")}
                    className="w-full h-2.5 bg-linear-to-r from-teal-200 to-cyan-300 rounded-full appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="min-w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <span className="font-black text-2xl bg-linear-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                      {energyLevelValue || 5}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  1 = Very Calm • 10 = Very Active
                </p>
              </div>

              {/* Temperament */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Temperament
                </label>
                <select
                  {...register("temperament")}
                  className="w-full p-3.5 bg-white/70 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-200 font-medium"
                >
                  <option value="Easy">😊 Easy</option>
                  <option value="Moderate">😐 Moderate</option>
                  <option value="Challenging">😤 Challenging</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Helps match with compatible sitters
                </p>
              </div>

              {/* Special Needs */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Special Needs / Allergies (Optional)
                </label>
                <textarea
                  {...register("specialNeeds")}
                  className="w-full p-3.5 bg-white/70 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all duration-200 font-medium resize-none"
                  placeholder="Any allergies, medical conditions, or special requirements..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="bg-linear-to-r from-teal-500 to-purple-500 text-white px-10 py-3.5 rounded-2xl font-bold hover:shadow-2xl hover:shadow-teal-300/50 hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : editingId ? (
                  "Update Profile"
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.length === 0 && !isLoading && !showForm && (
          <div className="col-span-2 text-center py-20 bg-linear-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-300">
            <div className="inline-block p-6 bg-white rounded-3xl shadow-lg mb-4">
              <Baby className="h-16 w-16 text-slate-300 mx-auto" />
            </div>
            <h3 className="text-slate-900 font-bold text-xl mb-2">
              No profiles yet
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Add your children to get personalized babysitter recommendations
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3 bg-linear-to-r from-teal-500 to-purple-500 text-white rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Add First Child
            </button>
          </div>
        )}

        {children.map((child, index) => (
          <div
            key={child.id}
            className={`group relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border-2 border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Card gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-teal-50/50 via-transparent to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Child Info */}
            <div className="relative mb-6">
              {/* Action Buttons - moved to top right corner */}
              <div className="absolute -top-2 -right-2 flex gap-2 z-10">
                <button
                  onClick={() => handleEdit(child)}
                  className="p-2.5 bg-white hover:bg-teal-50 text-slate-500 hover:text-teal-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => promptDelete(child.id)}
                  className="p-2.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${
                    child.gender === "Male"
                      ? "bg-linear-to-br from-blue-400 to-cyan-500 text-white"
                      : "bg-linear-to-br from-pink-400 to-rose-500 text-white"
                  }`}
                >
                  {child.name.charAt(0)}
                </div>
                <div className="flex-1 pr-20">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">
                    {child.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-semibold">
                    {child.age} Years • {child.gender}
                  </p>
                  <div
                    className={`inline-block mt-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                      child.stubbornnessLvl >= 4
                        ? "bg-linear-to-r from-red-100 to-orange-100 text-red-700"
                        : child.stubbornnessLvl >= 3
                        ? "bg-linear-to-r from-orange-100 to-yellow-100 text-orange-700"
                        : "bg-linear-to-r from-green-100 to-teal-100 text-green-700"
                    }`}
                  >
                    Level {child.stubbornnessLvl}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="relative space-y-3">
              {child.interests && (
                <div className="flex items-center gap-3 text-sm p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <Activity className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="text-purple-900 font-medium truncate">
                    {child.interests}
                  </span>
                </div>
              )}

              {child.specialNeeds && (
                <div className="flex items-start gap-3 text-sm p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <Heart className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                  <span className="text-rose-900 font-medium leading-tight">
                    {child.specialNeeds}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
