import { Server as NetServer } from "http";
import { Socket, Server as SocketServer } from "socket.io";

type Message = {
  productId: string;
  text: string;
  userId: string;
};

export const getSocketIO = (): SocketServer => {
  const global = globalThis as any;
  if (!global.io) {
    // Retourner un mock de Socket.IO quand il n'est pas initialisé
    return {
      to: () => ({
        emit: () => {
          console.warn("Socket.IO n'est pas disponible, le message sera envoyé sans notification");
        },
      }),
    } as unknown as SocketServer;
  }
  return global.io;
};

export const initSocketIO = (server: NetServer): SocketServer => {
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

  io.on("connection", (socket: Socket) => {
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on("message", (message: Message) => {
      io.to(message.productId).emit("message", message);
    });

    socket.on("typing", ({ productId, userId }: { productId: string; userId: string }) => {
      socket.to(productId).emit("user-typing", { userId });
    });

    socket.on("stop-typing", ({ productId, userId }: { productId: string; userId: string }) => {
      socket.to(productId).emit("user-stop-typing", { userId });
    });
  });

  return io;
};

export function sendMessage(message: Message) {
  const io = getSocketIO();
  io.emit("message", message);
} 