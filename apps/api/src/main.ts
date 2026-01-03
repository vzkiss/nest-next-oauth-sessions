import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // CORS
  app.enableCors({
    origin: configService.get<string>('frontend.url'),
    credentials: true,
  });


  logConfig(configService);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  console.log(`Backend running on http://localhost: ${port})`);
}
bootstrap();

const logConfig = (configService: ConfigService) => {
  // Debug: Check if env vars are loaded
  console.log('[config] DATABASE_URL:', configService.get('database.url'));
  console.log(
    '[config] JWT_SECRET:',
    configService.get('jwt.secret') ? '✓ Loaded' : '✗ Missing'
  );
  console.log(
    '[config] GOOGLE_CLIENT_ID:',
    configService.get('google.clientId') ? '✓ Loaded' : '✗ Missing'
  );
};
