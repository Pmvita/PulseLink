/**
 * Broadcast utility for sending messages to all connected WebSocket clients
 */

/**
 * Broadcast a message to all connected clients
 * @param {Set} clients - Set of WebSocket clients
 * @param {Object} message - Message object to send
 */
export function broadcast(clients, message) {
  const jsonMessage = JSON.stringify(message);
  let count = 0;
  
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(jsonMessage);
        count++;
      } catch (error) {
        console.error("Error sending message to client:", error);
      }
    }
  });
  
  return count;
}

/**
 * Send message to a specific client
 * @param {WebSocket} client - WebSocket client
 * @param {Object} message - Message object to send
 */
export function sendToClient(client, message) {
  if (client.readyState === 1) {
    try {
      client.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }
  return false;
}

