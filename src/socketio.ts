import { Server as NetServer } from "http";
import { Server as SocketServer } from "socket.io";

export const getSocketIO = () => {
  const global = globalThis as any;
  if (!global.io) {
    console.warn("Socket.IO n'est pas encore initialisé, les messages seront envoyés sans notification en temps réel");
    return {
      to: () => ({
        emit: () => {
          // Silently fail
          console.log("Socket.IO n'est pas disponible, le message sera envoyé sans notification");
        },
      }),
    } as SocketServer;
  }
  return global.io;
};

export const initSocketIO = (server: NetServer) => {
  const io = new SocketServer(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  (globalThis as any).io = io;

  io.on("connection", (socket) => {
    // 👤 Nouvelle connexion socket

    socket.on("join-room", (roomId: string) => {
      // ✅ Socket a rejoint la salle
      socket.join(roomId);
    });

    socket.on("leave-room", (roomId: string) => {
      // 👋 Socket a quitté la salle
      socket.leave(roomId);
    });

    socket.on("message", (message) => {
      // 📨 Nouveau message reçu
      io.to(message.productId).emit("message", message);
    });

    socket.on("typing", ({ productId, userId }) => {
      socket.to(productId).emit("user-typing", { userId });
    });

    socket.on("stop-typing", ({ productId, userId }) => {
      socket.to(productId).emit("user-stop-typing", { userId });
    });
  });

  return io;
};

export function sendMessage(message: Message) {
  if (!io) {
    // Socket.IO n'est pas disponible
    return;
  }

  io.on("connection", (socket) => {
    // 👤 Nouvelle connexion socket

    socket.on("join-room", (roomId) => {
      // ✅ Socket a rejoint la salle
      socket.join(roomId);
    });

    socket.on("leave-room", (roomId) => {
      // 👋 Socket a quitté la salle
      socket.leave(roomId);
    });

    socket.on("message", (message) => {
      // 📨 Nouveau message reçu
      io.to(message.productId).emit("message", message);
    });
  });
} 