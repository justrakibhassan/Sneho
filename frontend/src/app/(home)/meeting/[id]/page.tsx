"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  Call,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function MeetingPage() {
  const { id } = useParams(); // Booking ID as Call ID
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const isInitializing = useRef(false);

  const handleLeave = () => {
    if (call) {
      call.leave().catch(console.error);
    }
    router.push("/account/messages");
  };

  useEffect(() => {
    // ১. গার্ড ক্লজ: যদি ইউজার না থাকে বা অলরেডি ইনিশিয়ালাইজ শুরু হয় তবে রিটার্ন
    if (!isAuthenticated || !user || !id || isInitializing.current) return;

    const initVideoCall = async () => {
      isInitializing.current = true; // লক করে দেওয়া হলো

      try {
        const { data } = await axiosInstance.post("/meeting/token", {
          userId: user.id,
        });

        if (!data.success) throw new Error("Failed to get token");

        // ২. ক্লায়েন্ট তৈরি
        const newClient = new StreamVideoClient({
          apiKey,
          user: {
            id: user.id.toString(),
            name: user.name,
            image:
              (user as { profilePicture?: string }).profilePicture ||
              `https://ui-avatars.com/api/?name=${user.name}`,
          },
          token: data.token,
        });

        // ৩. কল জয়েন করা
        const newCall = newClient.call("default", id as string);
        await newCall.join({ create: true });

        setClient(newClient);
        setCall(newCall);
      } catch (error) {
        console.error("Meeting Error:", error);
        isInitializing.current = false; // এরর হলে লক খুলে দেওয়া
      }
    };

    initVideoCall();
 
    // ৪. ক্লিনআপ (যাতে ডাবল জয়েন না হয়)
    return () => {
      const cleanup = async () => {
        if (client) {
          await client.disconnectUser();
        }
      };
      cleanup();
    };
  }, [id, isAuthenticated, user?.id, client]); // শুধুমাত্র প্রয়োজনীয় ডিপেন্ডেন্সি
  // Loading UI
  if (!client || !call) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
        <p className="text-slate-400 animate-pulse">
          Connecting to secure room...
        </p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <div className="h-screen w-full bg-slate-950 text-white flex flex-col overflow-hidden">
            {/* --- Header --- */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="bg-teal-500/10 p-2 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-sm md:text-base">
                    Session #{id}
                  </h2>
                  <p className="text-xs text-slate-500">Encrypted Connection</p>
                </div>
              </div>

              <button
                onClick={handleLeave}
                className="flex items-center gap-2 text-xs font-bold bg-red-500/10 text-red-500 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut className="h-4 w-4" /> Leave
              </button>
            </div>

            {/* --- Main Video Area --- */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-2 md:p-4 relative flex items-center justify-center">
                <SpeakerLayout participantsBarPosition="bottom" />
              </div>

              {/* Participant List (Hidden on Mobile) */}
              <div className="hidden lg:block w-80 border-l border-slate-800 bg-slate-900/30 p-4">
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                  Participants
                </h3>
                <CallParticipantsList onClose={() => {}} />
              </div>
            </div>

            {/* --- Controls Footer --- */}
            <div className="p-6 flex justify-center bg-slate-900 border-t border-slate-800">
              <CallControls onLeave={handleLeave} />
            </div>
          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
