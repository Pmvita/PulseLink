import { WebSocketServer } from "ws";
import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import chalk from "chalk";
import {
  devices,
  getDeviceById,
  updateDevice,
  generateSensorValue,
  initializeDevices,
  getDevicesByPropertyId,
} from "./devices.js";
import { broadcast, sendToClient } from "./utils/broadcast.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;
const HTTP_PORT = 3001;
const clients = new Set();

// Load properties from JSON file
let propertiesData = { estates: [] };
try {
  const propertiesPath = join(__dirname, "properties.json");
  const propertiesFile = readFileSync(propertiesPath, "utf-8");
  propertiesData = JSON.parse(propertiesFile);
  const propertyCount = propertiesData.estates.filter((e) => e.id).length;
  console.log(chalk.green(`✅ Loaded ${propertyCount} properties`));
  
  // Initialize devices for all properties
  const properties = propertiesData.estates.filter((e) => e.id);
  initializeDevices(properties);
} catch (error) {
  console.log(chalk.yellow(`⚠️  Could not load properties.json: ${error.message}`));
}

// Create HTTP server for REST API
const app = express();
app.use(cors());
app.use(express.json());

// Mock users database (same as Mvita-HQ)
const mockUsers = [
  {
    id: "1",
    username: "pierre.mvita",
    email: "pierre.mvita@mvita.com",
    fullName: "Pierre Mvita",
    role: "admin",
    title: "Family Office Chairman",
    permissions: ["all"],
    accessTier: 2,
    password: "admin123",
  },
  {
    id: "2",
    username: "staff.member",
    email: "staff.member@mvita.com",
    fullName: "Staff Member",
    role: "staff",
    title: "Operations Manager",
    permissions: ["dashboard", "security:view", "mobility", "collections:maintain", "staff:read"],
    accessTier: 1,
    password: "staff123",
  },
  {
    id: "3",
    username: "celine.mvita",
    email: "celine.mvita@mvita.com",
    fullName: "Celine Mvita",
    role: "family",
    title: "Family Member",
    permissions: ["estate:residential", "mobility", "collections", "staff:read"],
    accessTier: 1,
    password: "family123",
  },
  {
    id: "4",
    username: "divine.mvita",
    email: "divine.mvita@mvita.com",
    fullName: "Divine Mvita",
    role: "family",
    title: "Family Member",
    permissions: ["estate:residential", "mobility", "collections", "staff:read"],
    accessTier: 1,
    password: "family123",
  },
  {
    id: "5",
    username: "gloria.mvita",
    email: "gloria.mvita@mvita.com",
    fullName: "Gloria Mvita",
    role: "family",
    title: "Family Member",
    permissions: ["estate:residential", "mobility", "collections", "staff:read"],
    accessTier: 1,
    password: "family123",
  },
  {
    id: "6",
    username: "john.mvita",
    email: "john.mvita@mvita.com",
    fullName: "John Mvita",
    role: "family",
    title: "Family Member",
    permissions: ["estate:residential", "mobility", "collections", "staff:read"],
    accessTier: 1,
    password: "family123",
  },
];

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PulseLink API is running" });
});

// Authentication API endpoint
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user by username
    const user = mockUsers.find((u) => u.username === username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token (simplified - in production use JWT)
    const token = `pulselink-token-${Date.now()}-${user.id}`;

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    console.log(chalk.green(`✅ Login successful: ${username} (${user.role})`));
    
    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(chalk.red(`❌ Login error: ${error.message}`));
    res.status(500).json({ error: "Internal server error" });
  }
});

// Properties API endpoint
app.get("/api/properties", (req, res) => {
  // Filter out category headers and return only actual properties
  const properties = propertiesData.estates.filter((estate) => estate.id && estate.name);
  res.json({ properties });
});

// Get single property by ID
app.get("/api/properties/:id", (req, res) => {
  const property = propertiesData.estates.find((e) => e.id === req.params.id);
  if (property) {
    res.json({ property });
  } else {
    res.status(404).json({ error: "Property not found" });
  }
});

// Get devices for a specific property
app.get("/api/properties/:id/devices", (req, res) => {
  const propertyId = req.params.id;
  const propertyDevices = getDevicesByPropertyId(propertyId);
  res.json({ devices: propertyDevices });
});

// Get cameras for a specific property
app.get("/api/properties/:id/cameras", (req, res) => {
  const propertyId = req.params.id;
  // Generate cameras for the property (mock data - in real app would come from database)
  const cameras = [
    {
      id: `${propertyId}-camera-1`,
      name: "Front Entrance",
      location: "Main Gate",
      status: "online",
      propertyId: propertyId,
    },
    {
      id: `${propertyId}-camera-2`,
      name: "Living Room",
      location: "Main Floor",
      status: "online",
      propertyId: propertyId,
    },
    {
      id: `${propertyId}-camera-3`,
      name: "Backyard",
      location: "Outdoor",
      status: "online",
      propertyId: propertyId,
    },
    {
      id: `${propertyId}-camera-4`,
      name: "Garage",
      location: "Ground Floor",
      status: "offline",
      propertyId: propertyId,
    },
  ];
  res.json({ cameras });
});

