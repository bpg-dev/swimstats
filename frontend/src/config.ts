// Runtime configuration loaded from /config.json
// This allows OIDC settings to be configured at deployment time, not build time

export interface AppConfig {
  oidc?: {
    authority: string;
    clientId: string;
    redirectUri?: string;
  };
}

let config: AppConfig = {};

export async function loadConfig(): Promise<AppConfig> {
  try {
    // Add cache-busting to ensure fresh config on deployments
    const response = await fetch('/config.json', { cache: 'no-cache' });
    if (response.ok) {
      config = await response.json();
    }
  } catch {
    // Config not available - app will run in dev mode
  }
  return config;
}

export function getConfig(): AppConfig {
  return config;
}

export function isOidcConfigured(): boolean {
  return Boolean(config.oidc?.authority && config.oidc?.clientId);
}
