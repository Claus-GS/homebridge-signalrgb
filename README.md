# homebridge-signalrgb

A simple Homebridge platform plugin to control SignalRGB over its local REST API.

## What it exposes in HomeKit
- **SignalRGB Rainbow** (momentary switch; selects rainbow scene)
- **Solid** (momentary switch; sets Solid to the last selected color)
- **Pause Lighting** (toggle switch; ON = play, OFF = pause)

## Configuration
In Homebridge UI, add the platform and set:
- **host**: the LAN IP of the PC running SignalRGB (example: `192.168.2.112`)
- **port**: default `16038`

## Development
```bash
npm install
npm run build
```

## Install (local)
```bash
sudo -u homebridge /opt/homebridge/bin/npm install --prefix /var/lib/homebridge /path/to/homebridge-signalrgb
sudo hb-service restart
```
