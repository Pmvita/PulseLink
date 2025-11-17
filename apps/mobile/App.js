import "react-native-reanimated";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { useDeviceStore } from "./store/deviceStore";
import { LaunchScreen } from "./screens/LaunchScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { SignInScreen } from "./screens/SignInScreen";
import { PropertySelectionScreen } from "./screens/PropertySelectionScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { SmartHomeDashboard } from "./screens/SmartHomeDashboard";
import { PropertiesScreen } from "./screens/PropertiesScreen";
import { PropertyDetailsScreen } from "./screens/PropertyDetailsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { CustomTabBar } from "./components/CustomTabBar";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Wrapper component to determine which home screen to show
function HomeScreenWrapper() {
  const navigation = useNavigation();
  const user = useDeviceStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  
  if (isAdmin) {
    return <SmartHomeDashboard navigation={navigation} />;
  }
  return <HomeScreen navigation={navigation} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ tabBarLabel: "Properties" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: "Settings" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Launch" component={LaunchScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen
          name="PropertySelection"
          component={PropertySelectionScreen}
        />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="PropertyDetails"
          component={PropertyDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
