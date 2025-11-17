import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useDeviceStore } from "../store/deviceStore";
import { Lock, User, AlertCircle } from "lucide-react-native";

const API_URL = "http://localhost:3001/api/auth/login";

interface SignInScreenProps {
  navigation: any;
}

export function SignInScreen({ navigation }: SignInScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useDeviceStore((state) => state.setUser);
  const setToken = useDeviceStore((state) => state.setToken);
  const setIsAuthenticated = useDeviceStore((state) => state.setIsAuthenticated);
  const setShouldAutoConnect = useDeviceStore((state) => state.setShouldAutoConnect);
  const setHasCompletedOnboarding = useDeviceStore((state) => state.setHasCompletedOnboarding);

  const handleSignIn = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          response.status === 404
            ? "Server not found. Please make sure the simulator is running on port 3001."
            : "Server error. Please try again."
        );
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${response.status})`);
      }

      const data = await response.json();
      
      // Store user and token - ensure all are set together
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      
      // Mark onboarding as complete after successful sign-in
      setHasCompletedOnboarding(true);
      
      // Enable auto-connect for authenticated users
      setShouldAutoConnect(true);
      
      // Verify state was set (for debugging)
      setTimeout(() => {
        const verifyState = useDeviceStore.getState();
        console.log("Sign-in state saved:", {
          hasUser: !!verifyState.user,
          hasToken: !!verifyState.token,
          isAuthenticated: verifyState.isAuthenticated,
          hasCompletedOnboarding: verifyState.hasCompletedOnboarding,
        });
      }, 100);

      // Route based on user role
      // Admin users go directly to dashboard, others select property
      if (data.user.role === "admin") {
        navigation.replace("MainTabs");
      } else {
        navigation.replace("PropertySelection");
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.message.includes("Failed to fetch") || err.message.includes("Network")) {
        setError(
          "Cannot connect to server. Please make sure the simulator is running:\n\ncd pulselink/apps/simulator\nnpm start"
        );
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>⚡</Text>
            <Text style={styles.title}>PulseLink</Text>
            <Text style={styles.subtitle}>Smart Home Automation</Text>
            <Text style={styles.description}>
              Sign in to access your family office properties
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <User size={20} color="#9ca3af" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#6b7280"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={20} color="#9ca3af" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                onSubmitEditing={handleSignIn}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.signInButton, loading && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={loading || !username || !password}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.credentialsHint}>
              <Text style={styles.credentialsHintText}>
                Demo Credentials:{"\n"}
                Admin: pierre.mvita / admin123{"\n"}
                Family: celine.mvita / family123{"\n"}
                Staff: staff.member / staff123
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f2937",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#9ca3af",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: "#ffffff",
    fontSize: 16,
    paddingRight: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7f1d1d",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  signInButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  signInButtonDisabled: {
    opacity: 0.5,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  credentialsHint: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#374151",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  credentialsHintText: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});

