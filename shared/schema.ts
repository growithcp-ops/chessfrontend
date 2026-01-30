import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We don't strictly need a DB for this architecture, but we'll define a table 
// to log finished games or store game state if needed in the future.
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  white: text("white").notNull().default("Human"),
  black: text("black").notNull().default("AI"),
  pgn: text("pgn"), // Portable Game Notation
  result: text("result"), // "1-0", "0-1", "1/2-1/2"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

// WebSocket Message Types
export const WS_MESSAGE_TYPES = {
  MOVE: 'move',
  ERROR: 'error',
  CONNECT: 'connect',
} as const;

export type ChessMove = {
  from: string;
  to: string;
  promotion?: string; // 'q', 'r', 'b', 'n'
};

export type WsMessage = 
  | { type: 'move'; move: string } // UCI string like "e2e4"
  | { type: 'error'; message: string };
