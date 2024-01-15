import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from 'src/app.module';
import { API_PREFIX } from './common/common.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('CrediReferral API')
    .setDescription(
      'The API provides endpoints for managing user accounts, generating referral links, tracking installations, and handling wallet transactions.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(API_PREFIX, app, document);

  await app.listen(3000);
}
bootstrap();
