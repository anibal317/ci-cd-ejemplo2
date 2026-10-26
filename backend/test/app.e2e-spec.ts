import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../src/swagger';

describe('Tasks (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /tasks devuelve una lista vacía', () => {
    return request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
  });

  it('POST /tasks crea una tarea y PATCH /tasks/:id/toggle la completa', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Probar el pipeline' })
      .expect(201);

    expect(created.body).toMatchObject({ title: 'Probar el pipeline', done: false });

    const toggled = await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}/toggle`)
      .expect(200);

    expect(toggled.body.done).toBe(true);
  });

  it('POST /tasks sin título responde 400', () => {
    return request(app.getHttpServer()).post('/tasks').send({}).expect(400);
  });

  it('PATCH /tasks/:id/toggle con id inexistente responde 404', () => {
    return request(app.getHttpServer()).patch('/tasks/no-existe/toggle').expect(404);
  });

  it('publica la documentación OpenAPI de Swagger', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200);

    expect(response.body.info.title).toBe('Tasks API');
    expect(response.body.paths).toHaveProperty('/tasks');
    expect(response.body.paths).toHaveProperty('/tasks/{id}/toggle');
    expect(response.body.components.schemas).toHaveProperty('CreateTaskDto');
    expect(response.body.components.schemas).toHaveProperty('TaskDto');
  });
});
