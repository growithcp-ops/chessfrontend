import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Trophy, Clock, Hash, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GameInfoProps {
  moveHistory: string[];
  status: string;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  turn: 'w' | 'b';
  isGameOver: boolean;
}

export function GameInfo({ 
  moveHistory, 
  status, 
  connectionStatus, 
  turn,
  isGameOver
}: GameInfoProps) {
  
  // Group moves into pairs for display
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1] || ""
    });
  }

  const getConnectionBadge = () => {
    switch(connectionStatus) {
      case 'connected': 
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Online</Badge>;
      case 'connecting':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500 animate-pulse">Connecting...</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Offline</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card className="h-full border-0 bg-transparent shadow-none">
      <CardHeader className="px-0 pb-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-display text-primary">Game Status</CardTitle>
          {getConnectionBadge()}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "p-3 rounded-lg border transition-all duration-300",
            turn === 'w' && !isGameOver ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-card border-border"
          )}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Player</div>
            <div className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border border-gray-300 shadow-sm" />
              White
            </div>
          </div>
          
          <div className={cn(
            "p-3 rounded-lg border transition-all duration-300",
            turn === 'b' && !isGameOver ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-card border-border"
          )}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Engine</div>
            <div className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black border border-gray-700 shadow-sm" />
              Black
            </div>
          </div>
        </div>
        
        {isGameOver && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{status}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-0">
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground font-display">
          <Hash className="w-4 h-4" />
          <span>Move History</span>
        </div>
        
        <ScrollArea className="h-[300px] w-full rounded-md border bg-card/50 p-4">
          <div className="space-y-1">
            {movePairs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-muted-foreground text-sm italic">
                <Clock className="w-8 h-8 mb-2 opacity-20" />
                Game has not started
              </div>
            ) : (
              movePairs.map((pair) => (
                <div key={pair.num} className="grid grid-cols-[30px_1fr_1fr] text-sm py-1 border-b border-border/40 last:border-0 hover:bg-white/5 px-2 rounded-sm transition-colors">
                  <span className="text-muted-foreground font-mono opacity-50">{pair.num}.</span>
                  <span className="font-medium text-foreground">{pair.white}</span>
                  <span className="font-medium text-foreground">{pair.black}</span>
                </div>
              ))
            )}
            <div id="moves-end" />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
