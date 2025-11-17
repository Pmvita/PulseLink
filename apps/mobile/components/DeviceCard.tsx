import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StatusDot } from "./StatusDot";
import { Device } from "../store/deviceStore";
import { formatDeviceValue } from "../utils/formatters";
import { LucideIcon } from "lucide-react-native";
import { Lightbulb, Fan, Thermometer, Droplet } from "lucide-react-native";

interface DeviceCardProps {
  device: Device;
}

const deviceIcons: Record<string, LucideIcon> = {
  "lamp-1": Lightbulb,
  "fan-1": Fan,
  "sensor-1": Thermometer,
  "sensor-2": Droplet,
};

export function DeviceCard({ device }: DeviceCardProps) {
  const Icon = deviceIcons[device.id] || Lightbulb;

  return (
    <TouchableOpacity
      onPress={() => {
        console.log("Device pressed:", device.id);
      }}
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Icon size={24} color="#3B82F6" />
          </View>
        </View>
        
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{device.name}</Text>
            <StatusDot status={device.status} />
          </View>
          
          <View style={styles.details}>
            <Text style={styles.value}>
              {formatDeviceValue(device.value, device.unit)}
            </Text>
            <Text style={styles.type}>{device.type}</Text>
          </View>
        </View>
        
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    backgroundColor: "#dbeafe",
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
    color: "#111827",
    marginRight: 8,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 8,
  },
  type: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  arrow: {
    color: "#9ca3af",
    fontSize: 20,
  },
});
