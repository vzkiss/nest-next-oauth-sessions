import { ConfigService } from '@nestjs/config';

export const validateRequiredConfig = (configService: ConfigService) => {
  const required = [
    { key: 'session.secret', name: 'SESSION_SECRET' },
    { key: 'database.url', name: 'DATABASE_URL' },
    { key: 'google.clientId', name: 'GOOGLE_CLIENT_ID' },
    { key: 'google.clientSecret', name: 'GOOGLE_CLIENT_SECRET' },
    { key: 'client.origin', name: 'CLIENT_ORIGIN' },
  ];

  const missing: string[] = [];
  for (const { key, name } of required) {
    if (!configService.get(key)) {
      missing.push(name);
    }
  }

  if (!configService.get<string>('google.callbackUrl')) {
    missing.push(
      'API_ORIGIN (or GOOGLE_CALLBACK_URL for a custom callback URL)'
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

export const logConfig = (configService: ConfigService) => {
  const nodeEnv = configService.get<string>('nodeEnv') || 'development';

  if (nodeEnv === 'development') {
    console.log(`[config] Environment: ${nodeEnv}`);
    ['session.secret', 'google.clientId', 'database.url'].forEach((key) => {
      const label = key
        .replace('session.secret', 'SESSION_SECRET')
        .replace('google.clientId', 'GOOGLE_CLIENT_ID')
        .replace('database.url', 'DATABASE_URL');
      console.log(
        `[config] ${label}:`,
        configService.get(key) ? '✓ Loaded' : '✗ Missing'
      );
    });
  } else {
    if (!configService.get('session.secret')) {
      console.error('[config] ✗ SESSION_SECRET is missing!');
    }
    if (!configService.get('database.url')) {
      console.error('[config] ✗ DATABASE_URL is missing!');
    }
  }
};
