"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { toast } from "sonner";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ClipboardCheck,
  XCircle,
  Info,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ImageUpload } from "@/components/image-upload";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplyAsSitterPage() {
  const router = useRouter();
  const { isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<unknown>(null);

  const [formData, setFormData] = useState({
    experience: "",
    hourlyRate: "",
    bio: "",
    skills: "",
    location: "",
    gender: "",
    dob: "",
    phoneNumber: "",
    profilePicture: "",
  });

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/sitter-applications/me");
      if (response.data.success) {
        const data = response.data.user;
        setUserData(data);

        // Pre-fill existing data
        setFormData((prev) => ({
          ...prev,
          location:
            data.babysitter?.locationAddress ||
            data.parent?.locationAddress ||
            "",
          experience: data.babysitter?.experienceYears?.toString() || "",
          hourlyRate: data.babysitter?.hourlyRate?.toString() || "",
          bio: data.babysitter?.bio || "",
          skills: data.babysitter?.skills || "",
          gender: data.babysitter?.gender || "",
          dob: data.babysitter?.dob
            ? new Date(data.babysitter.dob).toISOString().split("T")[0]
            : "",
          phoneNumber: data.phoneNumber || "",
          profilePicture: data.profilePicture || "",
        }));
      }
    } catch {
      // Silently handle - user might not have an application yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, profilePicture: url }));
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, profilePicture: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post("/auth/apply-as-sitter", formData);

      if (response.data.success) {
        toast.success("Application submitted successfully!");
        await refreshUser(); // Refresh auth state
        fetchProfile(); // Refresh local state
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Application failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] py-20 px-4 pt-28">
        <div className="max-w-5xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-12 text-center space-y-4">
            <Skeleton className="h-14 w-96 mx-auto" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Skeleton */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white/70 rounded-[2.5rem] p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>

                {/* Form Fields Skeleton */}
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <Skeleton className="h-14 rounded-[1.25rem]" />
                    <Skeleton className="h-14 rounded-[1.25rem]" />
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-[1.25rem]" />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-[1.25rem]" />
                    ))}
                  </div>
                  <Skeleton className="h-14 rounded-[1.25rem]" />
                  <Skeleton className="h-32 rounded-[2rem]" />
                  <Skeleton className="h-16 rounded-[2rem] w-full" />
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 space-y-8">
                <Skeleton className="h-8 w-48 bg-white/20" />
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-xl bg-white/20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 bg-white/20" />
                        <Skeleton className="h-3 w-full bg-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-8 space-y-6">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Status Logic ---
  const sitterStatus = (userData as { sitterStatus?: string })?.sitterStatus || "NONE";

  if (sitterStatus === "APPROVED") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-600 font-medium">Your sitter account is active. You can now start accepting bookings.</p>
          </div>
          <Link
            href="/account/dashboard"
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (sitterStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 pt-20 text-center">
        <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] border border-white shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-32 h-32 text-blue-600" />
          </div>
          
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Loader2 className="w-12 h-12 animate-spin" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Application Under Review</h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
              Our team is currently reviewing your profile. We&apos;ll verify your information and get back to you soon.
            </p>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 text-left space-y-3">
            <h3 className="flex items-center gap-2 font-black text-blue-900 text-sm uppercase tracking-widest">
              <Info className="w-4 h-4" /> Next Steps
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm font-medium">
              <li className="flex gap-2 items-start opacity-70">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Background check and identity verification
              </li>
              <li className="flex gap-2 items-start opacity-70">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Verification of experience and certifications
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all inline-flex items-center gap-2 text-sm shadow-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-20 px-4 pt-28">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-4 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-10">
            <Briefcase className="w-40 h-40 text-blue-600" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter sm:text-6xl">
            Join Our <span className="text-blue-600">Care</span> Network
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Become a certified caregiver and start making an impact in families&apos; lives today.
          </p>
        </div>

        {/* Status Alert if Rejected */}
        {sitterStatus === "REJECTED" && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-red-50 border border-red-200 p-8 rounded-[2rem] flex items-start gap-6 shadow-xl shadow-red-900/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600">
                <XCircle className="w-24 h-24" />
              </div>
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-red-900">Application Needs Attention</h3>
                <p className="text-red-700 font-medium leading-relaxed">
                  Your previous application was not approved. Please review your information, ensure it&apos;s accurate and professional, and resubmit for verification.
                </p>
                <div className="pt-2">
                   <button 
                    onClick={() => {}} 
                    className="text-red-900 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:underline"
                   >
                     <RefreshCw className="w-3 h-3" /> Fix and Resubmit below
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-2xl space-y-10">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Application Form</h2>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Step 1 of 1</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Meta Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="+8801700000000"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Profile Photo</label>
                    <ImageUpload 
                      value={formData.profilePicture}
                      onChange={handleImageChange}
                      onRemove={handleImageRemove}
                      label=""
                    />
                    <p className="text-[10px] text-slate-400 font-bold ml-1">
                      Upload a professional photo to build trust with families.
                    </p>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Years of Exp.</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                        placeholder="2"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hourly Rate (BDT)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        required
                        placeholder="200"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="Gulshan, Dhaka"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 lg:col-span-1 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 lg:col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Skills (Comma-separated)</label>
                   <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        required
                        placeholder="CPR, First Aid, Cooking, Tutoring"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                      />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Describe your background, approach to care, and why you love working with children..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-sm leading-relaxed"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Submit Application <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Info Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute -bottom-10 -right-10 opacity-10">
                <Sparkles className="w-40 h-40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight leading-tight">Why join us?</h3>
                <p className="text-slate-400 text-sm font-medium">Be part of the most trusted caregiver network.</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wider mb-1">Set Your Own Rates</h4>
                    <p className="text-slate-500 text-xs font-medium">You&apos;re in control of your earnings and pricing.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wider mb-1">Flexible Schedule</h4>
                    <p className="text-slate-500 text-xs font-medium">Work when you want, where you want. Totally flexible.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-orange-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wider mb-1">Safe & Secure</h4>
                    <p className="text-slate-500 text-xs font-medium">Verified families and automated payments for security.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-6">
              <h4 className="font-black text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" /> Requirements
              </h4>
              <ul className="space-y-4">
                {[
                  "The interview was easy-going, and SitterSnoho's support was there at every step.",
                  "Clean background record",
                  "Professional profile photo",
                  "Valid phone number"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start text-sm font-medium text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
