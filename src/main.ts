import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import * as cookieParser from 'cookie-parser';
import { ENV } from './constants/env';
import { readFileSync } from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('C:/Users/lovea/OneDrive/Desktop/key/localhost-key.pem'),
    cert: readFileSync('C:/Users/lovea/OneDrive/Desktop/key/localhost.pem'),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.use(cookieParser());
  app.enableCors({
    origin: 'https://localhost:4173',
    credentials: true,
  });
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  const port = configService.get<string>(ENV.PORT);

  app.setGlobalPrefix('api/');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
  });

  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);
}
bootstrap();
