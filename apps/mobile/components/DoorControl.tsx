import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Device } from "../store/deviceStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { Lock, Unlock, DoorOpen, DoorClosed, Activity } from "lucide-react-native";

interface DoorControlProps {
  device: Device;
}

export function DoorControl({ device }: DoorControlProps) {
  const { toggleDevice, isConnected } = useWebSocket();
  const isOpen = device.status === "open" || device.value === true;
  const isClosed = device.status === "closed" || device.value === false;

  const handleToggle = () => {
    if (!isConnected) {
      return;
    }
    // Toggle door: if closed, open it; if open, close it
    toggleDevice(device.id, !isOpen);
  };

  const getDoorIcon = () => {
    if (isOpen) {
      return DoorOpen;
    }
    return DoorClosed;
  };

  const getStatusColor = () => {
    if (isOpen) {
      return "#10B981"; // Green for open
    }
    return "#EF4444"; // Red for closed
  };

  const getStatusText = () => {
    if (isOpen) {
      return "Open";
    }
    if (isClosed) {
      return "Closed";
    }
    return "Unknown";
  };

  const Icon = getDoorIcon();
  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: statusColor + "20" }]}>
            <Icon size={32} color={statusColor} />
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{device.name}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.controlButton,
          { backgroundColor: statusColor },
          !isConnected && styles.controlButtonDisabled,
        ]}
        onPress={handleToggle}
        disabled={!isConnected}
        activeOpacity={0.8}
      >
        {isOpen ? (
          <>
            <Lock size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Close</Text>
          </>
        ) : (
          <>
            <Unlock size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Open</Text>
          </>
        )}
      </TouchableOpacity>

      {!isConnected && (
        <View style={styles.offlineIndicator}>
          <Activity size={14} color="#9ca3af" />
          <Text style={styles.offlineText}>Offline</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#374151",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#4b5563",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  controlButtonDisabled: {
    backgroundColor: "#6b7280",
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

