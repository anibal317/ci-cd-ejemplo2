import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskDto } from './dto/task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas las tareas' })
  @ApiOkResponse({ description: 'Listado de tareas', type: [TaskDto] })
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crea una tarea' })
  @ApiCreatedResponse({ description: 'Tarea creada', type: TaskDto })
  @ApiBadRequestResponse({ description: 'El título es obligatorio' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto.title);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Alterna el estado completado de una tarea' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea',
    example: '3f1c2b9e-8a7d-4c6f-9e2a-1b0c3d4e5f60',
  })
  @ApiOkResponse({ description: 'Tarea actualizada', type: TaskDto })
  @ApiNotFoundResponse({ description: 'La tarea no existe' })
  toggle(@Param('id') id: string) {
    return this.tasksService.toggle(id);
  }
}
