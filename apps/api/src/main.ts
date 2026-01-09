import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { validateRequiredConfig, logConfig } from './config/config.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Security: Basic security headers
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: configService.get<string>('frontend.url'),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });

  // Global validation
  //  docs: https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // filter out properties that should not be received by the method handler
      forbidNonWhitelisted: true, // stop the request from processing when non-whitelisted properties are present
      transform: true, // automatically transform payloads to be objects typed according to their DTO classes
    })
  );

  // Validate required environment variables
  validateRequiredConfig(configService);

  logConfig(configService);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
