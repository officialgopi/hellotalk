import { getSocket } from "@/lib/Socket";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type AnswerPayload = {
  answer: RTCSessionDescriptionInit;
};

type IceCandidatePayload = {
  candidate: RTCIceCandidateInit;
};

type HangupPayload = {
  to?: string | null;
};

type CallMode = "audio" | "video";

type CallProps = {
  calleeId?: string | null;
  callerId?: string | null;
  mode: CallMode;
  isOutgoing: boolean;
  initialOffer?: RTCSessionDescriptionInit | null;
  onClose?: () => void;
};

const confirmDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: 0.15, ease: "easeInOut" },
  },
};

const Call = ({
  calleeId,
  callerId: incomingCallerId,
  mode,
  isOutgoing,
  initialOffer = null,
  onClose,
}: CallProps) => {
  const socket = getSocket();
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callIncoming, setCallIncoming] = useState<boolean>(!isOutgoing);
  const [callerId, setCallerId] = useState<string | null>(
    incomingCallerId || null,
  );
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // --- NEW HANDUP SAFETY CORES ---
  const [showHangupConfirm, setShowHangupConfirm] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const remoteCombinedStreamRef = useRef<MediaStream | null>(null);

  const iceServers: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    const getMedia = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: { echoCancellation: true, noiseSuppression: true },
          video:
            mode === "video"
              ? {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: "user",
                }
              : false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMyStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to acquire network media streams:", err);
      }
    };
    getMedia();
  }, [mode]);

  useEffect(() => {
    socketRef.current = socket;

    socketRef.current.on(
      "receive:answer",
      async ({ answer }: AnswerPayload) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
        }
      },
    );

    socketRef.current.on(
      "receive-ice-candidate",
      async ({ candidate }: IceCandidatePayload) => {
        try {
          if (peerConnectionRef.current && candidate) {
            await peerConnectionRef.current.addIceCandidate(candidate);
          }
        } catch (err) {
          console.error("Error linking streaming ICE candidate nodes:", err);
        }
      },
    );

    socketRef.current.on("call:hangup", () => {
      executeEndCall(); // Direct termination if remote hangs up
    });

    return () => {
      socketRef.current?.off("receive:answer");
      socketRef.current?.off("receive-ice-candidate");
      socketRef.current?.off("call:hangup");
    };
  }, [myStream]);

  const createPeerConnection = (otherUserId: string) => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socketRef.current?.emit("send-ice-candidate", {
          to: otherUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event: RTCTrackEvent) => {
      if (!remoteCombinedStreamRef.current) {
        remoteCombinedStreamRef.current = new MediaStream();
      }
      const combined = remoteCombinedStreamRef.current;
      const incomingTrack = event.track;
      const alreadyHas = combined
        .getTracks()
        .some((t) => t.id === incomingTrack.id);

      if (!alreadyHas) combined.addTrack(incomingTrack);

      setRemoteStream(combined);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = combined;
        remoteVideoRef.current.play?.().catch(() => {});
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = combined;
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1;
        remoteAudioRef.current.play?.().catch(() => {});
      }
    };

    return pc;
  };

  const startCall = async () => {
    if (!calleeId || !myStream) return;
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.ontrack = null as any;
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }
    setIsCalling(true);
    peerConnectionRef.current = createPeerConnection(calleeId);

    const pc = peerConnectionRef.current!;
    myStream.getAudioTracks().forEach((track) => pc.addTrack(track, myStream));
    if (mode === "video") {
      myStream
        .getVideoTracks()
        .forEach((track) => pc.addTrack(track, myStream));
    }

    const offer = await peerConnectionRef.current.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: mode === "video",
    } as any);
    await peerConnectionRef.current.setLocalDescription(offer);

    socketRef.current?.emit("send:offer", {
      to: calleeId,
      offer,
      mode,
    });

    setIsMuted(false);
    setCallActive(true);
  };

  const acceptCall = async () => {
    if (!callerId || !peerConnectionRef.current || !myStream) return;
    setIsMuted(false);
    setCallActive(true);
    setCallIncoming(false);

    const pc = peerConnectionRef.current!;
    myStream.getAudioTracks().forEach((track) => pc.addTrack(track, myStream));
    if (mode === "video") {
      myStream
        .getVideoTracks()
        .forEach((track) => pc.addTrack(track, myStream));
    }

    const answer = await peerConnectionRef.current.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: mode === "video",
    } as any);
    await peerConnectionRef.current.setLocalDescription(answer);

    socketRef.current?.emit("send:answer", {
      to: callerId,
      answer,
    });
  };

  const rejectCall = () => {
    setCallIncoming(false);
    setCallerId(null);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (myStream) {
      myStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
    }
    const target = callerId || calleeId;
    if (target) socketRef.current?.emit("call:reject", { to: target });
    onClose?.();
  };

  // Intercept hangup to prompt popup confirmation
  const handleInitiateHangup = () => {
    setShowHangupConfirm(true);
  };

  // Final confirmation execution pipeline
  const executeEndCall = () => {
    setShowHangupConfirm(false);
    setCallActive(false);
    setIsCalling(false);
    setCallIncoming(false);
    setCallerId(null);
    setRemoteStream(null);
    if (myStream) {
      myStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    socketRef.current?.emit("call:hangup", {
      to: calleeId || callerId,
    } as HangupPayload);
    onClose?.();
  };

  const shouldAutoStart = useMemo(
    () => isOutgoing && !!calleeId && !!myStream,
    [isOutgoing, calleeId, myStream],
  );
  useEffect(() => {
    if (shouldAutoStart) startCall();
  }, [shouldAutoStart]);

  useEffect(() => {
    const setupFromInitialOffer = async () => {
      if (!initialOffer) return;
      setCallIncoming(true);
      setCallerId(incomingCallerId || null);
      if (!incomingCallerId) return;
      peerConnectionRef.current = createPeerConnection(incomingCallerId);
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(initialOffer),
      );
      if (myStream) {
        myStream.getTracks().forEach((track) => {
          peerConnectionRef.current?.addTrack(track, myStream);
        });
      }
    };
    setupFromInitialOffer();
  }, [initialOffer]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play?.().catch(() => {});
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (!myStream) return;
    const newMuted = !isMuted;
    myStream.getAudioTracks().forEach((t) => (t.enabled = !newMuted));
    setIsMuted(newMuted);
  };

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play?.().catch(() => {});
      }
    }
  }, [remoteStream]);

  useEffect(() => {
    const onRejected = () => executeEndCall();
    socketRef.current?.on("call:rejected", onRejected);
    return () => {
      socketRef.current?.off("call:rejected", onRejected);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#0a0a0c] text-[#f5f5f7] flex flex-col justify-between z-[100] select-none font-sans overflow-hidden">
      {/* --- CINEMATIC HEADER HUD PANEL --- */}
      <div className="w-full px-6 py-4 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between relative z-30 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.04] backdrop-blur-md shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] font-bold tracking-wider font-mono uppercase text-neutral-400">
            End-To-End Encrypted Session
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold tracking-tight font-mono text-neutral-500 uppercase">
            MODE // {mode}_LINK
          </span>
        </div>
      </div>

      {/* --- CORE MEDIA STREAM INTERFACE CANVASES --- */}
      <div className="flex-grow w-full relative z-10 flex items-center justify-center p-4 min-h-0">
        {mode === "video" && (
          <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden bg-neutral-950 border border-white/[0.03] relative shadow-2xl flex items-center justify-center">
            <div className="w-full h-full relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-2xl bg-[#0e0e11]"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/90 gap-3">
                  <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
                  <span className="text-xs font-medium font-mono text-neutral-400 tracking-wide uppercase">
                    Awaiting incoming video stream...
                  </span>
                </div>
              )}
            </div>
            <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border border-white/[0.08] shadow-xl z-20 bg-black/40 backdrop-blur-md">
              <video
                ref={myVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
          </div>
        )}

        {mode === "audio" && (
          <div className="flex flex-col items-center justify-center text-center max-w-sm px-6">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.02] border border-white/[0.05] animate-ping opacity-25" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.02] border border-white/[0.03] flex items-center justify-center shadow-inner relative z-10">
                <Mic className="text-neutral-300 w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
              </div>
            </div>
            <h3 className="text-sm font-semibold tracking-tight text-white font-sans">
              {callActive
                ? "Active Audio Broadcast Channel"
                : "Initializing Link Pipelines"}
            </h3>
            <p className="mt-1 text-[11px] font-medium font-mono tracking-wide text-neutral-500 uppercase">
              {callIncoming
                ? "Incoming encrypted request"
                : isCalling
                  ? "Pinging remote transceiver node"
                  : "Securing tunnel routes..."}
            </p>
            <audio
              ref={remoteAudioRef}
              autoPlay
              playsInline
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* --- INDUSTRIAL CONTROL KEYBOARD TRIMS --- */}
      <div className="w-full flex justify-center p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent relative z-30 shrink-0">
        <div className="px-6 py-3.5 rounded-2xl bg-[#141417]/80 border border-white/[0.04] backdrop-blur-xl shadow-xl flex items-center justify-center gap-4 sm:gap-6 min-w-[260px]">
          <AnimatePresence mode="wait">
            {callIncoming && (
              <motion.div
                key="incoming-actions"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="flex items-center gap-4"
              >
                <button
                  onClick={acceptCall}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5 fill-white" />
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-rose-600 hover:bg-rose-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {callActive && (
              <motion.div
                key="active-actions"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-4"
              >
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                    isMuted
                      ? "bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30"
                      : "bg-white/[0.03] border-white/[0.05] text-neutral-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
                {/* SAFE HANGUP TRIGGER LINKED TO THE POPUP */}
                <button
                  onClick={handleInitiateHangup}
                  className="bg-rose-600 hover:bg-rose-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {!callActive && !callIncoming && isOutgoing && (
              <motion.div
                key="telemetry-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 py-1.5 px-2 text-xs font-semibold font-mono tracking-wider uppercase text-neutral-400"
              >
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
                <span>{isCalling ? "Calling Node..." : "Connecting..."}</span>
                <button
                  onClick={handleInitiateHangup} // Also safeguard outbound cancellation clicks
                  className="bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 ml-4 px-3 py-1 rounded-lg text-[10px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- PREMIUM CALL TERMINATION CONFIRMATION DIALOGUE OVERLAY --- */}
      <AnimatePresence>
        {showHangupConfirm && (
          <motion.div
            className="absolute inset-0 z-[200000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHangupConfirm(false)}
          >
            <motion.div
              variants={confirmDialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-5 bg-[#131316] border border-white/[0.04] shadow-2xl flex flex-col relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="text-[14px] font-semibold tracking-tight text-white">
                  Disconnect Active Pipeline?
                </h4>
              </div>

              <p className="text-[12px] leading-relaxed text-neutral-400 font-medium">
                You are about to terminate the current media layout
                synchronization channel. This operation cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2.5 mt-5 font-sans">
                <button
                  onClick={() => setShowHangupConfirm(false)}
                  className="h-8 px-3.5 rounded-xl text-[11px] font-semibold text-neutral-400 hover:text-white bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  Keep Session
                </button>

                <button
                  onClick={executeEndCall}
                  className="h-8 px-3.5 rounded-xl text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-sm hover:shadow-rose-600/10 transition-all cursor-pointer"
                >
                  <PhoneOff className="w-3 h-3" /> Terminate Call
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Call;
