
# Homebridge SignalRGB

Control **SignalRGB** lighting from HomeKit using Homebridge and SignalRGB’s local REST API.

This plugin runs **entirely locally** — no cloud, no accounts, no latency.

---

## Features

- **Rainbow** — momentary switch to apply the Rainbow effect
- **Solid** — momentary switch to apply the Solid Color effect
- **Pause Lighting** — toggle to pause or resume SignalRGB lighting

---

## Requirements

- Homebridge v1.8 or newer
- Node.js v18+
- SignalRGB running on a PC connected to the same local network
- SignalRGB REST API enabled (default port `16038`)

---

## Installation

Install directly from the Homebridge UI:

1. Open **Homebridge UI**
2. Go to **Plugins**
3. Search for **homebridge-signalrgb**
4. Install and restart Homebridge

---

## Configuration

Add the platform in Homebridge UI or `config.json`:

```json
{
  "platform": "SignalRgbPlatform",
  "name": "SignalRGB",
  "host": "192.168.2.112",
  "port": 16038
}

```

host — Local IP address of the PC running SignalRGB
port — SignalRGB API port (default: 16038)

⸻

##Accessories in HomeKit

After restarting Homebridge, the following accessories will appear:
	•	Rainbow (switch)
	•	Solid (switch)
	•	Pause Lighting (switch)

The Rainbow and Solid switches act as momentary buttons and automatically reset after activation.

⸻

##Troubleshooting

Verify the SignalRGB API is reachable:

`curl http://<PC_IP>:16038/api/v1/lighting`

If this fails, ensure:
	•	SignalRGB is running
	•	Windows Firewall allows inbound connections on port 16038
	•	Homebridge and the PC are on the same network

⸻

License

Apache License 2.0
