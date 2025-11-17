import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Home, Shield, Zap } from "lucide-react-native";

interface OnboardingScreenProps {
  navigation: any;
}

const { width } = Dimensions.get("window");

export function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Home,
      title: "Welcome to PulseLink",
      description:
        "Control your smart home properties from anywhere. Manage all your estates and their automation systems in one place.",
      color: "#3B82F6",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your data is encrypted and secure. We never share your information with third parties.",
      color: "#10B981",
    },
    {
      icon: Zap,
      title: "Real-Time Control",
      description:
        "Monitor and control your devices in real-time. Get instant updates and notifications.",
      color: "#F59E0B",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace("SignIn");
    }
  };

  const handleSkip = () => {
    navigation.replace("SignIn");
  };

  const Step = steps[currentStep];
  const Icon = Step.icon;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: Step.color + "20" }]}>
            <Icon size={64} color={Step.color} />
          </View>

          <Text style={styles.title}>{Step.title}</Text>
          <Text style={styles.description}>{Step.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.indicatorContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentStep && styles.indicatorActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {currentStep < steps.length - 1 ? (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: Step.color }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {currentStep < steps.length - 1 ? "Next" : "Get Started"}
              </Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  footer: {
    paddingBottom: 32,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#374151",
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: "#3B82F6",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  placeholder: {
    width: 60,
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

