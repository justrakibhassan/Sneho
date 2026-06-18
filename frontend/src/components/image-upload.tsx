"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Camera, ImagePlus, Loader2, Trash, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string; // বর্তমান ইমেজ URL (যদি থাকে)
  onChange: (url: string) => void; // ইমেজ আপলোড হলে প্যারেন্টকে URL পাঠানোর ফাংশন
  onRemove: () => void; // ইমেজ রিমুভ করার ফাংশন
  label?: string; // অপশনাল লেবেল
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  label = "Upload Image",
  disabled,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // 🔥 Cloudinary Upload Logic
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ফাইলের সাইজ চেক (Optional: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large (Max 5MB)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const imageUrl = response.data.secure_url;
      onChange(imageUrl); // প্যারেন্ট কম্পোনেন্টে URL পাঠানো
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {label && (
        <label className="text-sm font-bold text-slate-700 block mb-1">
          {label}
        </label>
      )}

      {/* যদি ইমেজ থাকে -> প্রিভিউ দেখাবে */}
      {value ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
          <div className="absolute top-2 right-2 z-10">
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
              title="Remove Image"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
          <Image src={value} alt="Upload" fill className="object-cover" />
        </div>
      ) : (
        // যদি ইমেজ না থাকে -> আপলোড বাটন দেখাবে
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-64 h-40 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition flex flex-col items-center justify-center gap-2 cursor-pointer bg-white group">
            {isUploading ? (
              <div className="flex flex-col items-center text-teal-600">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span className="text-xs font-semibold">Uploading...</span>
              </div>
            ) : (
              <>
                <div className="p-3 bg-slate-100 rounded-full group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                  <ImagePlus className="h-6 w-6 text-slate-400 group-hover:text-teal-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    Click to upload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    JPG, PNG (Max 5MB)
                  </p>
                </div>

                {/* Hidden Input Triggered by Label */}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleUpload}
                  disabled={disabled || isUploading}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
