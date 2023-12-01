import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Настройка .env файла
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Создание сессии
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('API серверной части BookLounge')
    .setDescription(
      'Этот сервис предоставляет легкий доступ к документации API команде разработки и другим сторонним разработчикам, чтобы они могли понять, как использовать маршруты и какие параметры ожидаются в запросах',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Настройка CORS
  app.enableCors({
    origin: 'http://localhost:5173', // подключение к Frontend части проекта
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
