import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from "react-native";
import { StatusDot } from "./StatusDot";
import { Device } from "../store/deviceStore";
import { formatDeviceValue } from "../utils/formatters";
import { useWebSocket } from "../hooks/useWebSocket";
import { LucideIcon } from "lucide-react-native";
import { Lightbulb, Fan, Thermometer, Droplet } from "lucide-react-native";
import { useState, useRef, useEffect } from "react";

interface DeviceCardProps {
  device: Device;
}

const deviceIcons: Record<string, LucideIcon> = {
  "lamp-1": Lightbulb,
  "fan-1": Fan,
  "sensor-1": Thermometer,
  "sensor-2": Droplet,
};

// Get icon based on device type and name
const getDeviceIcon = (device: Device): LucideIcon => {
  // Check if device ID matches known patterns
  if (device.id.includes("lamp") || device.id.includes("light") || device.name.toLowerCase().includes("light")) {
    return Lightbulb;
  }
  if (device.id.includes("fan") || device.name.toLowerCase().includes("fan")) {
    return Fan;
  }
  if (device.id.includes("temp") || device.id.includes("temperature") || device.name.toLowerCase().includes("temperature")) {
    return Thermometer;
  }
  if (device.id.includes("humidity") || device.name.toLowerCase().includes("humidity")) {
    return Droplet;
  }
  // Default based on type
  if (device.type === "sensor") {
    return Thermometer;
  }
  return Lightbulb;
};

export function DeviceCard({ device }: DeviceCardProps) {
  const Icon = getDeviceIcon(device);
  const { toggleDevice, isConnected, connect } = useWebSocket();
  const [isToggling, setIsToggling] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Determine if device is on/active
  // For switches: check status and value - prioritize value if available
  const isOn = device.type === "switch" 
    ? (device.value === true || device.status === "on")
    : (device.status === "on" || device.status === "active" || device.status === "online");
  const isOff = device.type === "switch"
    ? (device.value === false || device.status === "off")
    : (device.status === "off" || device.status === "offline" || device.status === "closed");
  
  // Debug: log device state changes
  useEffect(() => {
    console.log("DeviceCard state:", {
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      value: device.value,
      isOn,
      isOff,
    });
  }, [device.status, device.value, device.id, isOn, isOff]);
  
  // Get status color for switch devices
  const getStatusColor = () => {
    if (device.type === "switch") {
      return isOn ? "#10B981" : "#EF4444"; // Green for on, red for off
    }
    if (device.type === "sensor") {
      return device.status === "active" ? "#10B981" : "#9ca3af";
    }
    return "#9ca3af";
  };

  const handleToggle = () => {
    console.log("Device toggle pressed:", {
      deviceId: device.id,
      deviceName: device.name,
      currentStatus: device.status,
      isOn,
      isConnected,
      deviceType: device.type,
    });

    if (device.type === "sensor") {
      console.log("Cannot toggle sensor device");
      return;
    }

    if (!isConnected) {
      console.log("Not connected to server, attempting to connect...");
      // Try to connect if not connected
      connect();
      return;
    }

    if (isToggling) {
      console.log("Already toggling, please wait");
      return;
    }

    setIsToggling(true);
    
    // Animate press
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Toggle device - send the new value (opposite of current state)
    const newValue = !isOn;
    console.log("Sending toggle command:", {
      deviceId: device.id,
      action: "toggle",
      value: newValue,
    });
    
    const success = toggleDevice(device.id, newValue);
    console.log("Toggle command sent:", success);
    
    // Reset toggle state after animation
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleToggle}
        disabled={!isConnected || device.type === "sensor" || isToggling}
        activeOpacity={0.8}
        style={[
          styles.touchable,
          (!isConnected || device.type === "sensor") && styles.touchableDisabled,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBackground,
                {
                  backgroundColor:
                    device.type === "switch"
                      ? (isOn ? "#10B981" + "20" : "#EF4444" + "20")
                      : "#3B82F6" + "20",
                },
              ]}
            >
              <Icon
                size={24}
                color={
                  device.type === "switch"
                    ? isOn
                      ? "#10B981"
                      : "#EF4444"
                    : "#3B82F6"
                }
              />
            </View>
          </View>

          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{device.name}</Text>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor() },
                ]}
              />
            </View>

            <View style={styles.details}>
              <Text style={styles.value}>
                {formatDeviceValue(device.value, device.unit)}
              </Text>
              <Text style={styles.type}>{device.type}</Text>
            </View>
          </View>

          {device.type === "switch" && (
            <View
              style={[
                styles.toggleIndicator,
                {
                  backgroundColor: isOn ? "#10B981" : "#EF4444",
                  opacity: isToggling ? 0.6 : 1,
                },
              ]}
            >
              {isToggling ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.toggleText}>{isOn ? "ON" : "OFF"}</Text>
              )}
            </View>
          )}
          
          {!isConnected && device.type === "switch" && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>Offline</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
    overflow: "hidden",
  },
  touchable: {
    padding: 16,
  },
  touchableDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    padding: 12,
    borderRadius: 8,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 14,
    color: "#9ca3af",
    marginRight: 8,
  },
  type: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  toggleIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  offlineBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#6b7280",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offlineBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
});
