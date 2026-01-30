import { useEffect } from "react";
import { useChessGame } from "@/hooks/use-chess-game";
import { ChessBoardComponent } from "@/components/ChessBoard";
import { GameInfo } from "@/components/GameInfo";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const { 
    game, 
    fen, 
    moveHistory, 
    makeMove, 
    resetGame, 
    status: connectionStatus, 
    reconnect,
    gameState,
    isGameOver,
    turn
  } = useChessGame();

  // Auto-scroll to latest move
  useEffect(() => {
    const el = document.getElementById("moves-end");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [moveHistory]);

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background text-foreground flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight">
              Grandmaster<span className="text-primary">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reconnect}
              disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
              className="hidden md:flex"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
              {connectionStatus === 'connected' ? 'Connected' : 'Reconnect'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
          
          {/* Left Column: Board */}
          <div className="lg:col-span-8 w-full flex flex-col items-center">
            <div className="w-full relative group">
              {/* Glow effect behind board */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              
              <ChessBoardComponent 
                fen={fen} 
                onPieceDrop={makeMove}
                orientation="white"
                isLocked={isGameOver || turn === 'b'} 
              />
            </div>

            {/* Mobile Controls (visible only on small screens) */}
            <div className="mt-6 flex gap-4 w-full lg:hidden">
              <Button 
                onClick={resetGame} 
                className="flex-1 h-12 text-base shadow-lg shadow-primary/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Game
              </Button>
            </div>
          </div>

          {/* Right Column: Game Info & Controls */}
          <div className="lg:col-span-4 w-full h-full">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl overflow-hidden sticky top-24">
              <div className="p-6 pb-0">
                <GameInfo 
                  moveHistory={moveHistory}
                  status={gameState}
                  connectionStatus={connectionStatus}
                  turn={turn}
                  isGameOver={isGameOver}
                />
              </div>

              <div className="p-6 pt-2">
                <Separator className="my-4 bg-border/50" />
                
                <div className="space-y-4">
                  <Button 
                    onClick={resetGame} 
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    New Game
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground/60 leading-relaxed px-4">
                    Playing against Stockfish engine via WebSocket relay. 
                    <br />
                    Drag pieces to make moves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/40 text-center text-sm text-muted-foreground">
        <p>Built with React, Python & Chess.js</p>
      </footer>
    </div>
  );
}
