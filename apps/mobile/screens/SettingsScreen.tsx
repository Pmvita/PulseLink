import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useDeviceStore } from "../store/deviceStore";
import { Home, LogOut, RefreshCw, User } from "lucide-react-native";

interface SettingsScreenProps {
  navigation: any;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const selectedProperty = useDeviceStore((state) => state.selectedProperty);
  const user = useDeviceStore((state) => state.user);
  const setSelectedProperty = useDeviceStore((state) => state.setSelectedProperty);
  const setHasCompletedOnboarding = useDeviceStore(
    (state) => state.setHasCompletedOnboarding
  );
  const logout = useDeviceStore((state) => state.logout);

  const handleChangeProperty = () => {
    setSelectedProperty(null);
    setHasCompletedOnboarding(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "PropertySelection" }],
    });
  };

  const handleResetOnboarding = () => {
    setHasCompletedOnboarding(false);
    setSelectedProperty(null);
    navigation.reset({
      index: 0,
      routes: [{ name: "Onboarding" }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userIcon}>
                  <User size={24} color="#3B82F6" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userTitle}>{user.title}</Text>
                  <Text style={styles.userRole}>{user.role}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedProperty && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Property</Text>
            <View style={styles.propertyCard}>
              <View style={styles.propertyHeader}>
                <Home size={20} color="#3B82F6" />
                <Text style={styles.propertyName}>{selectedProperty.name}</Text>
              </View>
              <Text style={styles.propertyLocation}>
                {selectedProperty.location.city}, {selectedProperty.location.country}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleChangeProperty}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Change Property</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleResetOnboarding}
            activeOpacity={0.8}
          >
            <RefreshCw size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Reset Onboarding</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={() => {
              logout();
              // Navigate to sign in - onboarding and property selection are preserved
              navigation.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
              });
            }}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.logoutHint}>
            You'll stay signed in until you manually sign out
          </Text>
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
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  propertyCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  propertyLocation: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 28,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  userCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1e3a5f",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    marginTop: 12,
  },
  logoutHint: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});

