import { useEffect, useRef, useCallback } from "react";
import { useDeviceStore } from "../store/deviceStore";

const WS_URL = "ws://localhost:8080";
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  const {
    setDevices,
    updateDevice,
    addLog,
    setConnectionStatus,
    setIsConnected,
    shouldAutoConnect,
    isAuthenticated,
    isConnected: isConnectedState,
    connectionStatus: connectionStatusState,
  } = useDeviceStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus("connecting");
      addLog({
        type: "connection",
        message: `Connecting to ${WS_URL}...`,
      });

      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        setConnectionStatus("connected");
        addLog({
          type: "connection",
          message: "Connected to server",
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          addLog({
            type: "received",
            message: "Message received",
            data,
          });

          // Handle initial device list
          if (data.type === "devices" && Array.isArray(data.devices)) {
            setDevices(data.devices);
            addLog({
              type: "received",
              message: `Received ${data.devices.length} devices`,
            });
          }

          // Handle device update
          else if (data.type === "deviceUpdate") {
            updateDevice(data.deviceId, {
              status: data.status,
              value: data.value,
            });
          }

          // Handle errors
          else if (data.type === "error") {
            addLog({
              type: "error",
              message: data.message || "Server error",
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          addLog({
            type: "error",
            message: "Failed to parse message",
          });
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
        addLog({
          type: "error",
          message: "Connection error occurred",
        });
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setConnectionStatus("disconnected");
        addLog({
          type: "connection",
          message: "Disconnected from server",
        });

        // Attempt to reconnect
        if (shouldReconnectRef.current) {
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            const delay = RECONNECT_DELAY * reconnectAttemptsRef.current;
            
            addLog({
              type: "connection",
              message: `Reconnecting in ${delay / 1000}s (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`,
            });

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            addLog({
              type: "error",
              message: "Max reconnection attempts reached",
            });
          }
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setConnectionStatus("error");
      addLog({
        type: "error",
        message: "Failed to create connection",
      });
    }
  }, [setDevices, updateDevice, addLog, setConnectionStatus, setIsConnected]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          const jsonMessage = JSON.stringify(message);
          wsRef.current.send(jsonMessage);
          
          addLog({
            type: "sent",
            message: "Command sent",
            data: message,
          });
          
          return true;
        } catch (error) {
          console.error("Error sending message:", error);
          addLog({
            type: "error",
            message: "Failed to send message",
          });
          return false;
        }
      } else {
        addLog({
          type: "error",
          message: "Not connected to server",
        });
        return false;
      }
    },
    [addLog]
  );

  const toggleDevice = useCallback(
    (deviceId: string, value?: boolean) => {
      return sendMessage({
        deviceId,
        action: "toggle",
        value,
      });
    },
    [sendMessage]
  );

  // Auto-connect when user is authenticated and shouldAutoConnect is true
  useEffect(() => {
    // Only auto-connect if user is authenticated and auto-connect is enabled
    if (isAuthenticated && shouldAutoConnect && !isConnectedState && connectionStatusState !== "connecting") {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        connect();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, shouldAutoConnect, isConnectedState, connectionStatusState, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected: isConnectedState,
    connectionStatus: connectionStatusState,
    connect,
    disconnect,
    sendMessage,
    toggleDevice,
  };
}

