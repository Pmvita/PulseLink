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
import { useState, useEffect } from "react";
import { useDeviceStore } from "../store/deviceStore";
import { Home, MapPin, Building2, RefreshCw, AlertCircle } from "lucide-react-native";

const API_URL = "http://localhost:3001/api/properties";

interface PropertiesScreenProps {
  navigation: any;
}

export function PropertiesScreen({ navigation }: PropertiesScreenProps) {
  const selectedProperty = useDeviceStore((state) => state.selectedProperty);
  const setSelectedProperty = useDeviceStore((state) => state.setSelectedProperty);
  const user = useDeviceStore((state) => state.user);

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = async () => {
    try {
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err: any) {
      setError(err.message || "Failed to load properties");
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const handleSelectProperty = (property: any) => {
    setSelectedProperty({
      id: property.id,
      name: property.name,
      type: property.type,
      category: property.category,
      location: property.location,
    });
    // Navigate to property details screen
    navigation.navigate("PropertyDetails", { property });
  };

  const renderProperty = ({ item }: { item: any }) => {
    const isSelected = selectedProperty?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.propertyCard, isSelected && styles.propertyCardSelected]}
        onPress={() => handleSelectProperty(item)}
        activeOpacity={0.7}
      >
        <View style={styles.propertyHeader}>
          <View style={styles.propertyIcon}>
            <Building2 size={24} color={isSelected ? "#3B82F6" : "#9ca3af"} />
          </View>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName}>{item.name}</Text>
            <View style={styles.propertyMeta}>
              <Text style={styles.propertyType}>{item.type}</Text>
              {item.category && (
                <>
                  <Text style={styles.propertySeparator}>•</Text>
                  <Text style={styles.propertyCategory}>{item.category}</Text>
                </>
              )}
            </View>
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>Active</Text>
            </View>
          )}
        </View>

        {item.location && (
          <View style={styles.propertyLocation}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.locationText}>
              {item.location.address || `${item.location.city}, ${item.location.country}`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Properties</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Properties</Text>
          <Text style={styles.subtitle}>
            {properties.length} {properties.length === 1 ? "property" : "properties"} available
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          <RefreshCw
            size={20}
            color="#ffffff"
            style={refreshing && styles.refreshingIcon}
          />
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
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Failed to Load Properties</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchProperties}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : properties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Building2 size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Properties Found</Text>
            <Text style={styles.emptyText}>
              No properties are currently available.
            </Text>
          </View>
        ) : (
          <>
            {selectedProperty && (
              <View style={styles.currentPropertyCard}>
                <View style={styles.currentPropertyHeader}>
                  <Home size={20} color="#3B82F6" />
                  <Text style={styles.currentPropertyTitle}>Current Property</Text>
                </View>
                <Text style={styles.currentPropertyName}>
                  {selectedProperty.name}
                </Text>
                <Text style={styles.currentPropertyLocation}>
                  {selectedProperty.location.city}, {selectedProperty.location.country}
                </Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>All Properties</Text>
            {properties.map((property) => renderProperty({ item: property }))}
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  refreshingIcon: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9ca3af",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
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
  currentPropertyCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  currentPropertyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  currentPropertyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 8,
  },
  currentPropertyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  currentPropertyLocation: {
    fontSize: 14,
    color: "#9ca3af",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  propertyCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  propertyCardSelected: {
    borderColor: "#3B82F6",
    borderWidth: 2,
    backgroundColor: "#1e3a5f",
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  propertyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  propertyMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyType: {
    fontSize: 14,
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  propertySeparator: {
    fontSize: 14,
    color: "#6b7280",
    marginHorizontal: 8,
  },
  propertyCategory: {
    fontSize: 14,
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  selectedBadge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  propertyLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#4b5563",
  },
  locationText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
    flex: 1,
  },
});

