import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

interface SocketServer extends HTTPServer {
  io?: IOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log("🚀 Initialisation de Socket.IO");
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
      },
    });

    io.on("connection", (socket) => {
      console.log("🔌 Client connecté:", socket.id);

      socket.on("join-room", (roomId: string) => {
        console.log("👥 Rejoindre la salle:", roomId);
        socket.join(roomId);
        socket.emit("room-joined", { roomId });
      });

      socket.on("leave-room", (roomId: string) => {
        console.log("👋 Quitter la salle:", roomId);
        socket.leave(roomId);
      });

      socket.on("send-message", (message) => {
        console.log("💬 Nouveau message:", message);
        io.to(message.productId).emit("new-message", message);
      });

      socket.on("typing", ({ productId, userId }) => {
        socket.to(productId).emit("user-typing", { userId });
      });

      socket.on("stop-typing", ({ productId, userId }) => {
        socket.to(productId).emit("user-stop-typing", { userId });
      });

      socket.on("disconnect", () => {
        console.log("❌ Client déconnecté:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler; 