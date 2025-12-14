export class SignalRgbApi {
  constructor(private readonly baseUrl: string) {}

  private async request(path: string, init?: RequestInit): Promise<void> {
    const url = `${this.baseUrl}${path}`;

    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`SignalRGB ${res.status} ${res.statusText} ${text}`);
    }
  }

  async solidColor(hex: string): Promise<void> {
    await this.request('/lighting/effects/Solid%20Color.html/apply', {
      method: 'POST',
      body: JSON.stringify({
        parameters: {
          color: hex,
          breathe: false,
          speed: 50,
        },
      }),
    });
  }

  async off(): Promise<void> {
    await this.solidColor('#000000');
  }

  async rainbow(): Promise<void> {
    await this.request('/lighting/effects/Rainbow.html/apply', { method: 'POST' });
  }

  async setCanvasEnabled(enabled: boolean): Promise<void> {
    await this.request('/lighting/enabled', {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
  }

  async getCanvasEnabled(): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/lighting`, {
      headers: { 'Content-Type': 'application/json' },
    });

    // If the API is unreachable, assume "enabled" so HomeKit doesn't get stuck
    if (!res.ok) return true;

    const json = (await res.json()) as any;
    return !!json?.data?.attributes?.enabled;
  }
}
