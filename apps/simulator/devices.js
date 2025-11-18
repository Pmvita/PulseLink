/**
 * Mock IoT devices for the PulseLink simulator
 * Devices are organized by property and room/zone
 */

// Generate devices for a property
export function generateDevicesForProperty(propertyId) {
  const baseDevices = [
    // Gate
    {id: `${propertyId}-gate-main`,
      name: "Main Gate",
      type: "door",
      status: "closed",
      value: false, // false = closed, true = open
      room: "Gate",
      propertyId: propertyId,
    },
    {id: `${propertyId}-gate-light-1`,
      name: "Gate Light",
      type: "switch",
      status: "off",
      value: false,
      room: "Gate",
      propertyId: propertyId,
    },
    {id: `${propertyId}-gate-sensor-1`,
      name: "Gate Motion Sensor",
      type: "sensor",
      status: "active",
      value: false,
      room: "Gate",
      propertyId: propertyId,
    },
    // Garage
    {id: `${propertyId}-garage-light-1`,
      name: "Garage Light",
      type: "switch",
      status: "off",
      value: false,
      room: "Garage",
      propertyId: propertyId,
    },
    {id: `${propertyId}-garage-door-main`,
      name: "Garage Door",
      type: "door",
      status: "closed",
      value: false, // false = closed, true = open
      room: "Garage",
      propertyId: propertyId,
    },
    // Living Room
    {id: `${propertyId}-living-lamp-1`,
      name: "Living Room Main Light",
      type: "switch",
      status: "off",
      value: false,
      room: "Living Room",
      propertyId: propertyId,
    },
    {id: `${propertyId}-living-fan-1`,
      name: "Living Room Ceiling Fan",
      type: "switch",
      status: "off",
      value: false,
      room: "Living Room",
      propertyId: propertyId,
    },
    // Bedroom
    {id: `${propertyId}-bedroom-lamp-1`,
      name: "Bedroom Light",
      type: "switch",
      status: "off",
      value: false,
      room: "Bedroom",
      propertyId: propertyId,
    },
    {id: `${propertyId}-bedroom-fan-1`,
      name: "Bedroom Fan",
      type: "switch",
      status: "off",
      value: false,
      room: "Bedroom",
      propertyId: propertyId,
    },
    // Kitchen
    {id: `${propertyId}-kitchen-light-1`,
      name: "Kitchen Light",
      type: "switch",
      status: "off",
      value: false,
      room: "Kitchen",
      propertyId: propertyId,
    },
    // Outdoor
    {id: `${propertyId}-outdoor-light-1`,
      name: "Outdoor Light",
      type: "switch",
      status: "off",
      value: false,
      room: "Outdoor",
      propertyId: propertyId,
    },
    // Sensors (shared across property)
    {id: `${propertyId}-sensor-temp-1`,
      name: "Temperature Sensor",
      type: "sensor",
      status: "active",
      value: 22,
      unit: "°C",
      room: "Outdoor",
      propertyId: propertyId,
    },
    {id: `${propertyId}-sensor-humidity-1`,
      name: "Humidity Sensor",
      type: "sensor",
      status: "active",
      value: 45,
      unit: "%",
      room: "Outdoor",
      propertyId: propertyId,
    },
  ];
  
  return baseDevices;
}

// All devices across all properties (will be populated dynamically)
export let devices = [];

// Initialize devices for all properties
export function initializeDevices(properties) {
  devices = [];
  properties.forEach((property) => {
    if (property.id) {
      const propertyDevices = generateDevicesForProperty(property.id);
      devices.push(...propertyDevices);
    }
  });
  console.log(`✅ Initialized ${devices.length} devices across ${properties.length} properties`);
}

/**
 * Get device by ID
 */
export function getDeviceById(id) {
  return devices.find((d) => d.id === id);
}

/**
 * Update device state
 */
export function updateDevice(id, updates) {
  const device = getDeviceById(id);
  if (device) {
    Object.assign(device, updates);
    
    // For switch devices, sync status with value
    if (device.type === "switch") {
      device.status = device.value ? "on" : "off";
    }
    
    // For door devices, sync status with value
    if (device.type === "door") {
      device.status = device.value ? "open" : "closed";
    }
    
    return device;
  }
  return null;
}

/**
 * Generate random sensor value for a sensor device
 */
export function generateSensorValue(device) {
  if (device.type !== "sensor") return null;
  
  // Temperature sensor: 18-26°C
  if (device.id.includes("temp") || device.name.toLowerCase().includes("temperature")) {
    return Number((18 + Math.random() * 8).toFixed(1));
  }
  
  // Humidity sensor: 30-70%
  if (device.id.includes("humidity") || device.name.toLowerCase().includes("humidity")) {
    return Number((30 + Math.random() * 40).toFixed(1));
  }
  
  // Motion sensor: boolean
  if (device.id.includes("motion") || device.name.toLowerCase().includes("motion")) {
    return Math.random() > 0.7; // 30% chance of motion detected
  }
  
  return device.value;
}

/**
 * Get devices for a specific property
 */
export function getDevicesByPropertyId(propertyId) {
  return devices.filter((d) => d.propertyId === propertyId);
}

/**
 * Get devices by room
 */
export function getDevicesByRoom(propertyId, room) {
  return devices.filter((d) => d.propertyId === propertyId && d.room === room);
}

