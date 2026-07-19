import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Camera, CameraOff } from "lucide-react";

const CallModal = ({
  isOpen,
  callType,
  remoteName,
  localStream,
  remoteStream,
  connectionState,
  isMuted,
  isCameraOff,
  callDuration,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera,
  onSwitchCamera,
}) => {
  const [showLocalPreview, setShowLocalPreview] = useState(Boolean(localStream));
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const statusLabel = useMemo(() => {
    if (connectionState === "connected") return "Connected";
    if (connectionState === "connecting") return "Connecting...";
    if (connectionState === "reconnecting") return "Reconnecting...";
    return "Waiting";
  }, [connectionState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{callType === "video" ? "Video call" : "Voice call"}</h3>
            <p className="text-sm text-gray-500">{remoteName || "Connecting"}</p>
          </div>
          <div className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{statusLabel}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.6fr_0.8fr]">
          <div className="relative overflow-hidden rounded-2xl bg-gray-950 min-h-[320px]">
            {callType === "video" && remoteStream ? (
              <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-center text-white">
                <div>
                  <p className="text-xl font-semibold">{remoteName}</p>
                  <p className="mt-2 text-sm text-gray-400">{callDuration}</p>
                </div>
              </div>
            )}

            {callType === "video" && localStream && showLocalPreview ? (
              <div className="absolute bottom-4 right-4 h-32 w-24 overflow-hidden rounded-xl border border-white/30 bg-black shadow-lg">
                <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-600">
                <p className="font-medium text-gray-900">Call controls</p>
                <p className="mt-1">Mute, switch cameras, or end the call at any time.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={onToggleMute} className="flex-1">
                  {isMuted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                {callType === "video" ? (
                  <Button type="button" variant="outline" onClick={onToggleCamera} className="flex-1">
                    {isCameraOff ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
                    {isCameraOff ? "Camera on" : "Camera off"}
                  </Button>
                ) : null}
              </div>
              {callType === "video" ? (
                <Button type="button" variant="outline" onClick={() => { setShowLocalPreview((prev) => !prev); onSwitchCamera?.(); }} className="w-full">
                  <Video className="mr-2 h-4 w-4" /> Switch camera
                </Button>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onReject} className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                <PhoneOff className="mr-2 h-4 w-4" /> Decline
              </Button>
              <Button type="button" onClick={onEnd} className="flex-1 bg-red-600 text-white hover:bg-red-700">
                <PhoneOff className="mr-2 h-4 w-4" /> End
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
