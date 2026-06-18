"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Heart, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface TipModalProps {
  bookingId: number;
  sitterName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentTip?: number;
}

export default function TipModal({
  bookingId,
  sitterName,
  isOpen,
  onClose,
  onSuccess,
  currentTip = 0,
}: TipModalProps) {
  const [amount, setAmount] = useState<string>(
    currentTip > 0 ? currentTip.toString() : ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(`/bookings/${bookingId}/tip`, {
        amount: parseFloat(amount),
      });

      if (res.data.success) {
        toast.success("Tip added! Thank you for your generosity ✨");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Tip Error:", error);
      toast.error("Failed to add tip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tipPresets = [50, 100, 200, 500];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl z-50 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Show
              Appreciation
            </Dialog.Title>
            <Dialog.Close className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </Dialog.Close>
          </div>

          <p className="text-slate-500 font-medium mb-8">
            Add a tip for <span className="text-slate-900 font-bold">{sitterName}</span> to show your appreciation for their service.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {tipPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                      amount === preset.toString()
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ৳{preset}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
                  ৳
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Other amount"
                  className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-3xl text-2xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-current" />
                  Send Tip
                </>
              )}
            </button>
          </form>

          <Dialog.Description className="mt-6 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
            100% of the tip goes to the sitter
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
