/**
 * Utility functions for formatting data
 */

export function formatDeviceValue(
  value: number | boolean | undefined,
  unit?: string
): string {
  if (value === undefined || value === null) return "N/A";

  if (typeof value === "boolean") {
    return value ? "ON" : "OFF";
  }

  if (typeof value === "number") {
    return `${value}${unit || ""}`;
  }

  return String(value);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

export function getDeviceIcon(type: string): string {
  switch (type) {
    case "switch":
      return "⚡";
    case "sensor":
      return "🌡️";
    default:
      return "📱";
  }
}

