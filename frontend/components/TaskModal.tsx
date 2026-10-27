'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { TaskForm } from '@/components/TaskForm';

/**
 * Demo visual: un botón abre un modal con el formulario de tareas.
 * Las tareas creadas se muestran en una lista debajo del botón.
 */
export function TaskModal() {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);

  function handleAdd(title: string) {
    setTasks((current) => [...current, title]);
  }

  return (
    <section className="card" aria-label="Nueva tarea">
      <h2>Nueva tarea</h2>
      <p>Abre el modal y agrega una tarea. Todo pasa por los tests antes del merge.</p>

      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        Abrir formulario
      </button>

      {tasks.length > 0 ? (
        <ul className="task-list" aria-label="Tareas creadas">
          {tasks.map((task, index) => (
            <li key={`${task}-${index}`}>{task}</li>
          ))}
        </ul>
      ) : null}

      <Modal open={open} title="Crear tarea" onClose={() => setOpen(false)}>
        <TaskForm onAdd={handleAdd} />
      </Modal>
    </section>
  );
}
