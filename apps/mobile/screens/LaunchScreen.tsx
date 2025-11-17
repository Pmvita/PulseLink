import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useDeviceStore } from "../store/deviceStore";

interface LaunchScreenProps {
  navigation: any;
}

export function LaunchScreen({ navigation }: LaunchScreenProps) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for store to hydrate before checking auth
    const checkAuth = async () => {
      // Wait for hydration - Zustand persist should hydrate quickly
      // But we'll wait a bit to ensure it's complete
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait (more generous)
      
      while (attempts < maxAttempts) {
        const storeState = useDeviceStore.getState();
        const currentHydrated = storeState._hasHydrated;
        
        // If hydrated, proceed immediately
        if (currentHydrated) {
          break;
        }
        
        // Otherwise wait and check again
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      // Get fresh state after waiting for hydration
      const storeState = useDeviceStore.getState();
      const hydratedUser = storeState.user;
      const hydratedAuth = storeState.isAuthenticated;
      const hydratedOnboarding = storeState.hasCompletedOnboarding;

      console.log("Launch check after hydration:", {
        hydrated: storeState._hasHydrated,
        hasUser: !!hydratedUser,
        user: hydratedUser?.fullName,
        isAuthenticated: hydratedAuth,
        hasToken: !!storeState.token,
        hasOnboarding: hydratedOnboarding,
        selectedProperty: storeState.selectedProperty?.name,
      });

      setIsChecking(false);
      
      // Check if user is authenticated and has completed onboarding
      if (hydratedAuth && hydratedUser && hydratedOnboarding) {
        // User was previously signed in - auto-login
        console.log("Auto-login: User is authenticated, navigating to MainTabs");
        // Enable auto-connect for persisted authenticated users
        if (!storeState.shouldAutoConnect) {
          storeState.setShouldAutoConnect(true);
        }
        navigation.replace("MainTabs");
      } else if (hydratedOnboarding && !hydratedAuth) {
        // Completed onboarding but not signed in
        console.log("Onboarding completed but not authenticated, navigating to SignIn");
        navigation.replace("SignIn");
      } else {
        // First time user
        console.log("First time user, navigating to Onboarding");
        navigation.replace("Onboarding");
      }
    };

    // Start checking after a small delay to let React render
    const timer = setTimeout(() => {
      checkAuth();
    }, 200);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.logo}>⚡</Text>
      <Text style={styles.title}>PulseLink</Text>
      <Text style={styles.subtitle}>Smart Home Automation</Text>
      <ActivityIndicator
        size="large"
        color="#3B82F6"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 48,
  },
  loader: {
    marginTop: 32,
  },
});

