import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useMemo, useEffect } from "react";
import { useDeviceStore } from "../store/deviceStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { DeviceCard } from "../components/DeviceCard";
import { StatusDot } from "../components/StatusDot";
import {
  Home,
  Wifi,
  WifiOff,
  Plus,
  Settings,
  Zap,
  Activity,
  Shield,
  Thermometer,
  Droplet,
  Lock,
  Unlock,
  Sun,
  Moon,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";

interface SmartHomeDashboardProps {
  navigation: any;
}

export function SmartHomeDashboard({ navigation }: SmartHomeDashboardProps) {
  const devices = useDeviceStore((state) => state.devices);
  const selectedProperty = useDeviceStore((state) => state.selectedProperty);
  const user = useDeviceStore((state) => state.user);
  const shouldAutoConnect = useDeviceStore((state) => state.shouldAutoConnect);
  const { isConnected, connectionStatus, connect } = useWebSocket();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-connect on mount if user is authenticated and not already connected
  useEffect(() => {
    if (user && shouldAutoConnect && !isConnected && connectionStatus !== "connecting") {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        connect();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, shouldAutoConnect, isConnected, connectionStatus, connect]);

  const onRefresh = () => {
    setRefreshing(true);
    if (!isConnected) {
      connect();
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleConnectDevice = () => {
    // Navigate to Properties tab if needed, or keep on current screen
    // Connection happens automatically
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const onlineDevices = devices.filter(
      (d) => d.status === "online" || d.status === "on" || d.status === "active"
    ).length;
    const offlineDevices = devices.length - onlineDevices;
    
    // Get temperature and humidity sensors
    const tempSensor = devices.find((d) => d.id === "sensor-1" || d.name?.toLowerCase().includes("temperature"));
    const humiditySensor = devices.find((d) => d.id === "sensor-2" || d.name?.toLowerCase().includes("humidity"));
    
    // Get switches (lights, etc.)
    const switches = devices.filter((d) => d.type === "switch");
    const activeSwitches = switches.filter((d) => d.status === "on").length;
    
    // Calculate energy usage (mock - in real app would come from API)
    const energyUsage = activeSwitches * 0.5 + (tempSensor ? 0.2 : 0) + (humiditySensor ? 0.1 : 0);
    
    return {
      onlineDevices,
      offlineDevices,
      totalDevices: devices.length,
      tempSensor,
      humiditySensor,
      switches,
      activeSwitches,
      energyUsage: energyUsage.toFixed(1),
      securityStatus: "armed", // Mock - would come from security system
    };
  }, [devices]);

  // Get current time and greeting
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? "Morning" : currentHour < 18 ? "Afternoon" : "Evening";
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

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
        <View style={styles.headerContent}>
          <View style={styles.timeContainer}>
            <Clock size={16} color="#9ca3af" />
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
          <Text style={styles.greeting}>
            Good {timeOfDay.toLowerCase()}, {user?.fullName.split(" ")[0] || "Admin"}
          </Text>
          <Text style={styles.title}>Smart Home Dashboard</Text>
          {selectedProperty && (
            <View style={styles.propertyInfo}>
              <Home size={16} color="#9ca3af" />
              <Text style={styles.propertyName}>{selectedProperty.name}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.getParent()?.navigate("Settings")}
          activeOpacity={0.7}
        >
          <Settings size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Climate Control Card */}
        {(stats.tempSensor || stats.humiditySensor) && (
          <View style={styles.climateCard}>
            <View style={styles.climateHeader}>
              <Text style={styles.climateTitle}>Climate</Text>
              <View style={styles.climateStatus}>
                {isConnected ? (
                  <CheckCircle size={16} color="#10B981" />
                ) : (
                  <AlertCircle size={16} color="#EF4444" />
                )}
                <Text style={styles.climateStatusText}>
                  {isConnected ? "Active" : "Offline"}
                </Text>
              </View>
            </View>
            <View style={styles.climateData}>
              {stats.tempSensor && (
                <View style={styles.climateItem}>
                  <View style={[styles.climateIcon, { backgroundColor: "#EF4444" + "20" }]}>
                    <Thermometer size={20} color="#EF4444" />
                  </View>
                  <View style={styles.climateInfo}>
                    <Text style={styles.climateValue}>
                      {stats.tempSensor.value || "N/A"}
                      {stats.tempSensor.unit || "°C"}
                    </Text>
                    <Text style={styles.climateLabel}>Temperature</Text>
                  </View>
                </View>
              )}
              {stats.humiditySensor && (
                <View style={styles.climateItem}>
                  <View style={[styles.climateIcon, { backgroundColor: "#3B82F6" + "20" }]}>
                    <Droplet size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.climateInfo}>
                    <Text style={styles.climateValue}>
                      {stats.humiditySensor.value || "N/A"}
                      {stats.humiditySensor.unit || "%"}
                    </Text>
                    <Text style={styles.climateLabel}>Humidity</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Status Overview Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#3B82F6" + "20" }]}>
              <Activity size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.totalDevices}</Text>
            <Text style={styles.statLabel}>Devices</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#10B981" + "20" }]}>
              <Zap size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.onlineDevices}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#F59E0B" + "20" }]}>
              <TrendingUp size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.energyUsage}</Text>
            <Text style={styles.statLabel}>kW/h</Text>
          </View>
        </View>

        {/* Security Status Card */}
        <View
          style={[
            styles.securityCard,
            {
              borderLeftColor:
                stats.securityStatus === "armed" ? "#10B981" : "#F59E0B",
            },
          ]}
        >
          <View style={styles.securityHeader}>
            {stats.securityStatus === "armed" ? (
              <Lock size={20} color="#10B981" />
            ) : (
              <Unlock size={20} color="#F59E0B" />
            )}
            <Text style={styles.securityTitle}>
              Security System {stats.securityStatus === "armed" ? "Armed" : "Disarmed"}
            </Text>
          </View>
          <Text style={styles.securityText}>
            {stats.securityStatus === "armed"
              ? "All security systems are active and monitoring."
              : "Security systems are disarmed."}
          </Text>
        </View>

        {/* Connection Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {isConnected ? (
              <Wifi size={20} color="#10B981" />
            ) : (
              <WifiOff size={20} color="#EF4444" />
            )}
            <Text style={styles.statusCardTitle}>
              {isConnected ? "System Connected" : "System Offline"}
            </Text>
          </View>
          <Text style={styles.statusCardText}>
            {isConnected
              ? `All systems operational. ${devices.length} device${devices.length !== 1 ? "s" : ""} connected.`
              : "Connect to the server to control your smart home devices."}
          </Text>
          {!isConnected && (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectDevice}
              activeOpacity={0.8}
            >
              <Wifi size={18} color="#ffffff" />
              <Text style={styles.connectButtonText}>Connect Now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleConnectDevice}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#3B82F6" + "20" }]}>
                <Zap size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionLabel}>All Lights</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#10B981" + "20" }]}>
                <Shield size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionLabel}>Security</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#F59E0B" + "20" }]}>
                <Thermometer size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionLabel}>Climate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#8B5CF6" + "20" }]}>
                <Settings size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionLabel}>Scenes</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerContent: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 6,
    fontWeight: "500",
  },
  greeting: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 4,
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
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  statusCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  statusCardText: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 12,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  connectButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionHeader: {
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
  climateCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  climateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  climateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  climateStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  climateStatusText: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 6,
  },
  climateData: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  climateItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  climateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  climateInfo: {
    flex: 1,
  },
  climateValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  climateLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  securityCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 28,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
});

