import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Monta la documentación OpenAPI en /docs (UI) y /docs-json (JSON).
 * Se separa de main.ts para poder reutilizarla en los tests e2e.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Tasks API')
    .setDescription(
      'API de tareas de ejemplo. El pipeline CI/CD exige los tests en verde antes de permitir un push o merge.',
    )
    .setVersion('1.0')
    .addTag('tasks', 'Creación, listado y finalización de tareas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
