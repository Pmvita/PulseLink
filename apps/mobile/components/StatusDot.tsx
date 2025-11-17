import { View, StyleSheet } from "react-native";

interface StatusDotProps {
  status: "online" | "offline" | "on" | "off" | "active" | "connecting" | "connected" | "disconnected" | "error";
  size?: number;
}

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  const getStatusColor = () => {
    switch (status) {
      case "online":
      case "on":
      case "active":
      case "connected":
        return "#22c55e"; // green-500
      case "offline":
      case "off":
      case "disconnected":
        return "#9ca3af"; // gray-400
      case "connecting":
        return "#eab308"; // yellow-500
      case "error":
        return "#ef4444"; // red-500
      default:
        return "#9ca3af"; // gray-400
    }
  };

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          backgroundColor: getStatusColor(),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 9999, // rounded-full
  },
});

