import { Server, Socket } from "socket.io";
import { getSockets } from "./socket.helper";
import { MessageModel } from "../models/message.model";
import { events } from "../constants/events.constant";

const {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE_ALERT,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
  ONLINE_USERS,
} = events;

const userSocketIDs = new Map();
const onlineUsers = new Set();

const socketOnConection = (io: Server) => (socket: Socket) => {
  const user = socket.user!;
  userSocketIDs.set(user!._id.toString(), socket.id);
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(
      members?.map((member: any) => member._id.toString()),
    );
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await MessageModel.create(messageForDB);
    } catch (error) {
      throw new Error(error as unknown as string);
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(
      members?.map((member: any) => member._id),
    );
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(
      members?.map((member: any) => member._id),
    );
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());

    const membersSocket = getSockets(members?.map((member: any) => member._id));
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());

    const membersSocket = getSockets(members?.map((member: any) => member._id));
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
};

const initWebRTCSignallingServer = (socket: Socket) => {
  // When a user sends an offer, relay it to the intended recipient
  socket.on("send:offer", (data: { to: string; offer: any; mode?: string }) => {
    const { to, offer, mode } = data;
    const from = socket.user?._id?.toString();
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId && from) {
      socket.to(targetSocketId).emit("receive:offer", { offer, from, mode });
    }
  });

  // When a user sends an answer, relay it to the intended recipient
  socket.on("send:answer", (data: { to: string; answer: any }) => {
    const { to, answer } = data;
    const from = socket.user?._id?.toString();
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId && from) {
      socket.to(targetSocketId).emit("receive:answer", { answer, from });
    }
  });

  // When a user sends an ICE candidate, relay it to the intended recipient
  socket.on("send-ice-candidate", (data: { to: string; candidate: any }) => {
    const { to, candidate } = data;
    const from = socket.user?._id?.toString();
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId && from) {
      socket
        .to(targetSocketId)
        .emit("receive-ice-candidate", { candidate, from });
    }
  });

  // Relay hangup
  socket.on("call:hangup", (data: { to?: string | null }) => {
    const { to } = data || {};
    if (!to) return;
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("call:hangup");
    }
  });

  // Relay reject
  socket.on("call:reject", (data: { to?: string | null }) => {
    const { to } = data || {};
    if (!to) return;
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("call:rejected");
    }
  });

  // Send a call request to the intended recipient
  socket.on("send:call", (data: { to: string }) => {
    const { to } = data;
    const from = socket.user?._id?.toString();
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId && from) {
      socket.to(targetSocketId).emit("receive:call", { from });
    }
  });

  // Recipient accepts the call
  socket.on("accept:call", (data: { to: string }) => {
    const { to } = data;
    const from = socket.user?._id?.toString();
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId && from) {
      socket.to(targetSocketId).emit("call:accepted", { from });
    }
  });

  // Recipient rejects the call
  socket.on("reject:call", (data: { to: string }) => {
    const { to } = data;
    const from = socket.user?._id?.toString();
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId && from) {
      socket.to(targetSocketId).emit("call:rejected", { from });
    }
  });

  // Either party hangs up the call
  socket.on("hangup:call", (data: { to: string }) => {
    const { to } = data;
    const from = socket.user?._id?.toString();
    const targetSocketId = userSocketIDs.get(to);
    if (targetSocketId && from) {
      socket.to(targetSocketId).emit("call:hangup", { from });
    }
  });
};

export {
  userSocketIDs,
  onlineUsers,
  socketOnConection,
  initWebRTCSignallingServer,
};
