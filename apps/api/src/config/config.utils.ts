import { ConfigService } from '@nestjs/config';

// Simple logging for dev debugging

export const validateRequiredConfig = (configService: ConfigService) => {
  const required = [
    { key: 'jwt.secret', name: 'JWT_SECRET' },
    { key: 'database.url', name: 'DATABASE_URL' },
    { key: 'google.clientId', name: 'GOOGLE_CLIENT_ID' },
    { key: 'google.clientSecret', name: 'GOOGLE_CLIENT_SECRET' },
  ];

  const missing: string[] = [];
  for (const { key, name } of required) {
    if (!configService.get(key)) {
      missing.push(name);
    }
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
    ['jwt.secret', 'google.clientId', 'database.url'].forEach((key) => {
      const label = key
        .replace('jwt.secret', 'JWT_SECRET')
        .replace('google.clientId', 'GOOGLE_CLIENT_ID')
        .replace('database.url', 'DATABASE_URL');
      console.log(
        `[config] ${label}:`,
        configService.get(key) ? '✓ Loaded' : '✗ Missing'
      );
    });
  } else {
    // In production, only log critical missing configs
    if (!configService.get('jwt.secret')) {
      console.error('[config] ✗ JWT_SECRET is missing!');
    }
    if (!configService.get('database.url')) {
      console.error('[config] ✗ DATABASE_URL is missing!');
    }
  }
};
