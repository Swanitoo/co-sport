import { io } from "socket.io-client";

let socket: ReturnType<typeof io>;

export function getSocket() {
  if (!socket) {
    console.log("🔄 Initialisation du client Socket.IO");
    
    socket = io({
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connecté avec ID:", socket.id);
    });

    socket.on("room-joined", ({ roomId }) => {
      console.log("✅ Salle rejointe:", roomId);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket déconnecté:", reason);
      
      // Tentative de reconnexion automatique
      if (reason === "io server disconnect" || reason === "transport close") {
        socket.connect();
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
      console.error("❌ Échec de la reconnexion après", socket.io.reconnectionAttempts, "tentatives");
    });
  }

  return socket;
} 