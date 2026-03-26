import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { validateRequiredConfig, logConfig } from './config/config.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const isProduction = configService.get<string>('nodeEnv') === 'production';

  const PgStore = pgSession(session);

  app.use(helmet());

  app.use(
    session({
      store: new PgStore({
        conString: configService.get<string>('database.url'),
        createTableIfMissing: true,
      }),
      secret: configService.get<string>('session.secret')!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  app.enableCors({
    origin: configService.get<string>('frontend.url'),
    credentials: true,
    allowedHeaders: ['Content-Type'],
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

  // Serialize responses to remove sensitive data
  // docs: https://docs.nestjs.com/techniques/serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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
