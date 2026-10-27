import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  it('empieza sin tareas', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('crea una tarea pendiente y recorta el título', () => {
    const task = service.create('  Escribir el README  ');

    expect(task.title).toBe('Escribir el README');
    expect(task.done).toBe(false);
    expect(task.id).toEqual(expect.any(String));
    expect(service.findAll()).toHaveLength(1);
  });

  it('rechaza títulos vacíos', () => {
    expect(() => service.create('   ')).toThrow('El título de la tarea es obligatorio');
  });

  it('alterna el estado de una tarea', () => {
    const task = service.create('Hacer los tests');

    expect(service.toggle(task.id).done).toBe(true);
    expect(service.toggle(task.id).done).toBe(false);
  });

  it('lanza un 404 si la tarea no existe', () => {
    expect(() => service.toggle('id-inexistente')).toThrow('No existe la tarea id-inexistente');
  });

  it('inicializa el servicio con el contenedor de Nest', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    expect(moduleRef.get(TasksService)).toBeInstanceOf(TasksService);
  });

  describe('findOne', () => {
    it('devuelve la tarea cuyo id coincide', () => {
      // Arrange: dos tareas para que no valga con devolver la primera.
      service.create('Primera tarea');
      const segunda = service.create('Segunda tarea');

      // Act
      const result = service.findOne(segunda.id);

      // Assert
      expect(result.id).toBe(segunda.id);
      expect(result.title).toBe('Segunda tarea');
    });

    it('lanza NotFoundException si el id no existe', () => {
      // Arrange
      service.create('Primera tarea');

      // Act + Assert
      expect(() => service.findOne('id-inexistente')).toThrow(NotFoundException);
    });
  });
});
