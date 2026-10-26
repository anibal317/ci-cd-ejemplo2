import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea. No puede estar vacío.',
    example: 'Preparar la demo de CI/CD',
    minLength: 1,
  })
  title!: string;
}
