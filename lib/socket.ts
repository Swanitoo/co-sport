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
      // ✅ Socket connecté
    });

    socket.on("room-joined", ({ roomId }) => {
      // ✅ Salle rejointe
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion:", error.message);
    });

    socket.on("disconnect", (reason) => {
      // ⚠️ Socket déconnecté
      
      // Tentative de reconnexion automatique
      if (reason === "io server disconnect" || reason === "transport close") {
        socket.connect();
      }
    });

    socket.io.on("reconnect", (attempt) => {
      // ✅ Reconnecté
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      // 🔄 Tentative de reconnexion
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