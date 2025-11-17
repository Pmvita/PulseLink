# PulseLink Device Simulator

WebSocket server that simulates IoT devices for the PulseLink mobile app.

## Features

- WebSocket server on port 8080
- Mock devices (lamps, fans, sensors)
- Real-time device state updates
- Automatic sensor value generation
- Multi-client support with broadcasting

## Installation

From the root directory:
```bash
npm install
```

Or from this directory:
```bash
cd apps/simulator
npm install
```

## Usage

Start the simulator:
```bash
npm start
```

Or from root:
```bash
npm run start:sim
```

## Devices

- **Smart Lamp** (`lamp-1`) - Toggle on/off
- **Ceiling Fan** (`fan-1`) - Toggle on/off
- **Temperature Sensor** (`sensor-1`) - Auto-updates every 3 seconds (18-26°C)
- **Humidity Sensor** (`sensor-2`) - Auto-updates every 3 seconds (30-70%)

## WebSocket Protocol

### Client → Server

Toggle device:
```json
{
  "deviceId": "lamp-1",
  "action": "toggle",
  "value": true
}
```

Set device value:
```json
{
  "deviceId": "sensor-1",
  "action": "set",
  "value": 25
}
```

### Server → Client

Initial device list:
```json
{
  "type": "devices",
  "devices": [...]
}
```

Device update:
```json
{
  "type": "deviceUpdate",
  "deviceId": "lamp-1",
  "status": "on",
  "value": true
}
```

## Testing on Physical Devices

If testing on a physical device (not simulator), you'll need to expose the server:

1. Install ngrok: `npm install -g ngrok`
2. Run: `npx ngrok http 8080`
3. Update the WebSocket URL in the mobile app to use the ngrok URL instead of `localhost`

