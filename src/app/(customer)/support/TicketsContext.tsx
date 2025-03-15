"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

export type ResponseItem = {
  id: string;
  response: string;
  createdAt: string;
  isAdmin: boolean;
  author: string;
};

export type Ticket = {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
  isResolved: boolean;
  responses: ResponseItem[];
};

type TicketsContextType = {
  tickets: Ticket[];
  loading: boolean;
  refreshTickets: () => Promise<void>;
  addTicket: (ticket: Ticket) => void;
};

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      // Ne pas exécuter cette requête pendant le build SSG/SSR
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/user/support-tickets");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des tickets");
      }
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Erreur:", error);
      // Éviter d'afficher des erreurs pendant le build
      if (typeof window !== "undefined") {
        toast.error("Impossible de charger vos tickets de support");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const refreshTickets = async () => {
    setLoading(true);
    await fetchTickets();
  };

  const addTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        loading,
        refreshTickets,
        addTicket,
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketsContext);
  if (context === undefined) {
    throw new Error("useTickets must be used within a TicketsProvider");
  }
  return context;
}
