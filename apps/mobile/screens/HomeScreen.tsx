import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useDeviceStore } from "../store/deviceStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { DeviceCard } from "../components/DeviceCard";
import { StatusDot } from "../components/StatusDot";
import { Wifi, WifiOff, Plus, Home as HomeIcon } from "lucide-react-native";

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const devices = useDeviceStore((state) => state.devices);
  const selectedProperty = useDeviceStore((state) => state.selectedProperty);
  const { isConnected, connectionStatus, connect, disconnect } = useWebSocket();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    if (!isConnected) {
      connect();
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleConnectDevice = () => {
    // Navigate to Properties tab
    navigation.getParent()?.navigate("Properties");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Connection Status Banner */}
      {!isConnected && (
        <View style={styles.banner}>
          <StatusDot status={connectionStatus} size={10} />
          <Text style={styles.bannerText}>
            {connectionStatus === "connecting"
              ? "Connecting to server..."
              : connectionStatus === "error"
              ? "Connection error. Retrying..."
              : "Devices are offline. Connect to see your devices."}
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⚡ PulseLink</Text>
          {selectedProperty && (
            <View style={styles.propertyInfo}>
              <HomeIcon size={16} color="#9ca3af" />
              <Text style={styles.propertyName}>{selectedProperty.name}</Text>
            </View>
          )}
        </View>
        <View style={styles.statusRow}>
          {isConnected ? (
            <Wifi size={20} color="#10B981" />
          ) : (
            <WifiOff size={20} color="#EF4444" />
          )}
          <Text style={styles.statusText}>
            {isConnected
              ? `Connected • ${devices.length} devices`
              : "Offline"}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!isConnected ? (
          <View style={styles.emptyState}>
            <WifiOff size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>Devices Offline</Text>
            <Text style={styles.emptyText}>
              {devices.length > 0
                ? "Your devices are currently offline. The server connection has been lost. Reconnect to control your smart home."
                : "Your devices are currently offline. Connect to the server to control your smart home."}
            </Text>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectDevice}
              activeOpacity={0.8}
            >
              <Wifi size={20} color="#ffffff" />
              <Text style={styles.connectButtonText}>
                {devices.length > 0 ? "Reconnect" : "Connect Device"}
              </Text>
            </TouchableOpacity>
            {devices.length > 0 && (
              <View style={styles.offlineDevicesContainer}>
                <Text style={styles.offlineDevicesTitle}>
                  Offline Devices ({devices.length})
                </Text>
                {devices.map((device) => (
                  <View key={device.id} style={styles.offlineDeviceCard}>
                    <View style={styles.offlineDeviceInfo}>
                      <Text style={styles.offlineDeviceName}>{device.name}</Text>
                      <Text style={styles.offlineDeviceType}>{device.type}</Text>
                    </View>
                    <View style={styles.offlineIndicator}>
                      <WifiOff size={16} color="#EF4444" />
                      <Text style={styles.offlineText}>Offline</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Devices Found</Text>
            <Text style={styles.emptyText}>
              Connect a device to get started with smart home automation.
            </Text>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectDevice}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.connectButtonText}>Add Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.devicesHeader}>
              <Text style={styles.sectionTitle}>Your Devices</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleConnectDevice}
                activeOpacity={0.7}
              >
                <Plus size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f2937",
  },
  banner: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  bannerText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#92400e",
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  propertyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  propertyName: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#9ca3af",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  devicesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  connectButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  offlineDevicesContainer: {
    marginTop: 32,
    width: "100%",
  },
  offlineDevicesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  offlineDeviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  offlineDeviceInfo: {
    flex: 1,
  },
  offlineDeviceName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 4,
  },
  offlineDeviceType: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  offlineText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 4,
  },
});

