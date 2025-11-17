import { View, Text, ScrollView } from "react-native";
import { useDeviceStore } from "../store/deviceStore";
import { formatTimestamp } from "../utils/formatters";
import { cn } from "../utils/cn";

export function LogConsole() {
  const logs = useDeviceStore((state) => state.logs);

  const getLogColor = (type: string) => {
    switch (type) {
      case "sent":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "received":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "connection":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "sent":
        return "📤";
      case "received":
        return "📥";
      case "error":
        return "❌";
      case "connection":
        return "🔌";
      default:
        return "📋";
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Console
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {logs.length} entries
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {logs.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-gray-400 dark:text-gray-500">
              No logs yet. Connect to see activity.
            </Text>
          </View>
        ) : (
          logs.map((log) => (
            <View
              key={log.id}
              className={cn(
                "mb-2 p-2 rounded border",
                getLogColor(log.type)
              )}
            >
              <View className="flex-row items-start">
                <Text className="text-base mr-2">{getLogIcon(log.type)}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {log.message}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </Text>
                  </View>
                  {log.data && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                      {JSON.stringify(log.data, null, 2)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