// Get automations for a specific property
app.get("/api/properties/:id/automations", (req, res) => {
  const propertyId = req.params.id;
  // Generate automations for the property (mock data - in real app would come from database)
  const automations = [
    {
      id: `${propertyId}-automation-morning`,
      name: "Morning Routine",
      description: "Wake up lights, temperature, and security",
      active: false,
      propertyId: propertyId,
    },
    {
      id: `${propertyId}-automation-away`,
      name: "Away Mode",
      description: "Security enabled, lights off, temperature optimized",
      active: false,
      propertyId: propertyId,
    },
    {
      id: `${propertyId}-automation-evening`,
      name: "Evening Routine",
      description: "Dimmed lights, comfortable temperature",
      active: true,
      propertyId: propertyId,
    },
    {
      id: `${propertyId}-automation-night`,
      name: "Night Mode",
      description: "All lights off, security armed, temperature lowered",
      active: false,
      propertyId: propertyId,
    },
  ];
  res.json({ automations });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(chalk.cyan(`🌐 HTTP API server running on http://localhost:${HTTP_PORT}`));
  console.log(chalk.cyan(`   Available endpoints:`));
  console.log(chalk.cyan(`   - POST /api/auth/login`));
  console.log(chalk.cyan(`   - GET  /api/properties`));
  console.log(chalk.cyan(`   - GET  /api/properties/:id`));
  console.log(chalk.cyan(`   - GET  /api/properties/:id/devices`));
  console.log(chalk.cyan(`   - GET  /api/properties/:id/cameras`));
  console.log(chalk.cyan(`   - GET  /api/properties/:id/automations`));
  console.log(chalk.cyan(`   - GET  /api/health`));
});

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(chalk.green.bold(`\n🚀 PulseLink Device Simulator Server`));
console.log(chalk.cyan(`📡 WebSocket server running on ws://localhost:${PORT}\n`));

// Send initial device list to newly connected clients
// Optionally filter by propertyId if provided in connection message
function sendInitialDevices(client, propertyId = null) {
  let devicesToSend = devices;
  
  // Filter by property if specified
  if (propertyId) {
    devicesToSend = getDevicesByPropertyId(propertyId);
  }
  
  const message = {
    type: "devices",
    devices: devicesToSend.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      status: d.status,
      value: d.value,
      unit: d.unit,
      room: d.room,
      propertyId: d.propertyId,
    })),
  };
  sendToClient(client, message);
}

// Handle new connections
wss.on("connection", (ws) => {
  clients.add(ws);
  const clientCount = clients.size;
  
  console.log(chalk.green(`🟢 Client connected (${clientCount} total)`));
  
  // Send initial device list (all devices, client can filter by property)
  sendInitialDevices(ws);
  
  // Handle incoming messages from clients
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      // Handle device control commands
      if (message.deviceId && message.action) {
        const device = getDeviceById(message.deviceId);
        
        if (!device) {
          console.log(chalk.yellow(`⚠️  Unknown device: ${message.deviceId}`));
          sendToClient(ws, {
            type: "error",
            message: `Device ${message.deviceId} not found`,
          });
          return;
        }
        
        // Handle toggle action
        if (message.action === "toggle") {
          const newValue = message.value !== undefined ? message.value : !device.value;
          updateDevice(message.deviceId, { value: newValue });
          
          const icon = device.type === "switch" ? "💡" : "🌡️";
          const status = device.status === "on" ? chalk.green("ON") : chalk.red("OFF");
          console.log(chalk.blue(`${icon} ${device.name} toggled ${status}`));
          
          // Broadcast update to all clients
          broadcast(clients, {
            type: "deviceUpdate",
            deviceId: device.id,
            status: device.status,
            value: device.value,
          });
        }
        
        // Handle set value action (for sensors or custom values)
        else if (message.action === "set") {
          updateDevice(message.deviceId, { value: message.value });
          
          console.log(chalk.blue(`⚙️  ${device.name} set to: ${message.value}${device.unit || ""}`));
          
          broadcast(clients, {
            type: "deviceUpdate",
            deviceId: device.id,
            status: device.status,
            value: device.value,
          });
        }
      }
      
      // Handle property-specific device request
      else if (message.type === "getDevices" && message.propertyId) {
        const propertyDevices = getDevicesByPropertyId(message.propertyId);
        sendToClient(ws, {
          type: "devices",
          devices: propertyDevices.map((d) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            status: d.status,
            value: d.value,
            unit: d.unit,
            room: d.room,
            propertyId: d.propertyId,
          })),
        });
      }
      
      // Handle ping/keepalive
      else if (message.type === "ping") {
        sendToClient(ws, { type: "pong" });
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Error parsing message: ${error.message}`));
      sendToClient(ws, {
        type: "error",
        message: "Invalid message format",
      });
    }
  });
  
  // Handle client disconnect
  ws.on("close", () => {
    clients.delete(ws);
    const clientCount = clients.size;
    console.log(chalk.red(`🔴 Client disconnected (${clientCount} remaining)`));
  });
  
  // Handle errors
  ws.on("error", (error) => {
    console.error(chalk.red(`❌ WebSocket error: ${error.message}`));
  });
});

// Simulate random sensor updates every 3 seconds
setInterval(() => {
  devices.forEach((device) => {
    if (device.type === "sensor") {
      const newValue = generateSensorValue(device);
      if (newValue !== null && newValue !== device.value) {
        updateDevice(device.id, { value: newValue });
        
        const icon = device.id.includes("temp") || device.name.toLowerCase().includes("temperature") ? "🌡️" : 
                     device.id.includes("humidity") || device.name.toLowerCase().includes("humidity") ? "💧" : "📡";
        console.log(chalk.cyan(`${icon} ${device.name} updated value: ${device.value}${device.unit || ""}`));
        
        // Broadcast sensor update
        broadcast(clients, {
          type: "deviceUpdate",
          deviceId: device.id,
          status: device.status,
          value: device.value,
        });
      }
    }
  });
}, 3000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n\n⚠️  Shutting down server..."));
  wss.close(() => {
    console.log(chalk.green("✅ Server closed"));
    process.exit(0);
  });
});

