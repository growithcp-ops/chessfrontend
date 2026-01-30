// WebSocket Message Types for chess communication
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
