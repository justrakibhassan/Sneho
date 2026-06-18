"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  MessageList,
  MessageInput,
  ChannelHeader,
  Thread,
  useChannelStateContext,
  useChatContext,
  ChannelPreviewMessenger,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import { ChevronLeft, MessageSquare, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const ChatInitializer = ({
  partnerId,
  userId,
}: {
  partnerId: string | null;
  userId: string;
}) => {
  const { client, setActiveChannel } = useChatContext();

  useEffect(() => {
    const initChannel = async () => {
      if (!partnerId || !userId || !client) return;

      try {
        const response = await axiosInstance.post("/chat/conversation", {
          targetUserId: parseInt(partnerId),
        });

        const { channelId } = response.data;

        if (channelId) {
          // Stream Chat expects member IDs as strings
          const channel = client.channel("messaging", channelId, {
            members: [userId.toString(), partnerId.toString()],
          });
          await channel.watch();
          setActiveChannel(channel);
        }
      } catch (error) {
        console.error("Error initializing channel:", error);
      }
    };

    initChannel();
  }, [partnerId, userId, client, setActiveChannel]);

  return null;
};

function MessagesContent() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get("partnerId");
  const { user } = useAuth();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChannelList, setShowChannelList] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      if (!user || chatClient) return;

      try {
        const res = await axiosInstance.get("/chat/token");
        const { token, apiKey } = res.data;

        const client = StreamChat.getInstance(apiKey);

        // Check if already connected to prevent "Consecutive calls" warning
        if (client.userID === user.id.toString()) {
          setChatClient(client);
          return;
        }

        await client.connectUser(
          {
            id: user.id.toString(),
            name: user.name,
            image: user.profilePicture || undefined,
          },
          token
        );

        setChatClient(client);
      } catch (error) {
        console.error("Error connecting to chat:", error);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [user, chatClient]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!chatClient || !user) {
    return (
      <div className="h-[calc(100vh-120px)] m-4">
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm flex h-full">
          {/* Sidebar Skeleton */}
          <div className="w-1/3 border-r bg-slate-50 p-4 space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-white rounded-xl"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
          {/* Chat Area Skeleton */}
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4 bg-white">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`flex ${
                    i % 2 === 0 ? "justify-start" : "justify-end"
                  }`}
                >
                  <div className="max-w-[70%] space-y-2">
                    <Skeleton
                      className={`h-16 ${
                        i % 2 === 0 ? "w-64" : "w-48"
                      } rounded-2xl`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-4">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filters = { members: { $in: [user.id.toString()] } };
  const sort = { last_message_at: -1 } as const;

  return (
    <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] m-2 sm:m-4 bg-white rounded-2xl border overflow-hidden shadow-sm flex relative">
      <Chat client={chatClient} theme="messaging light">
        <ChatInitializer partnerId={partnerId} userId={user.id.toString()} />
        <div className="flex w-full h-full">
          {/* Channel List Sidebar */}
          <div
            className={`${
              isMobileView && !showChannelList ? "hidden" : "flex"
            } w-full lg:w-1/3 border-r bg-slate-50 flex-col h-full absolute lg:relative inset-0 z-20`}
          >
            <div className="p-4 border-b font-black text-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Messages
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ChannelList
                filters={filters}
                sort={sort}
                options={{ watch: true, state: true }}
                Preview={(props) => (
                  <div
                    onClick={() => {
                      if (isMobileView) setShowChannelList(false);
                    }}
                  >
                    <ChannelPreviewMessenger {...props} />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`${
              isMobileView && showChannelList ? "hidden" : "flex"
            } flex-1 flex flex-col h-full bg-white z-10 w-full lg:w-auto absolute lg:relative inset-0 lg:z-0`}
          >
            <Channel>
              <Window>
                <div className="flex items-center justify-between border-b pr-4 bg-white">
                  {isMobileView && (
                    <button
                      onClick={() => setShowChannelList(true)}
                      className="p-3 text-slate-500 hover:text-teal-600 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  <div className="flex-1">
                    <ChannelHeader />
                  </div>
                  <VideoCallHeader />
                </div>
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </div>
        </div>
      </Chat>
    </div>
  );
}

// Updated VideoCallHeader to only include the button
const VideoCallHeader = () => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const router = useRouter();

  const handleStartVideoCall = async () => {
    if (!channel || !client.user) return;

    const callId = `call-${client.user.id}-${Date.now()}`;
    const callUrl = `/meeting/${callId}`;

    try {
      await channel.sendMessage({
        text: `I've started a video call! Click here to join: ${window.location.origin}${callUrl}`,
      });
      router.push(callUrl);
    } catch (err) {
      console.error("Failed to start video call:", err);
    }
  };

  if (!channel) return null;

  return (
    <button
      onClick={handleStartVideoCall}
      className="flex items-center gap-2 bg-teal-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-teal-700 transition-all shadow-md shadow-teal-100 active:scale-95 shrink-0"
    >
      <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span className="hidden xs:inline">Video Call</span>
    </button>
  );
};

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-120px)] m-4">
          <div className="bg-white rounded-2xl border overflow-hidden shadow-sm flex h-full">
            <div className="w-1/3 border-r bg-slate-50 p-4 space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-24" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="border-b p-4 bg-white">
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="flex-1 p-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      i % 2 === 0 ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div className="max-w-[70%] space-y-2">
                      <Skeleton
                        className={`h-16 ${
                          i % 2 === 0 ? "w-64" : "w-48"
                        } rounded-2xl`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-4">
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
