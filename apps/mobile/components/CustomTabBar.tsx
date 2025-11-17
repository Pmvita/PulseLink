import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Settings, Building2 } from "lucide-react-native";
import { useDeviceStore } from "../store/deviceStore";

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) {
  const selectedProperty = useDeviceStore((state) => state.selectedProperty);

  const icons: Record<string, any> = {
    Home: Home,
    Properties: Building2,
    Settings: Settings,
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const Icon = icons[route.name] || Home;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Don't show tab bar on onboarding/launch screens
        if (
          route.name === "Launch" ||
          route.name === "Onboarding" ||
          route.name === "PropertySelection"
        ) {
          return null;
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                isFocused && styles.iconContainerActive,
              ]}
            >
              <Icon
                size={22}
                color={isFocused ? "#3B82F6" : "#9ca3af"}
                fill={isFocused ? "#3B82F6" : "none"}
              />
              {route.name === "Properties" && selectedProperty && (
                <View style={styles.connectedDot} />
              )}
            </View>
            <Text
              style={[
                styles.label,
                isFocused && styles.labelActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    height: 70,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  iconContainerActive: {
    // Active state styling
  },
  connectedDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  label: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },
  labelActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});

