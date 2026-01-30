import socket
import threading
import logging

# A simple TCP relay server that allows two clients to connect and talk to each other.
# For this specific task, we expect:
# 1. The AI client connects.
# 2. The WS bridge connects (on behalf of a user).
# Ideally, we should pair them up. 
# To keep it "minimal but working", we'll implement a simple broadcast or 1-to-1 pairing.
# Let's do a simple 1-to-1 relay: First connection is Player A, Second is Player B.
# Actually, the task says "AI client connects to that TCP server". 
# The bridge "opens a TCP connection to ...".
# So the server sits in the middle.

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

HOST = '127.0.0.1'
PORT = 65432

clients = []

def handle_client(conn, addr):
    logger.info(f"New connection from {addr}")
    clients.append(conn)
    try:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            # Broadcast to other clients (simple relay)
            for client in clients:
                if client != conn:
                    try:
                        client.sendall(data)
                    except:
                        clients.remove(client)
    except Exception as e:
        logger.error(f"Error handling client {addr}: {e}")
    finally:
        logger.info(f"Connection closed from {addr}")
        if conn in clients:
            clients.remove(conn)
        conn.close()

def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen()
    logger.info(f"TCP Relay Server listening on {HOST}:{PORT}")

    while True:
        conn, addr = server.accept()
        thread = threading.Thread(target=handle_client, args=(conn, addr))
        thread.start()

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        pass
