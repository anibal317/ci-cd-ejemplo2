import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [];

  findAll(): Task[] {
    return [...this.tasks];
  }

  create(title: string): Task {
    const cleanTitle = typeof title === 'string' ? title.trim() : '';

    if (cleanTitle.length === 0) {
      throw new BadRequestException('El título de la tarea es obligatorio');
    }

    const task: Task = {
      id: randomUUID(),
      title: cleanTitle,
      done: false,
    };

    this.tasks.push(task);
    return task;
  }

  findOne(id: string): Task {
    const task = this.tasks.find((item) => item.id === id);

    if (!task) {
      throw new NotFoundException(`No existe la tarea ${id}`);
    }

    return task;
  }

  toggle(id: string): Task {
    const task = this.tasks.find((item) => item.id === id);

    if (!task) {
      throw new NotFoundException(`No existe la tarea ${id}`);
    }

    task.done = !task.done;
    return task;
  }
}
