import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useDeviceStore } from "../store/deviceStore";
import { Wifi, CheckCircle, XCircle } from "lucide-react-native";

interface DeviceConnectionScreenProps {
  navigation: any;
}

export function DeviceConnectionScreen({
  navigation,
}: DeviceConnectionScreenProps) {
  const { isConnected, connectionStatus, connect, disconnect } = useWebSocket();
  const devices = useDeviceStore((state) => state.devices);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (connectionStatus === "connected") {
      setIsConnecting(false);
    }
  }, [connectionStatus]);

  const handleConnect = () => {
    setIsConnecting(true);
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
    setIsConnecting(false);
  };

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle size={64} color="#10B981" />;
    } else if (isConnecting || connectionStatus === "connecting") {
      return <ActivityIndicator size="large" color="#3B82F6" />;
    } else {
      return <XCircle size={64} color="#EF4444" />;
    }
  };

  const getStatusText = () => {
    if (isConnected) {
      return "Connected";
    } else if (isConnecting || connectionStatus === "connecting") {
      return "Connecting...";
    } else if (connectionStatus === "error") {
      return "Connection Error";
    } else {
      return "Disconnected";
    }
  };

  const getStatusDescription = () => {
    if (isConnected) {
      return `Successfully connected to your smart home system. ${devices.length} device${devices.length !== 1 ? "s" : ""} available.`;
    } else if (isConnecting || connectionStatus === "connecting") {
      return "Establishing connection to the server...";
    } else if (connectionStatus === "error") {
      return "Unable to connect to the server. Please check your connection and try again.";
    } else {
      return "Your devices are currently offline. Connect to start controlling your smart home.";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect Device</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Display */}
        <View style={styles.statusContainer}>
          <View style={styles.iconWrapper}>{getStatusIcon()}</View>
          <Text style={styles.statusTitle}>{getStatusText()}</Text>
          <Text style={styles.statusDescription}>
            {getStatusDescription()}
          </Text>
        </View>

        {/* Connection Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Wifi size={20} color="#9ca3af" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Server Address</Text>
              <Text style={styles.infoValue}>ws://localhost:8080</Text>
            </View>
          </View>
        </View>

        {/* Device List (if connected) */}
        {isConnected && devices.length > 0 && (
          <View style={styles.devicesContainer}>
            <Text style={styles.devicesTitle}>Connected Devices</Text>
            {devices.map((device) => (
              <View key={device.id} style={styles.deviceItem}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceType}>{device.type}</Text>
                </View>
                <View
                  style={[
                    styles.deviceStatus,
                    {
                      backgroundColor:
                        device.status === "online" || device.status === "on"
                          ? "#10B981"
                          : "#EF4444",
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isConnected ? (
            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={handleDisconnect}
              activeOpacity={0.8}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.connectButton]}
              onPress={handleConnect}
              disabled={isConnecting || connectionStatus === "connecting"}
              activeOpacity={0.8}
            >
              <Text style={styles.connectButtonText}>
                {isConnecting || connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Connect to Server"}
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f2937",
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    padding: 24,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconWrapper: {
    marginBottom: 24,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "monospace",
  },
  devicesContainer: {
    marginBottom: 24,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  deviceStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  connectButton: {
    backgroundColor: "#3B82F6",
  },
  connectButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  disconnectButton: {
    backgroundColor: "#EF4444",
  },
  disconnectButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

