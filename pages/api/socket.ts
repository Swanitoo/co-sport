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
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 20000,
      allowEIO3: true
    });

    io.on("connection", (socket) => {
      socket.on("join-room", (roomId) => {
        socket.join(roomId);
      });

      socket.on("leave-room", (roomId) => {
        socket.leave(roomId);
      });

      socket.on("message", (message) => {
        io.to(message.productId).emit("message", message);
      });

      socket.on("disconnect", () => {
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