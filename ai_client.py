import socket
import json
import random
import chess
import time
import argparse
import logging

# Simple AI client that connects to the TCP relay
# It plays random legal moves.

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

HOST = '127.0.0.1'
PORT = 65432

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--side", default="black", help="Side to play (black or white)")
    args = parser.parse_args()

    board = chess.Board()
    my_color = chess.BLACK if args.side.lower() == "black" else chess.WHITE

    logger.info(f"AI Client starting as {args.side}...")
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.connect((HOST, PORT))
            logger.info("Connected to TCP server")

            # If playing white, make first move
            if my_color == chess.WHITE:
                move = random.choice(list(board.legal_moves))
                board.push(move)
                msg = json.dumps({"move": move.uci()}) + "\n"
                s.sendall(msg.encode())
                logger.info(f"AI sent move: {move.uci()}")

            buffer = ""
            while True:
                data = s.recv(1024)
                if not data:
                    break
                
                buffer += data.decode()
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    if not line.strip():
                        continue
                    
                    try:
                        msg = json.loads(line)
                        opponent_move = msg.get("move")
                        if opponent_move:
                            logger.info(f"AI received move: {opponent_move}")
                            try:
                                board.push_uci(opponent_move)
                            except ValueError:
                                logger.error(f"Illegal move received: {opponent_move}")
                                continue

                            if board.is_game_over():
                                logger.info("Game over")
                                break

                            # AI Turn
                            if board.turn == my_color:
                                time.sleep(0.5) # Fake thinking time
                                moves = list(board.legal_moves)
                                if not moves:
                                    break
                                
                                # Simple evaluation: capture if possible, otherwise random
                                # This is "super realistic" only in that it plays legal moves :)
                                chosen_move = random.choice(moves)
                                for move in moves:
                                    if board.is_capture(move):
                                        chosen_move = move
                                        break
                                
                                board.push(chosen_move)
                                resp = json.dumps({"move": chosen_move.uci()}) + "\n"
                                s.sendall(resp.encode())
                                logger.info(f"AI sent move: {chosen_move.uci()}")
                                
                    except json.JSONDecodeError:
                        logger.error(f"Invalid JSON: {line}")

        except ConnectionRefusedError:
            logger.error("Could not connect to TCP server. Is it running?")
        except Exception as e:
            logger.error(f"AI Error: {e}")

if __name__ == "__main__":
    main()
