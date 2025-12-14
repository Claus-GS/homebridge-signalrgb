import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  CharacteristicValue,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { SignalRgbApi } from './signalrgbApi.js';

export class SignalRgbPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof import('homebridge').Characteristic;

  private readonly accessories: PlatformAccessory[] = [];
  private readonly apiClient: SignalRgbApi;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    const host = (this.config.host as string) ?? '';
    const port = (this.config.port as number) ?? 16038;

    const baseUrl = `http://${host}:${port}/api/v1`;
    this.apiClient = new SignalRgbApi(baseUrl);

    this.api.on('didFinishLaunching', () => {
      this.discoverDevices().catch((e) => this.log.error(String(e)));
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    // Remove old Lightbulb (legacy)
    const oldUuid = this.api.hap.uuid.generate('signalrgb-main');
    const old = this.accessories.find(a => a.UUID === oldUuid);
    if (old) {
      this.log.info('[SignalRGB] Removing old "SignalRGB" light accessory');
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [old]);
    }

    // Momentary: Rainbow
    await this.ensureMomentarySwitch(
      'signalrgb-rainbow-btn',
      'SignalRGB Rainbow',
      async () => this.apiClient.rainbow(),
    );

    // Momentary: Off (solid black)
    await this.ensureMomentarySwitch(
      'signalrgb-off-btn',
      'SignalRGB Off',
      async () => this.apiClient.off(),
    );

    // Toggle: Pause Lighting (INVERTED as requested)
    // Switch ON  -> enabled true  (start lighting)
    // Switch OFF -> enabled false (stop lighting)
    await this.ensurePauseSwitch('signalrgb-pause', 'Pause Lighting');
  }

  private async ensureMomentarySwitch(
    key: string,
    name: string,
    action: () => Promise<void>,
  ) {
    const uuid = this.api.hap.uuid.generate(key);
    const existing = this.accessories.find((a) => a.UUID === uuid);

    const accessory = existing ?? new this.api.platformAccessory(name, uuid);

    const service =
      accessory.getService(this.Service.Switch) ||
      accessory.addService(this.Service.Switch);

    service.setCharacteristic(this.Characteristic.Name, name);

    service.getCharacteristic(this.Characteristic.On)
      .onGet(() => false)
      .onSet(async (value: CharacteristicValue) => {
        if (!value) return;

        this.log.info(`[SignalRGB] Button pressed: ${name}`);
        try {
          await action();
        } catch (e) {
          this.log.error(`[SignalRGB] ${name} failed: ${String(e)}`);
        } finally {
          setTimeout(() => {
            service.updateCharacteristic(this.Characteristic.On, false);
          }, 250);
        }
      });

    if (!existing) {
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  private async ensurePauseSwitch(key: string, name: string) {
    const uuid = this.api.hap.uuid.generate(key);
    const existing = this.accessories.find((a) => a.UUID === uuid);

    const accessory = existing ?? new this.api.platformAccessory(name, uuid);

    const service =
      accessory.getService(this.Service.Switch) ||
      accessory.addService(this.Service.Switch);

    service.setCharacteristic(this.Characteristic.Name, name);

    service.getCharacteristic(this.Characteristic.On)
      .onGet(async () => {
        // ON means enabled true (lighting running)
        const enabled = await this.apiClient.getCanvasEnabled();
        return enabled;
      })
      .onSet(async (value: CharacteristicValue) => {
        const enabled = !!value; // ON => start, OFF => stop
        try {
          await this.apiClient.setCanvasEnabled(enabled);
        } catch (e) {
          this.log.error(`[SignalRGB] ${name} failed: ${String(e)}`);

          // snap UI back to real state
          try {
            const realEnabled = await this.apiClient.getCanvasEnabled();
            service.updateCharacteristic(this.Characteristic.On, realEnabled);
          } catch {}
          throw e;
        }
      });

    if (!existing) {
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }
}
