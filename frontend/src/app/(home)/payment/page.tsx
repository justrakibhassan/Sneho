"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axiosInstance from "@/lib/axios";
import { Loader2, ShieldCheck, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Use environment variable for the publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm({
  bookingId,
  amount,
}: {
  clientSecret: string;
  bookingId: string;
  amount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Confirm with our backend
      try {
        await axiosInstance.post("/payments/confirm", {
          bookingId,
          paymentIntentId: paymentIntent.id,
        });
        toast.success("Payment Successful!");
        window.location.href = "/account/bookings"; // Redirect after success
      } catch {
        toast.error(
          "Payment succeeded but record update failed. Please contact support."
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="p-4 bg-slate-50 rounded-2xl border border-slate-100" />
      <button
        disabled={isProcessing || !stripe}
        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          `PAY BDT ${amount}`
        )}
      </button>
    </form>
  );
}

export default function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = React.use(searchParams);
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      axiosInstance
        .post("/payments/create-intent", { bookingId })
        .then((res) => {
          setClientSecret(res.data.clientSecret);
          setAmount(res.data.amount);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to initialize payment");
          setLoading(false);
        });
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">
          Preparing secure checkout...
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-20">
        <CreditCard className="w-20 h-20 text-slate-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">
          Invalid Payment Link
        </h2>
        <p className="text-slate-500">
          Could not find booking or payment details.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 border border-slate-50 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-slate-900 rounded-2xl text-white">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Complete Payment
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Booking #{bookingId}
              </p>
            </div>
          </div>

          <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Total Amount
              </p>
              <p className="text-3xl font-black text-slate-900">BDT {amount}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1">
                <ShieldCheck size={12} /> Secure
              </span>
              <p className="text-[10px] text-slate-400 font-bold">
                Encrypted Transaction
              </p>
            </div>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              bookingId={bookingId}
              amount={amount}
            />
          </Elements>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4 text-slate-400 font-medium text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-teal-500" /> PCI
                Compliant
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-teal-500" /> SSL
                Encrypted
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-teal-500" /> 24/7
                Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
