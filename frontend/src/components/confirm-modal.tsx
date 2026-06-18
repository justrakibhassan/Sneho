"use client";

import React from "react";
import { CheckCircle, ShieldAlert, X, Loader2 } from "lucide-react";

type ConfirmType = "approve" | "reject";

interface ConfirmActionModalProps {
  open: boolean;
  type: ConfirmType;
  titleApprove?: string;
  titleReject?: string;
  name?: string;
  description?: string; // custom description override
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;

  confirmTextApprove?: string;
  confirmTextReject?: string;
  cancelText?: string;
}

export default function ConfirmActionModal({
  open,
  type,
  titleApprove = "Approve Sitter",
  titleReject = "Reject Application",
  name,
  description,
  loading = false,
  onClose,
  onConfirm,
  confirmTextApprove = "Confirm Approval",
  confirmTextReject = "Confirm Rejection",
  cancelText = "Cancel",
}: ConfirmActionModalProps) {
  if (!open) return null;

  const isApprove = type === "approve";

  const defaultDescription = isApprove
    ? "Are you sure you want to approve this application? The user will be listed as a verified Babysitter immediately."
    : "Are you sure you want to reject this application? The user will be notified, and they won't be able to accept bookings.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`p-6 border-b ${
            isApprove
              ? "bg-teal-50 border-teal-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center border-4 border-white ${
                  isApprove
                    ? "bg-teal-100 text-teal-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {isApprove ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <ShieldAlert className="h-5 w-5" />
                )}
              </div>

              <div>
                <h3
                  className={`text-lg font-bold ${
                    isApprove ? "text-teal-900" : "text-red-900"
                  }`}
                >
                  {isApprove ? titleApprove : titleReject}
                </h3>
                {name ? (
                  <p
                    className={`text-xs font-medium ${
                      isApprove ? "text-teal-600/80" : "text-red-600/80"
                    }`}
                  >
                    {name}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              aria-label="Close"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed">
            {description ?? defaultDescription}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-colors disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 ${
              isApprove
                ? "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
                : "bg-red-600 hover:bg-red-700 shadow-red-200"
            }`}
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
            {isApprove ? confirmTextApprove : confirmTextReject}
          </button>
        </div>
      </div>
    </div>
  );
}
