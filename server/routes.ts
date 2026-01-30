import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // No API routes needed - chess game uses WebSocket for communication
  return httpServer;
}
