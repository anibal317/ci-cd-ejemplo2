import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  setupSwagger(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`API:  http://localhost:${port}/tasks`);
  console.log(`Docs: http://localhost:${port}/docs`);
}

void bootstrap();
