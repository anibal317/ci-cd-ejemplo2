'use client';

import { FormEvent, useState } from 'react';

interface TaskFormProps {
  /** Se llama con el título de la tarea que el usuario quiere crear. */
  onAdd: (title: string) => void;
}

/**
 * Formulario para crear una tarea.
 *
 * TODO(ejercicio): este componente tiene dos bugs a propósito (ver handleSubmit).
 * Los tests de TaskForm.test.tsx deberían fallar hasta que se arreglen.
 */
export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError('El título es obligatorio');
      return;
    }

    onAdd(cleanTitle);
    setTitle('');
    setError('');
  }

  return (
    <form aria-label="Nueva tarea" onSubmit={handleSubmit}>
      <label htmlFor="task-title">Título</label>
      <input
        id="task-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Ej. Preparar la demo"
      />
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit">Agregar</button>
    </form>
  );
}
