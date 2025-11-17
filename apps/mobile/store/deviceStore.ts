import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Device {
  id: string;
  name: string;
  type: "switch" | "sensor" | "door";
  status: "online" | "offline" | "on" | "off" | "active" | "open" | "closed";
  value?: number | boolean;
  unit?: string;
  room?: string;
  propertyId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: "sent" | "received" | "error" | "connection";
  message: string;
  data?: any;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  category: string;
  location: {
    city: string;
    country: string;
    address: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "staff" | "family" | "guest";
  title: string;
  permissions: string[];
  accessTier: number;
}

interface DeviceStore {
  devices: Device[];
  logs: LogEntry[];
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  hasCompletedOnboarding: boolean;
  selectedProperty: Property | null;
  shouldAutoConnect: boolean;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setDevices: (devices: Device[]) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  addLog: (entry: Omit<LogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;
  setConnectionStatus: (status: DeviceStore["connectionStatus"]) => void;
  setIsConnected: (connected: boolean) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setSelectedProperty: (property: Property | null) => void;
  setShouldAutoConnect: (autoConnect: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
}

export const useDeviceStore = create<DeviceStore & { _hasHydrated: boolean; setHasHydrated: () => void }>()(
  persist(
    (set) => ({
      devices: [],
      logs: [],
      isConnected: false,
      connectionStatus: "disconnected",
      hasCompletedOnboarding: false,
      selectedProperty: null,
      shouldAutoConnect: false,
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: () => set({ _hasHydrated: true }),

      setDevices: (devices) => set({ devices }),

      updateDevice: (id, updates) => {
        console.log("Updating device in store:", { id, updates });
        set((state) => {
          const deviceIndex = state.devices.findIndex((device) => device.id === id);
          
          if (deviceIndex === -1) {
            // Device not found in store - this shouldn't happen, but log it
            console.warn("Device not found in store for update:", id);
            console.log("Current devices in store:", state.devices.map(d => d.id));
            return state; // Don't update if device doesn't exist
          }
          
          const updatedDevices = state.devices.map((device) =>
            device.id === id ? { ...device, ...updates } : device
          );
          
          const updatedDevice = updatedDevices.find(d => d.id === id);
          console.log("Device updated in store:", {
            id: updatedDevice?.id,
            name: updatedDevice?.name,
            status: updatedDevice?.status,
            value: updatedDevice?.value,
          });
          
          return { devices: updatedDevices };
        });
      },

      addLog: (entry) =>
        set((state) => ({
          logs: [
            ...state.logs.slice(-99), // Keep last 100 logs
            {
              ...entry,
              id: `${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
            },
          ],
        })),

      clearLogs: () => set({ logs: [] }),

      setConnectionStatus: (status) =>
        set({ connectionStatus: status, isConnected: status === "connected" }),

      setIsConnected: (connected) =>
        set({
          isConnected: connected,
          connectionStatus: connected ? "connected" : "disconnected",
        }),

      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),

      setSelectedProperty: (property) => set({ selectedProperty: property }),

      setShouldAutoConnect: (autoConnect) =>
        set({ shouldAutoConnect: autoConnect }),

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          // Keep onboarding and property selection - user just needs to sign in again
          // hasCompletedOnboarding: false,
          // selectedProperty: null,
        }),
    }),
    {
      name: "pulselink-device-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        devices: state.devices,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        selectedProperty: state.selectedProperty,
        shouldAutoConnect: state.shouldAutoConnect,
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // Don't persist logs or _hasHydrated
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating store:", error);
          }
          
          console.log("Store rehydration complete:", {
            hasState: !!state,
            hasUser: !!state?.user,
            isAuthenticated: state?.isAuthenticated,
            hasToken: !!state?.token,
          });
          
          // Mark as hydrated after rehydration completes
          // Use setTimeout to ensure this runs after the state is fully set
          setTimeout(() => {
            useDeviceStore.setState({ _hasHydrated: true });
            console.log("Hydration flag set to true");
          }, 50);
        };
      },
    }
  )
);

// Helper hook to wait for hydration
export const useStoreHydration = () => {
  const hasHydrated = useDeviceStore((state) => state._hasHydrated);
  return hasHydrated;
};

