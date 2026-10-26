/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ¿QUÉ SE TESTEA AQUÍ?
 *   El controlador TasksController → backend/src/tasks/tasks.controller.ts
 *
 * Tipo de test: unitario de controlador (sin HTTP real).
 *   El servicio real se sustituye por un mock para comprobar SOLO que el
 *   controlador delega bien y devuelve lo que recibe.
 *   Para el comportamiento HTTP de verdad (rutas, status, body) está
 *   backend/test/app.e2e-spec.ts.
 * Dónde está: junto al controlador, siguiendo la convención `*.spec.ts`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { Task, TasksService } from './tasks.service';

describe('TasksController · endpoints /tasks', () => {
  let controller: TasksController;

  // Mock del servicio: cada método es un jest.fn() que controlamos en cada test.
  const tasksService = {
    findAll: jest.fn(),
    create: jest.fn(),
    toggle: jest.fn(),
  };

  const pendingTask: Task = {
    id: 'task-1',
    title: 'Escribir un test claro',
    done: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Arrange común: módulo de Nest con el controlador real y el servicio mockeado.
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksService }],
    }).compile();

    controller = moduleRef.get(TasksController);
  });

  it('GET /tasks devuelve el listado que entrega el servicio', () => {
    // Arrange
    tasksService.findAll.mockReturnValue([pendingTask]);

    // Act
    const result = controller.findAll();

    // Assert: el controlador no transforma nada, solo delega.
    expect(result).toEqual([pendingTask]);
    expect(tasksService.findAll).toHaveBeenCalledTimes(1);
  });

  it('POST /tasks pasa el título del DTO al servicio', () => {
    // Arrange
    tasksService.create.mockReturnValue(pendingTask);

    // Act
    const result = controller.create({ title: 'Escribir un test claro' });

    // Assert: se usa el título del body, no el objeto DTO completo.
    expect(tasksService.create).toHaveBeenCalledWith('Escribir un test claro');
    expect(result).toEqual(pendingTask);
  });

  it('PATCH /tasks/:id/toggle pasa el id recibido en la ruta', () => {
    // Arrange
    tasksService.toggle.mockReturnValue({ ...pendingTask, done: true });

    // Act
    const result = controller.toggle('task-1');

    // Assert
    expect(tasksService.toggle).toHaveBeenCalledWith('task-1');
    expect(result.done).toBe(true);
  });

  it('propaga el NotFoundException del servicio si la tarea no existe', () => {
    // Arrange: el servicio es quien decide que no existe.
    tasksService.toggle.mockImplementation(() => {
      throw new NotFoundException('No existe la tarea task-404');
    });

    // Act + Assert: el controlador no se traga el error, lo deja subir.
    expect(() => controller.toggle('task-404')).toThrow(NotFoundException);
  });
});
