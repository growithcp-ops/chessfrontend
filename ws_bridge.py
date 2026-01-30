import asyncio
import websockets
import socket
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

TCP_HOST = '127.0.0.1'
TCP_PORT = 65432
WS_PORT = 8765

async def forward_ws_to_tcp(ws, tcp_reader, tcp_writer):
    """Reads from WebSocket and writes to TCP"""
    try:
        async for message in ws:
            logger.info(f"WS -> TCP: {message}")
            try:
                data = json.loads(message)
                if data.get('type') == 'move':
                    move = data.get('move')
                    # Send newline-delimited JSON as expected by AI client
                    tcp_msg = json.dumps({"move": move}) + "\n"
                    tcp_writer.write(tcp_msg.encode())
                    await tcp_writer.drain()
            except json.JSONDecodeError:
                logger.error("Invalid JSON from WS")
    except Exception as e:
        logger.error(f"Error in forward_ws_to_tcp: {e}")

async def forward_tcp_to_ws(ws, tcp_reader):
    """Reads from TCP and writes to WebSocket"""
    try:
        while True:
            data = await tcp_reader.readline()
            if not data:
                break
            
            message = data.decode().strip()
            if message:
                logger.info(f"TCP -> WS: {message}")
                try:
                    # Parse TCP JSON and wrap in WS format
                    # Expecting AI to send: { "move": "e2e4" }
                    ai_data = json.loads(message)
                    ws_msg = {
                        "type": "move",
                        "move": ai_data.get("move")
                    }
                    await ws.send(json.dumps(ws_msg))
                except json.JSONDecodeError:
                    logger.error("Invalid JSON from TCP")
    except Exception as e:
        logger.error(f"Error in forward_tcp_to_ws: {e}")

async def handler(websocket):
    logger.info("New WebSocket connection")
    tcp_writer = None
    try:
        # Open a new TCP connection for each WebSocket client
        tcp_reader, tcp_writer = await asyncio.open_connection(TCP_HOST, TCP_PORT)
        logger.info(f"Connected to TCP server at {TCP_HOST}:{TCP_PORT}")

        # Run both forwarders concurrently
        task1 = asyncio.create_task(forward_ws_to_tcp(websocket, tcp_reader, tcp_writer))
        task2 = asyncio.create_task(forward_tcp_to_ws(websocket, tcp_reader))

        done, pending = await asyncio.wait(
            [task1, task2],
            return_when=asyncio.FIRST_COMPLETED,
        )

        for task in pending:
            task.cancel()

    except Exception as e:
        logger.error(f"Connection error: {e}")
        # Send error to frontend if possible
        try:
            await websocket.send(json.dumps({"type": "error", "message": "Failed to connect to AI server"}))
        except:
            pass
    finally:
        logger.info("Closing connection")
        if tcp_writer:
            tcp_writer.close()
            await tcp_writer.wait_closed()

async def main():
    logger.info(f"WebSocket bridge starting on 0.0.0.0:{WS_PORT}")
    async with websockets.serve(handler, "0.0.0.0", WS_PORT):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
