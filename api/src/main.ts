import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { BigIntSerializerInterceptor } from './common/bigint-serializer.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(
    new BigIntSerializerInterceptor(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DevFlow API')
    .setDescription(
      'API REST para consulta das análises de Pull Requests, GitHub Events e Policy Gate do DevFlow.',
    )
    .setVersion('1.0.0')
    .addTag('Health')
    .addTag('Pull Requests')
    .addTag('Dashboard')
    .build();

  const swaggerDocument =
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'docs',
    app,
    swaggerDocument,
    {
      customSiteTitle: 'DevFlow API Docs',
    },
  );

  const port = Number(
    process.env.PORT ?? 3000,
  );

  await app.listen(port);

  console.log('');
  console.log(
    `DevFlow API: http://localhost:${port}`,
  );
  console.log(
    `Swagger:     http://localhost:${port}/docs`,
  );
  console.log('');
}

void bootstrap();