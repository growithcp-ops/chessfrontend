import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseGameSocketProps {
  onMove: (move: string) => void;
  onError?: (message: string) => void;
}

export function useGameSocket({ onMove, onError }: UseGameSocketProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    // Avoid multiple connections
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    // Calculate WebSocket URL based on current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    // Port 8765 as specified in requirements for the Python bridge
    const wsUrl = `${protocol}//${host}:8765`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Connected');
        setStatus('connected');
        toast({
          title: "Connected to AI",
          description: "Engine is ready. Good luck!",
          variant: "default",
          className: "bg-green-600 border-green-700 text-white"
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'move') {
            onMove(data.move);
          } else if (data.type === 'error') {
            const msg = data.message || "Unknown error";
            onError?.(msg);
            toast({
              title: "AI Error",
              description: msg,
              variant: "destructive"
            });
          }
        } catch (e) {
          console.error('[WS] Failed to parse message:', event.data);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected');
        setStatus('disconnected');
        socketRef.current = null;
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        setStatus('error');
        toast({
          title: "Connection Failed",
          description: "Could not connect to the Chess Engine bridge.",
          variant: "destructive"
        });
      };

      socketRef.current = ws;
    } catch (e) {
      console.error('[WS] Connection exception:', e);
      setStatus('error');
    }
  }, [onMove, onError, toast]);

  // Initial connection
  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMove = useCallback((move: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'move', move }));
    } else {
      toast({
        title: "Not Connected",
        description: "Waiting for connection to re-establish...",
        variant: "destructive"
      });
    }
  }, [toast]);

  return { status, sendMove, reconnect: connect };
}
