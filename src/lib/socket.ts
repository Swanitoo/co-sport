import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export function getSocket() {
  if (!socket) {
    console.log("🔄 Initialisation du client Socket.IO");
    
    const url = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    console.log("🌐 URL de connexion:", url);
    
    socket = io(url, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      forceNew: true,
      rejectUnauthorized: false
    });

    socket.on("connect", () => {
      if (socket) {
        console.log("✅ Socket connecté avec ID:", socket.id);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket déconnecté:", reason);
      
      if (reason === "io server disconnect" || reason === "transport close") {
        console.log("🔄 Tentative de reconnexion dans 2 secondes...");
        setTimeout(() => {
          if (socket && !socket.connected) {
            socket.connect();
          }
        }, 2000);
      }
    });

    socket.io.on("reconnect", (attempt) => {
      console.log("✅ Reconnecté après", attempt, "tentatives");
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log("🔄 Tentative de reconnexion #", attempt);
    });

    socket.io.on("reconnect_error", (error) => {
      console.error("❌ Erreur de reconnexion:", error.message);
    });

    socket.io.on("reconnect_failed", () => {
      console.error("❌ Échec de la reconnexion");
      socket = undefined;
    });
  }

  return socket;
}

export function initSocket(url: string) {
  // 🔄 Initialisation du client Socket.IO
  // 🌐 URL de connexion

  const socket = io(url, {
    autoConnect: false,
  });

  socket.on("connect", () => {
    // ✅ Socket connecté
  });

  socket.on("disconnect", (reason) => {
    // ⚠️ Socket déconnecté
    // 🔄 Tentative de reconnexion dans 2 secondes...
    setTimeout(() => {
      socket.connect();
    }, 2000);
  });

  socket.io.on("reconnect", (attempt) => {
    // ✅ Reconnecté
  });

  socket.io.on("reconnect_attempt", (attempt) => {
    // 🔄 Tentative de reconnexion
  });

  return socket;
} 