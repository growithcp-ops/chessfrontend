import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { useGameSocket } from './use-game-socket';
import { useToast } from './use-toast';

export function useChessGame() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAiMove = useCallback((uciMove: string) => {
    setGame((prevGame) => {
      // Create a new instance to mutate
      const newGame = new Chess(prevGame.fen());
      
      try {
        const from = uciMove.substring(0, 2);
        const to = uciMove.substring(2, 4);
        const promotion = uciMove.length > 4 ? uciMove.substring(4, 5) : undefined;
        
        newGame.move({ from, to, promotion });
        
        // Update local state derived from game
        setFen(newGame.fen());
        setMoveHistory(newGame.history());
        return newGame;
      } catch (e) {
        console.error("Invalid move from AI:", uciMove);
        return prevGame;
      }
    });
  }, []);

  const { status, sendMove, reconnect } = useGameSocket({
    onMove: handleAiMove,
  });

  function makeMove(sourceSquare: string, targetSquare: string) {
    // Optimistic UI update
    let moveResult = null;
    
    // We need to check if the move is legal first
    const safeGame = new Chess(game.fen());
    
    try {
      moveResult = safeGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to queen for simplicity in this demo
      });
    } catch (e) {
      // Illegal move
      return false;
    }

    if (moveResult) {
      // Update local state
      setGame(safeGame);
      setFen(safeGame.fen());
      setMoveHistory(safeGame.history());
      
      // Send to server
      const uci = moveResult.from + moveResult.to + (moveResult.promotion ? moveResult.promotion : "");
      sendMove(uci);
      return true;
    }
    
    return false;
  }

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    // Optionally send a reset command if the backend supports it, 
    // but the current spec only mentions moves. 
    // The AI doesn't keep state between connections usually in simple bridges, 
    // or we just start fresh sending moves from start pos.
  }, []);

  const gameState = useMemo(() => {
    if (game.isCheckmate()) return "Checkmate";
    if (game.isDraw()) return "Draw";
    if (game.isStalemate()) return "Stalemate";
    if (game.isGameOver()) return "Game Over";
    return game.turn() === 'w' ? "White to Move" : "Black to Move";
  }, [game]);

  return {
    game,
    fen,
    moveHistory,
    makeMove,
    resetGame,
    status,
    reconnect,
    gameState,
    isGameOver: game.isGameOver(),
    turn: game.turn()
  };
}
