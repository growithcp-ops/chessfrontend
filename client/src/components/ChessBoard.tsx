import { Chessboard } from "react-chessboard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChessBoardComponentProps {
  fen: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  orientation?: "white" | "black";
  isLocked?: boolean;
}

export function ChessBoardComponent({ 
  fen, 
  onPieceDrop, 
  orientation = "white",
  isLocked = false 
}: ChessBoardComponentProps) {
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative aspect-square w-full max-w-[600px] mx-auto",
        "rounded-lg overflow-hidden shadow-2xl border-8 border-secondary/30",
        "bg-gradient-to-br from-secondary/20 to-secondary/5"
      )}
    >
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300 pointer-events-none z-10",
        isLocked ? "bg-black/10 opacity-100" : "opacity-0"
      )} />
      
      <Chessboard 
        position={fen} 
        onPieceDrop={onPieceDrop}
        boardOrientation={orientation}
        arePiecesDraggable={!isLocked}
        customDarkSquareStyle={{ backgroundColor: "#4f5d75" }} // Slate-600 ish
        customLightSquareStyle={{ backgroundColor: "#dbeafe" }} // Blue-50
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        }}
        animationDuration={200}
      />
    </motion.div>
  );
}
