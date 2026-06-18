"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Settings,
  Bell,
  Save,
  Loader2,
  ShieldCheck,
  Mail,
  Smartphone,
  Camera,
  LogOut,
  RefreshCcw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuthContext } from "@/context/auth-context";
import proxy from "@/lib/proxy";
import Image from "next/image";
import Script from "next/script";
import { AxiosError } from "axios";
import { CloudinaryResult, CloudinaryWidget } from "@/types/cloudinary";

interface IProfileFormData {
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
}

interface IPasswordData {
  current: string;
  new: string;
  confirm: string;
}

interface ISystemSettings {
  MAINTENANCE_MODE: string;
  PLATFORM_COMMISSION: string;
  AUTO_VERIFY_PROVIDERS: string;
  [key: string]: string | undefined;
}

export default function AdminSettingsPage() {
  const { user, refreshUser, logout } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form States
  const [formData, setFormData] = useState<IProfileFormData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    profilePicture: user?.profilePicture || "",
  });

  const [passwords, setPasswords] = useState<IPasswordData>({
    current: "",
    new: "",
    confirm: "",
  });

  const [systemSettings, setSystemSettings] = useState<ISystemSettings>({
    MAINTENANCE_MODE: "false",
    PLATFORM_COMMISSION: "10",
    AUTO_VERIFY_PROVIDERS: "false",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        profilePicture: user.profilePicture || "",
      });
    }
    fetchSystemSettings();
  }, [user]);

  const fetchSystemSettings = async () => {
    try {
      const res = await proxy.get<{ success: boolean; settings: Partial<ISystemSettings> }>("/system/admin/settings");
      if (res.data.success) {
        setSystemSettings((prev) => ({
          ...prev,
          ...res.data.settings,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch settings");
    }
  };

  const openUploadWidget = () => {
    if (typeof window !== "undefined" && window.cloudinary) {
      const widget: CloudinaryWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: "input-gears",
          uploadPreset: "input-gears",
          sources: ["local", "url", "camera"],
          multiple: false,
          cropping: true,
          croppingAspectRatio: 1,
        },
        (_error: unknown, result: CloudinaryResult) => {
          if (!_error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            setFormData((prev) => ({ ...prev, profilePicture: imageUrl }));
            toast.success("Profile picture updated!");

            // Auto close with small delay for smoothness
            setTimeout(() => {
              widget.close();
            }, 1000);
          }
        }
      );
      widget.open();
    } else {
      toast.error("Upload widget not ready");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
    toast.success("Sync Complete: Session updated with server!");
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await proxy.put("/user/update-profile", formData);
      if (res.data.success) {
        toast.success("Profile updated perfectly!");
        await refreshUser();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match!");
    }
    setLoading(true);
    try {
      // Assuming existing password update logic or similar endpoint
      const res = await proxy.put<{ success: boolean }>("/auth/update-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      if (res.data.success) {
        toast.success("Password changed successfully!");
        setPasswords({ current: "", new: "", confirm: "" });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsSave = async () => {
    setLoading(true);
    try {
      const res = await proxy.put<{ success: boolean }>("/system/admin/settings", systemSettings);
      if (res.data.success) {
        toast.success("System configurations updated!");
        fetchSystemSettings();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4 md:px-0">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
      />
      {/* --- PREMIUM HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden backdrop-blur-3xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50/50 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-[80px] -z-10" />

        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
          <div
            className="relative group cursor-pointer"
            onClick={openUploadWidget}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-xl shadow-teal-500/20 transition-all duration-500 overflow-hidden ring-4 ring-white">
              {formData.profilePicture ? (
                <Image
                  src={formData.profilePicture}
                  alt="Profile"
                  fill
                  className="object-cover transition-transform duration-700"
                />
              ) : (
                user?.name?.charAt(0) || "A"
              )}
            </div>
            <button
              className="absolute -bottom-1 -right-1 p-2 bg-white rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-all text-teal-600 active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              Account Settings
            </h1>
            <p className="text-slate-500 font-bold flex items-center justify-center sm:justify-start gap-2 mt-1 uppercase text-[10px] tracking-widest">
              Security Level:{" "}
              <span className="text-teal-600 font-black">
                Authorized Administrator
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center justify-center lg:justify-end gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-slate-50 text-slate-900 font-black rounded-xl md:rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 disabled:opacity-50 text-[10px] md:text-xs uppercase tracking-widest border border-slate-200"
          >
            <RefreshCcw
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />{" "}
            Sync State
          </button>
          <button
            onClick={logout}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-red-50 text-red-600 font-black rounded-xl md:rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95 text-[10px] md:text-xs uppercase tracking-widest border border-red-100"
          >
            <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* --- TABS SYSTEM --- */}
      <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          <TabsList className="bg-white/50 backdrop-blur-md border border-slate-200/60 p-1.5 h-14 md:h-16 rounded-2xl md:rounded-[2rem] gap-2 shadow-xl shadow-slate-100/50 mb-6 md:mb-10 w-max mx-auto lg:mx-0">
            <TabsTrigger
              value="profile"
              className="rounded-xl md:rounded-[1.5rem] px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <User className="h-3.5 w-3.5 md:h-4 md:w-4" /> Identity
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-xl md:rounded-[1.5rem] px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Lock className="h-3.5 w-3.5 md:h-4 md:w-4" /> Protection
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="rounded-xl md:rounded-[1.5rem] px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" /> Core Config
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            {/* 🟢 IDENTITY TAB */}
            <TabsContent
              value="profile"
              className="m-0 outline-none animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <form
                onSubmit={handleProfileSave}
                className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6 md:space-y-8"
              >
                <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-teal-50 rounded-2xl">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Personal Authentication
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      Maintain your professional identity across the
                      infrastructure
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <User className="w-3 h-3" /> Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Verification Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-400 font-bold cursor-not-allowed opacity-70"
                      placeholder="admin@platform.com"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Smartphone className="w-3 h-3" /> Contact Endpoint
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-center md:justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 md:px-10 py-5 md:py-7 rounded-xl md:rounded-[1.5rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-2xl shadow-teal-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Commit Profile Updates
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* 🟢 PROTECTION TAB */}
            <TabsContent
              value="security"
              className="m-0 outline-none animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <form
                onSubmit={handlePasswordChange}
                className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6 md:space-y-8"
              >
                <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-red-50 rounded-2xl">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Cryptographic Security
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      Update your access credentials to maintain vault integrity
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Current Password hash
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        New Access Token
                      </label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords({ ...passwords, new: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                        placeholder="••••••••••••"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Confirm Token
                      </label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            confirm: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-center md:justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-8 md:px-10 py-5 md:py-7 rounded-xl md:rounded-[1.5rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-2xl shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    Secure New Password
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* 🟢 CORE CONFIG TAB */}
            <TabsContent
              value="system"
              className="m-0 outline-none animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8 md:space-y-10">
                <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-purple-50 rounded-2xl">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Platform Core Parameters
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      Global environment variables and system-wide behavioral
                      logic
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center justify-between group">
                        <div>
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                            Platform Commission
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Percentage cut on all successful provider bookings
                          </p>
                        </div>
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-20 p-3 bg-slate-50 border-slate-100 rounded-xl text-center font-black text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="flex items-center justify-between group">
                        <div>
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                            Maintenance Mode
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Hard-lock platform access for all non-admin users
                          </p>
                        </div>
                        <Switch 
                          checked={systemSettings.MAINTENANCE_MODE === "true"}
                          onCheckedChange={(checked) => setSystemSettings({...systemSettings, MAINTENANCE_MODE: checked.toString()})}
                        />
                      </div>
                      <div className="flex items-center justify-between group">
                        <div>
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                            Auto-verify Providers
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Grant sitter verified status instantly upon register
                          </p>
                        </div>
                        <Switch 
                          checked={systemSettings.AUTO_VERIFY_PROVIDERS === "true"}
                          onCheckedChange={(checked) => setSystemSettings({...systemSettings, AUTO_VERIFY_PROVIDERS: checked.toString()})}
                        />
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center justify-between group">
                        <div>
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                            High-Traffic Alerts
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Receive notifications for anomalous session volumes
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between group">
                        <div>
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                            Email Registration Feed
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Detailed logs for every new entity in the system
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </section>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row justify-end gap-4">
                  <div className="flex-1 flex items-center gap-2 text-slate-400 italic text-[10px] md:text-xs text-center md:text-left">
                    <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                    Changes to platform parameters are logged in the audit
                    trail.
                  </div>
                  <Button 
                    onClick={handleSystemSettingsSave}
                    disabled={loading}
                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 md:px-10 py-5 md:py-7 rounded-xl md:rounded-[1.5rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-2xl shadow-purple-600/20 transition-all active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Apply Core Changes"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <ShieldCheck className="w-12 h-12 text-teal-400 mb-6" />
              <h3 className="text-2xl font-black mb-2">Security Audit</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Your account is protected with multi-layer authorization. Last
                security refresh occurred{" "}
                <span className="text-teal-400 font-black">2 minutes ago</span>.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs font-black uppercase tracking-widest">
                    Login History
                  </span>
                  <span className="text-xs font-bold text-teal-400">
                    View Logs
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs font-black uppercase tracking-widest">
                    Active Devices
                  </span>
                  <span className="text-xs font-bold text-teal-400">
                    2 Connected
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[3.5rem] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 md:p-3 bg-blue-100 rounded-xl md:rounded-2xl">
                  <Bell className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <h4 className="font-black text-blue-900 leading-tight text-sm md:text-base">
                  System Status
                </h4>
              </div>
              <p className="text-blue-700 text-[10px] md:text-xs font-bold leading-relaxed">
                Infrastructure is performing optimally. Database latency is
                within normal parameters (12ms).
              </p>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
