"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import {
  Award,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  FileText,
  ShieldCheck,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Certification {
  id: number;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
}

export default function CertificationsPage() {
  const { isAuthenticated } = useAuth();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  });

  const fetchCerts = async () => {
    try {
      // Note: Backend endpoint for certificates needs to be confirmed or created
      // For now, we simulation or fetch if exists
      const res = await axiosInstance.get("/user/certifications");
      if (res.data.success) {
        setCerts(res.data.certifications);
      }
    } catch (err) {
      console.error("Fetch Certs Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCerts();
    }
  }, [isAuthenticated]);

  const handleUpload = () => {
    const cloudinary = (window as unknown as { cloudinary: { createUploadWidget: (options: Record<string, unknown>, callback: (error: unknown, result: { event: string; info: { secure_url: string } }) => void) => { open: () => void; close: () => void } } }).cloudinary;
    if (cloudinary) {
      const widget = cloudinary.createUploadWidget(
        {
          cloudName: "input-gears",
          uploadPreset: "input-gears",
          sources: ["local", "url", "camera"],
          multiple: false,
        },
        (error: unknown, result: { event: string; info: { secure_url: string } }) => {
          if (!error && result && result.event === "success") {
            setFormData({ ...formData, credentialUrl: result.info.secure_url });
            toast.success("Document uploaded!");
            widget.close();
          }
        }
      );
      widget.open();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.credentialUrl) {
      toast.error("Title and Document are required");
      return;
    }

    setUploading(true);
    try {
      const res = await axiosInstance.post("/user/certifications", formData);
      if (res.data.success) {
        toast.success("Certification submitted for review!");
        setShowForm(false);
        setFormData({
          title: "",
          issuer: "",
          issueDate: "",
          credentialUrl: "",
        });
        fetchCerts();
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("Failed to submit certification");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-teal-600" /> Certifications &
            Credentials
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Build trust with parents by uploading your professional
            certifications.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-teal-100 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Submit New Credential
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-900 font-bold transition-colors uppercase text-xs tracking-widest"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">
                Certification Name
              </label>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. CPR Certification"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-medium h-14"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">
                Issued By
              </label>
              <input
                value={formData.issuer}
                onChange={(e) =>
                  setFormData({ ...formData, issuer: e.target.value })
                }
                placeholder="e.g. Red Cross"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-medium h-14"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-medium h-14"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">
                Credential Document
              </label>
              <button
                type="button"
                onClick={handleUpload}
                className={`w-full p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 h-14 transition-all ${
                  formData.credentialUrl
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-slate-50 text-slate-400 hover:border-teal-500 hover:text-teal-600"
                }`}
              >
                {formData.credentialUrl ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Document Attached
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" /> Upload Photo/PDF
                  </>
                )}
              </button>
            </div>
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "SUBMIT FOR VERIFICATION"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certifications List */}
      <div className="space-y-6">
        {certs.length > 0 ? (
          certs.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 flex flex-col md:flex-row items-center gap-8 group hover:shadow-2xl transition-all shadow-slate-100"
            >
              <div className="w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <FileText className="w-10 h-10" />
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h3 className="text-xl font-black text-slate-900">
                    {cert.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      cert.status === "VERIFIED"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : cert.status === "REJECTED"
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-slate-50 text-slate-500 border-slate-100"
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 font-bold text-sm uppercase tracking-tight">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> {cert.issuer}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Issued:{" "}
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </a>
                )}
                <button className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-md flex items-center justify-center mx-auto mb-6 transform -rotate-12">
              <Award className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-400">
              No Certifications Added
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
              Upload your academic or professional certificates to stand out to
              parents.
            </p>
          </div>
        )}
      </div>

      {/* Verification Info */}
      <div className="bg-amber-50 rounded-[2.5rem] p-10 border border-amber-100/50 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-md">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h4 className="text-xl font-bold text-slate-900">
            How verification works
          </h4>
          <p className="text-slate-600 font-medium text-sm leading-relaxed">
            Our team manually reviews every certificate you upload. Once
            verified, you&apos;ll get a{" "}
            <span className="text-teal-600 font-bold">Verified badge</span> on
            your profile, which increases your chances of getting hired by{" "}
            <span className="font-black">65%</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
