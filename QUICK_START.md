# PulseLink Quick Start Guide

## 🚀 Starting the Application

### Step 1: Start the Simulator Server

The simulator provides both WebSocket (for devices) and HTTP API (for authentication and properties).

**From the root directory:**
```bash
npm run start:sim
```

**Or from the simulator directory:**
```bash
cd apps/simulator
npm start
```

You should see:
```
🚀 PulseLink Device Simulator Server
📡 WebSocket server running on ws://localhost:8080
🌐 HTTP API server running on http://localhost:3001
   Available endpoints:
   - POST /api/auth/login
   - GET  /api/properties
   - GET  /api/properties/:id
   - GET  /api/health
```

### Step 2: Start the Mobile App

**In a new terminal, from the root directory:**
```bash
npm run start:mobile
```

**Or from the mobile directory:**
```bash
cd apps/mobile
npx expo start
```

### Step 3: Test the API

You can test if the server is running by visiting:
- Health check: http://localhost:3001/api/health
- Properties: http://localhost:3001/api/properties

## 🔐 Login Credentials

Use the same credentials as Mvita-HQ:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `pierre.mvita` | `admin123` |
| **Family** | `celine.mvita` | `family123` |
| **Family** | `divine.mvita` | `family123` |
| **Family** | `gloria.mvita` | `family123` |
| **Family** | `john.mvita` | `family123` |
| **Staff** | `staff.member` | `staff123` |

## 🐛 Troubleshooting

### "Failed to load resource: 404" Error

**Problem:** The simulator server is not running.

**Solution:**
1. Make sure the simulator is running (see Step 1)
2. Check that port 3001 is not already in use
3. Restart the simulator server

### "Cannot connect to server" Error

**Problem:** Network connection issue or wrong URL.

**Solution:**
1. Verify the simulator is running on `http://localhost:3001`
2. If testing on a physical device, use your computer's IP address instead of `localhost`
3. Check firewall settings

### "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Problem:** The server is returning HTML (404 page) instead of JSON.

**Solution:**
1. The simulator server is not running or the endpoint doesn't exist
2. Make sure you've restarted the simulator after adding the auth endpoint
3. Check the server console for errors

## 📱 App Flow

1. **Launch** → Splash screen
2. **Onboarding** → Welcome screens (first time only)
3. **Sign In** → Enter credentials
4. **Property Selection** → Choose a property
5. **Main Tabs** → Home, Devices, Settings

