import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useMemo } from "react";
import { useDeviceStore } from "../store/deviceStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { DeviceCard } from "../components/DeviceCard";
import { DoorControl } from "../components/DoorControl";
import {
  Home,
  Settings,
  Zap,
  Shield,
  Thermometer,
  Droplet,
  Sun,
  Moon,
  Clock,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  ChevronLeft,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Power,
  Video,
  Camera,
  MapPin,
} from "lucide-react-native";

interface PropertyDetailsScreenProps {
  navigation: any;
  route: any;
}

const API_URL = "http://localhost:3001";

export function PropertyDetailsScreen({
  navigation,
  route,
}: PropertyDetailsScreenProps) {
  const property = route.params?.property || useDeviceStore((state) => state.selectedProperty);
  const devices = useDeviceStore((state) => state.devices);
  const selectedProperty = useDeviceStore((state) => state.selectedProperty);
  const { isConnected, connectionStatus, connect } = useWebSocket();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"devices" | "automations" | "cameras" | "settings">("devices");
  
  // State for property-specific data
  const [propertyDevices, setPropertyDevices] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Filter devices for this property from store (fallback)
  const storeDevices = devices.filter((d) => {
    if (!property?.id) return d.status !== "offline";
    return (d.propertyId === property.id || d.id.includes(property.id)) && d.status !== "offline";
  });

  // Fetch weather data for property location using wttr.in (free, no API key required)
  const fetchWeatherData = async () => {
    if (!property?.location?.city) {
      return;
    }

    try {
      setWeatherLoading(true);
      const city = property.location.city;
      const country = property.location.country || "";
      // wttr.in supports city,country format
      const query = country ? `${city},${country}` : city;
      
      // Using wttr.in - free weather API, no API key required
      const weatherResponse = await fetch(
        `https://wttr.in/${encodeURIComponent(query)}?format=j1`
      );
      
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        const current = weatherData.current_condition?.[0];
        
        if (current) {
          setWeather({
            temperature: parseInt(current.temp_C) || 0,
            humidity: parseInt(current.humidity) || 0,
            description: current.weatherDesc?.[0]?.value || "",
            icon: "",
            city: weatherData.nearest_area?.[0]?.areaName?.[0]?.value || city,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch property-specific data
  const fetchPropertyData = async () => {
    if (!property?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch devices for this property
      const devicesResponse = await fetch(`${API_URL}/api/properties/${property.id}/devices`);
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        const fetchedDevices = devicesData.devices || [];
        setPropertyDevices(fetchedDevices);
        
        // Also add devices to store so WebSocket updates work
        const { setDevices } = useDeviceStore.getState();
        const currentDevices = useDeviceStore.getState().devices;
        
        // Merge fetched devices with existing store devices
        const mergedDevices = fetchedDevices.map((apiDevice: any) => {
          const existingDevice = currentDevices.find((d) => d.id === apiDevice.id);
          // Use existing device if it has updates, otherwise use API device
          return existingDevice || apiDevice;
        });
        
        // Add any new devices that aren't in the store yet
        fetchedDevices.forEach((apiDevice: any) => {
          if (!currentDevices.find((d) => d.id === apiDevice.id)) {
            mergedDevices.push(apiDevice);
          }
        });
        
        // Update store with merged devices
        setDevices([...currentDevices.filter(d => !fetchedDevices.find((fd: any) => fd.id === d.id)), ...mergedDevices]);
      }

      // Fetch cameras for this property
      const camerasResponse = await fetch(`${API_URL}/api/properties/${property.id}/cameras`);
      if (camerasResponse.ok) {
        const camerasData = await camerasResponse.json();
        setCameras(camerasData.cameras || []);
      }

      // Fetch automations for this property
      const automationsResponse = await fetch(`${API_URL}/api/properties/${property.id}/automations`);
      if (automationsResponse.ok) {
        const automationsData = await automationsResponse.json();
        setAutomations(automationsData.automations || []);
      }
    } catch (error) {
      console.error("Error fetching property data:", error);
      // Fallback to store devices
      setPropertyDevices(storeDevices);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPropertyData();
    fetchWeatherData();
    
    // Refresh weather every 10 minutes
    const weatherInterval = setInterval(() => {
      fetchWeatherData();
    }, 600000); // 10 minutes
    
    return () => clearInterval(weatherInterval);
  }, [property?.id, property?.location?.city]);

  const onRefresh = () => {
    setRefreshing(true);
    if (!isConnected) {
      connect();
    }
    fetchPropertyData();
    fetchWeatherData();
  };

  // Merge fetched devices with WebSocket updates from store
  // This ensures real-time updates are reflected even when using API-fetched devices
  const displayDevices = useMemo(() => {
    if (propertyDevices.length === 0) {
      return storeDevices;
    }
    
    // Merge API devices with store updates (store has latest WebSocket updates)
    return propertyDevices.map((apiDevice) => {
      const storeDevice = devices.find((d) => d.id === apiDevice.id);
      if (storeDevice) {
        // Use store device if it exists (has latest WebSocket updates)
        return storeDevice;
      }
      return apiDevice;
    });
  }, [propertyDevices, storeDevices, devices]);

  // Map automation icons and colors
  const getAutomationIcon = (name: string) => {
    if (name.toLowerCase().includes("morning")) return Sun;
    if (name.toLowerCase().includes("away")) return Lock;
    if (name.toLowerCase().includes("evening") || name.toLowerCase().includes("night")) return Moon;
    return Zap;
  };

  const getAutomationColor = (name: string) => {
    if (name.toLowerCase().includes("morning")) return "#F59E0B";
    if (name.toLowerCase().includes("away")) return "#EF4444";
    if (name.toLowerCase().includes("evening")) return "#8B5CF6";
    if (name.toLowerCase().includes("night")) return "#1e40af";
    return "#3B82F6";
  };

  // Room/Zone organization - use room property from devices
  const roomsMap = new Map<string, any[]>();
  displayDevices.forEach((device) => {
    const roomName = device.room || "Other";
    if (!roomsMap.has(roomName)) {
      roomsMap.set(roomName, []);
    }
    roomsMap.get(roomName)!.push(device);
  });
  
  const rooms = Array.from(roomsMap.entries())
    .map(([name, devices]) => ({ name, devices }))
    .filter((room) => room.devices.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  const onlineDevices = displayDevices.filter(
    (d) => d.status === "online" || d.status === "on" || d.status === "active"
  ).length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{property?.name || "Property Details"}</Text>
          <View style={styles.headerSubtitle}>
            {isConnected ? (
              <Wifi size={14} color="#10B981" />
            ) : (
              <WifiOff size={14} color="#EF4444" />
            )}
            <Text style={styles.headerSubtitleText}>
              {isConnected ? `${onlineDevices} devices online` : "Offline"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setActiveTab("settings")}
          activeOpacity={0.7}
        >
          <Settings size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Property Info Card */}
      <View style={styles.propertyInfoCard}>
        <View style={styles.propertyInfoRow}>
          <View style={styles.propertyInfoItem}>
            <Home size={20} color="#3B82F6" />
            <View style={styles.propertyInfoText}>
              <Text style={styles.propertyInfoLabel}>Type</Text>
              <Text style={styles.propertyInfoValue}>{property?.type || "Residential"}</Text>
            </View>
          </View>
          <View style={styles.propertyInfoItem}>
            <Shield size={20} color={isConnected ? "#10B981" : "#EF4444"} />
            <View style={styles.propertyInfoText}>
              <Text style={styles.propertyInfoLabel}>Status</Text>
              <Text style={styles.propertyInfoValue}>
                {isConnected ? "Active" : "Offline"}
              </Text>
            </View>
          </View>
        </View>
        {property?.location && (
          <View style={styles.propertyLocation}>
            <Text style={styles.propertyLocationText}>
              {property.location.address || `${property.location.city}, ${property.location.country}`}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "devices" && styles.tabActive]}
          onPress={() => setActiveTab("devices")}
          activeOpacity={0.7}
        >
          <Activity size={18} color={activeTab === "devices" ? "#3B82F6" : "#9ca3af"} />
          <Text
            style={[
              styles.tabText,
              activeTab === "devices" && styles.tabTextActive,
            ]}
          >
            Devices
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "automations" && styles.tabActive]}
          onPress={() => setActiveTab("automations")}
          activeOpacity={0.7}
        >
          <Zap size={18} color={activeTab === "automations" ? "#3B82F6" : "#9ca3af"} />
          <Text
            style={[
              styles.tabText,
              activeTab === "automations" && styles.tabTextActive,
            ]}
          >
            Automations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "cameras" && styles.tabActive]}
          onPress={() => setActiveTab("cameras")}
          activeOpacity={0.7}
        >
          <Video size={18} color={activeTab === "cameras" ? "#3B82F6" : "#9ca3af"} />
          <Text
            style={[
              styles.tabText,
              activeTab === "cameras" && styles.tabTextActive,
            ]}
          >
            Cameras
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.tabActive]}
          onPress={() => setActiveTab("settings")}
          activeOpacity={0.7}
        >
          <Settings size={18} color={activeTab === "settings" ? "#3B82F6" : "#9ca3af"} />
          <Text
            style={[
              styles.tabText,
              activeTab === "settings" && styles.tabTextActive,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "devices" && (
          <>
            {/* Stats Overview */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#3B82F6" + "20" }]}>
                  <Activity size={20} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{displayDevices.length}</Text>
                <Text style={styles.statLabel}>Devices</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#10B981" + "20" }]}>
                  <CheckCircle size={20} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{onlineDevices}</Text>
                <Text style={styles.statLabel}>Online</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#F59E0B" + "20" }]}>
                  <TrendingUp size={20} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>2.4</Text>
                <Text style={styles.statLabel}>kW/h</Text>
              </View>
            </View>

            {/* Climate Control */}
            {(displayDevices.some((d) => d.type === "sensor") || weather) && (
              <View style={styles.climateCard}>
                <Text style={styles.sectionTitle}>Climate Control</Text>
                
                {/* Real-time Weather from Location */}
                {weather && (
                  <View style={styles.weatherSection}>
                    <View style={styles.weatherHeader}>
                      <MapPin size={16} color="#9ca3af" />
                      <Text style={styles.weatherLocation}>
                        {weather.city || property?.location?.city}
                      </Text>
                      {weatherLoading && (
                        <ActivityIndicator size="small" color="#3B82F6" style={{ marginLeft: 8 }} />
                      )}
                    </View>
                    <View style={styles.climateData}>
                      <View style={styles.climateItem}>
                        <View style={[styles.climateIcon, { backgroundColor: "#F59E0B" + "20" }]}>
                          <Sun size={24} color="#F59E0B" />
                        </View>
                        <View style={styles.climateInfo}>
                          <Text style={styles.climateValue}>
                            {weather.temperature}°C
                          </Text>
                          <Text style={styles.climateLabel}>Outdoor Temperature</Text>
                          {weather.description && (
                            <Text style={styles.weatherDescription}>
                              {weather.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.climateItem}>
                        <View style={[styles.climateIcon, { backgroundColor: "#3B82F6" + "20" }]}>
                          <Droplet size={24} color="#3B82F6" />
                        </View>
                        <View style={styles.climateInfo}>
                          <Text style={styles.climateValue}>
                            {weather.humidity}%
                          </Text>
                          <Text style={styles.climateLabel}>Outdoor Humidity</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* Indoor Sensors */}
                {displayDevices.some((d) => d.type === "sensor") && (
                  <>
                    {weather && (
                      <View style={styles.divider} />
                    )}
                    <View style={styles.indoorSensorsHeader}>
                      <Text style={styles.indoorSensorsTitle}>Indoor Sensors</Text>
                    </View>
                    <View style={styles.climateData}>
                      {displayDevices
                        .filter((d) => d.id.includes("temp") || d.name?.toLowerCase().includes("temperature"))
                        .map((sensor) => (
                          <View key={sensor.id} style={styles.climateItem}>
                            <View style={[styles.climateIcon, { backgroundColor: "#EF4444" + "20" }]}>
                              <Thermometer size={24} color="#EF4444" />
                            </View>
                            <View style={styles.climateInfo}>
                              <Text style={styles.climateValue}>
                                {sensor.value || "N/A"}
                                {sensor.unit || "°C"}
                              </Text>
                              <Text style={styles.climateLabel}>Indoor Temperature</Text>
                            </View>
                          </View>
                        ))}
                      {displayDevices
                        .filter((d) => d.id.includes("humidity") || d.name?.toLowerCase().includes("humidity"))
                        .map((sensor) => (
                          <View key={sensor.id} style={styles.climateItem}>
                            <View style={[styles.climateIcon, { backgroundColor: "#3B82F6" + "20" }]}>
                              <Droplet size={24} color="#3B82F6" />
                            </View>
                            <View style={styles.climateInfo}>
                              <Text style={styles.climateValue}>
                                {sensor.value || "N/A"}
                                {sensor.unit || "%"}
                              </Text>
                              <Text style={styles.climateLabel}>Indoor Humidity</Text>
                            </View>
                          </View>
                        ))}
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Rooms/Devices by Room */}
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <View key={room.name} style={styles.roomSection}>
                  <Text style={styles.roomTitle}>{room.name}</Text>
                  {room.devices
                    .filter((d) => d.type !== "door") // Exclude doors from regular device list
                    .map((device) => (
                      <DeviceCard key={device.id} device={device} />
                    ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Activity size={64} color="#6b7280" />
                <Text style={styles.emptyTitle}>No Devices</Text>
                <Text style={styles.emptyText}>
                  {loading
                    ? "Loading devices..."
                    : isConnected
                    ? "No devices found for this property."
                    : "Connect to see devices for this property."}
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === "automations" && (
          <>
            <Text style={styles.sectionTitle}>Automation Scenes</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading automations...</Text>
              </View>
            ) : automations.length === 0 ? (
              <View style={styles.emptyState}>
                <Zap size={64} color="#6b7280" />
                <Text style={styles.emptyTitle}>No Automations</Text>
                <Text style={styles.emptyText}>
                  No automation scenes configured for this property.
                </Text>
              </View>
            ) : (
              automations.map((automation) => {
                const IconComponent = getAutomationIcon(automation.name);
                const iconColor = getAutomationColor(automation.name);
              return (
                <TouchableOpacity
                  key={automation.id}
                  style={[
                    styles.automationCard,
                    automation.active && styles.automationCardActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.automationHeader}>
                    <View
                      style={[
                        styles.automationIcon,
                        { backgroundColor: iconColor + "20" },
                      ]}
                    >
                      <IconComponent size={24} color={iconColor} />
                    </View>
                    <View style={styles.automationInfo}>
                      <Text style={styles.automationName}>{automation.name}</Text>
                      <Text style={styles.automationDescription}>
                        {automation.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.automationToggle,
                        automation.active && styles.automationToggleActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      {automation.active ? (
                        <Pause size={16} color="#ffffff" />
                      ) : (
                        <Play size={16} color="#ffffff" />
                      )}
                    </TouchableOpacity>
                  </View>
                    </TouchableOpacity>
              );
              })
            )}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Scheduled Routines</Text>
            <View style={styles.scheduledCard}>
              <View style={styles.scheduledHeader}>
                <Clock size={20} color="#3B82F6" />
                <Text style={styles.scheduledTitle}>Daily Schedule</Text>
              </View>
              <View style={styles.scheduledItem}>
                <Text style={styles.scheduledTime}>06:00 AM</Text>
                <Text style={styles.scheduledAction}>Morning Routine</Text>
              </View>
              <View style={styles.scheduledItem}>
                <Text style={styles.scheduledTime}>10:00 PM</Text>
                <Text style={styles.scheduledAction}>Night Mode</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === "cameras" && (
          <>
            <Text style={styles.sectionTitle}>Live Camera Feeds</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading cameras...</Text>
              </View>
            ) : cameras.length === 0 ? (
              <View style={styles.emptyState}>
                <Video size={64} color="#6b7280" />
                <Text style={styles.emptyTitle}>No Cameras</Text>
                <Text style={styles.emptyText}>
                  No cameras configured for this property.
                </Text>
              </View>
            ) : (
              <>
                {/* Camera Grid */}
                <View style={styles.cameraGrid}>
                  {cameras.map((camera) => (
                <TouchableOpacity
                  key={camera.id}
                  style={styles.cameraCard}
                  activeOpacity={0.8}
                >
                  <View style={styles.cameraFeedContainer}>
                    {camera.status === "online" ? (
                      <View style={styles.cameraFeed}>
                        <View style={styles.cameraFeedPlaceholder}>
                          <Camera size={48} color="#6b7280" />
                          <Text style={styles.cameraFeedText}>Live Feed</Text>
                          <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.cameraFeedOffline}>
                        <Camera size={48} color="#6b7280" />
                        <Text style={styles.cameraOfflineText}>Offline</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cameraInfo}>
                    <Text style={styles.cameraName}>{camera.name}</Text>
                    <Text style={styles.cameraLocation}>{camera.location}</Text>
                    <View style={styles.cameraStatus}>
                      <View
                        style={[
                          styles.cameraStatusDot,
                          {
                            backgroundColor:
                              camera.status === "online" ? "#10B981" : "#EF4444",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.cameraStatusText,
                          {
                            color:
                              camera.status === "online" ? "#10B981" : "#EF4444",
                          },
                        ]}
                      >
                        {camera.status === "online" ? "Online" : "Offline"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                  ))}
                </View>

                {/* Camera Stats */}
                <View style={styles.cameraStatsCard}>
              <View style={styles.cameraStatsHeader}>
                <Video size={20} color="#3B82F6" />
                <Text style={styles.cameraStatsTitle}>Camera System</Text>
              </View>
              <View style={styles.cameraStatsRow}>
                <View style={styles.cameraStatItem}>
                  <Text style={styles.cameraStatValue}>{cameras.length}</Text>
                  <Text style={styles.cameraStatLabel}>Total Cameras</Text>
                </View>
                <View style={styles.cameraStatItem}>
                  <Text style={styles.cameraStatValue}>
                    {cameras.filter((c) => c.status === "online").length}
                  </Text>
                  <Text style={styles.cameraStatLabel}>Online</Text>
                </View>
                <View style={styles.cameraStatItem}>
                  <Text style={styles.cameraStatValue}>
                    {cameras.filter((c) => c.status === "offline").length}
                  </Text>
                  <Text style={styles.cameraStatLabel}>Offline</Text>
                </View>
              </View>
            </View>
              </>
            )}
          </>
        )}

        {activeTab === "settings" && (
          <>
            <Text style={styles.sectionTitle}>Property Settings</Text>

            {/* Security Settings */}
            <View style={styles.settingsCard}>
              <View style={styles.settingsHeader}>
                <Shield size={20} color="#3B82F6" />
                <Text style={styles.settingsCardTitle}>Security</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>System Status</Text>
                <View style={styles.settingsValue}>
                  <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
                  <Text style={styles.settingsValueText}>Armed</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.settingsButtonItem} activeOpacity={0.7}>
                <Text style={styles.settingsButtonText}>Configure Security</Text>
                <ChevronLeft size={20} color="#9ca3af" style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
            </View>

            {/* Climate Settings */}
            <View style={styles.settingsCard}>
              <View style={styles.settingsHeader}>
                <Thermometer size={20} color="#3B82F6" />
                <Text style={styles.settingsCardTitle}>Climate</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Target Temperature</Text>
                <Text style={styles.settingsValueText}>22°C</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Auto Mode</Text>
                <View style={styles.settingsValue}>
                  <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
                  <Text style={styles.settingsValueText}>Enabled</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.settingsButtonItem} activeOpacity={0.7}>
                <Text style={styles.settingsButtonText}>Adjust Climate</Text>
                <ChevronLeft size={20} color="#9ca3af" style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
            </View>

            {/* Energy Settings */}
            <View style={styles.settingsCard}>
              <View style={styles.settingsHeader}>
                <TrendingUp size={20} color="#3B82F6" />
                <Text style={styles.settingsCardTitle}>Energy Management</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Daily Usage</Text>
                <Text style={styles.settingsValueText}>24.5 kWh</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Eco Mode</Text>
                <View style={styles.settingsValue}>
                  <View style={[styles.statusDot, { backgroundColor: "#F59E0B" }]} />
                  <Text style={styles.settingsValueText}>Disabled</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.settingsButtonItem} activeOpacity={0.7}>
                <Text style={styles.settingsButtonText}>View Energy Report</Text>
                <ChevronLeft size={20} color="#9ca3af" style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSubtitleText: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 6,
  },
  settingsButton: {
    padding: 8,
  },
  propertyInfoCard: {
    backgroundColor: "#374151",
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
  },
  propertyInfoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  propertyInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  propertyInfoText: {
    marginLeft: 12,
  },
  propertyInfoLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },
  propertyInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  propertyLocation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#4b5563",
  },
  propertyLocationText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#374151",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#1f2937",
  },
  tabText: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 6,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  climateCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  climateInfo: {
    flex: 1,
  },
  climateValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  climateLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  weatherSection: {
    marginBottom: 16,
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  weatherLocation: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 6,
    fontWeight: "500",
  },
  weatherDescription: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#4b5563",
    marginVertical: 16,
  },
  indoorSensorsHeader: {
    marginBottom: 12,
  },
  indoorSensorsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  doorsSection: {
    marginBottom: 24,
  },
  roomSection: {
    marginBottom: 24,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
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
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9ca3af",
  },
  automationCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  automationCardActive: {
    borderColor: "#3B82F6",
    borderWidth: 2,
    backgroundColor: "#1e3a5f",
  },
  automationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  automationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  automationInfo: {
    flex: 1,
  },
  automationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  automationDescription: {
    fontSize: 14,
    color: "#9ca3af",
  },
  automationToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  automationToggleActive: {
    backgroundColor: "#EF4444",
  },
  scheduledCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  scheduledHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scheduledTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  scheduledItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#4b5563",
  },
  scheduledTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  scheduledAction: {
    fontSize: 14,
    color: "#9ca3af",
  },
  settingsCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#4b5563",
  },
  settingsLabel: {
    fontSize: 14,
    color: "#9ca3af",
  },
  settingsValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  settingsValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  settingsButtonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#4b5563",
  },
  settingsButtonText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  cameraGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cameraCard: {
    width: "48%",
    backgroundColor: "#374151",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  cameraFeedContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#1f2937",
    position: "relative",
  },
  cameraFeed: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraFeedPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
    position: "relative",
  },
  cameraFeedText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  liveIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  cameraFeedOffline: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
    opacity: 0.5,
  },
  cameraOfflineText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  cameraInfo: {
    padding: 12,
  },
  cameraName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  cameraLocation: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
  },
  cameraStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  cameraStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  cameraStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  cameraStatsCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cameraStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cameraStatsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  cameraStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cameraStatItem: {
    alignItems: "center",
  },
  cameraStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  cameraStatLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

