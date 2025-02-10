import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
}

export interface PageParams<T = {}> {
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
}

export type LayoutParams<T extends Record<string, string | string[]>> = {
    children: React.ReactNode;
    params: T;
};