import { ApiProperty } from '@nestjs/swagger';

export class TaskDto {
  @ApiProperty({
    description: 'Identificador único de la tarea',
    example: '3f1c2b9e-8a7d-4c6f-9e2a-1b0c3d4e5f60',
  })
  id!: string;

  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Preparar la demo de CI/CD',
  })
  title!: string;

  @ApiProperty({
    description: 'Indica si la tarea está completada',
    example: false,
  })
  done!: boolean;
}
