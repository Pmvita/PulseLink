import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useDeviceStore } from "../store/deviceStore";
import { Home, MapPin, RefreshCw } from "lucide-react-native";

const API_URL = "http://localhost:3001/api/properties";

interface PropertySelectionScreenProps {
  navigation: any;
}

export function PropertySelectionScreen({
  navigation,
}: PropertySelectionScreenProps) {
  const setSelectedProperty = useDeviceStore(
    (state) => state.setSelectedProperty
  );
  const setHasCompletedOnboarding = useDeviceStore(
    (state) => state.setHasCompletedOnboarding
  );

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSelectProperty = (property: any) => {
    setSelectedProperty({
      id: property.id,
      name: property.name,
      type: property.type,
      category: property.category,
      location: property.location,
    });
    setHasCompletedOnboarding(true);
    navigation.replace("MainTabs");
  };

  const renderProperty = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => handleSelectProperty(item)}
      activeOpacity={0.7}
    >
      <View style={styles.propertyHeader}>
        <View style={styles.iconContainer}>
          <Home size={24} color="#3B82F6" />
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{item.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#9ca3af" />
            <Text style={styles.locationText}>
              {item.location.city}, {item.location.country}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.propertyDetails}>
        <Text style={styles.propertyType}>{item.type}</Text>
        <Text style={styles.propertyCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Property</Text>
          <Text style={styles.subtitle}>
            Choose a property to manage its automation systems
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Property</Text>
          <Text style={styles.subtitle}>
            Choose a property to manage its automation systems
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchProperties}
            activeOpacity={0.8}
          >
            <RefreshCw size={18} color="#ffffff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Property</Text>
        <Text style={styles.subtitle}>
          Choose a property to manage its automation systems
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchProperties}
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchProperties}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f2937",
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    position: "relative",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
  },
  refreshButton: {
    position: "absolute",
    top: 60,
    right: 24,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#9ca3af",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dbeafe",
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
    color: "#111827",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 4,
  },
  propertyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  propertyType: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  propertyCategory: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "capitalize",
  },
});

