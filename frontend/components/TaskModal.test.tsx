/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ¿QUÉ SE TESTEA AQUÍ?
 *   El componente <TaskModal /> → frontend/components/TaskModal.tsx
 *
 * Tipo de test: componente (integración de Modal + TaskForm + lista).
 * Dónde está: junto al componente, siguiendo la convención `*.test.tsx`.
 *
 * Flujo que se prueba: abrir el modal, crear una tarea y verla en la lista.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskModal } from '@/components/TaskModal';

describe('<TaskModal /> · demo del modal', () => {
  it('no muestra el formulario hasta abrir el modal', () => {
    render(<TaskModal />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir formulario' })).toBeInTheDocument();
  });

  it('abre el modal con el formulario de tareas', async () => {
    const user = userEvent.setup();
    render(<TaskModal />);

    await user.click(screen.getByRole('button', { name: 'Abrir formulario' }));

    expect(screen.getByRole('dialog', { name: 'Crear tarea' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
  });

  it('agrega la tarea a la lista y mantiene el modal abierto', async () => {
    const user = userEvent.setup();
    render(<TaskModal />);

    await user.click(screen.getByRole('button', { name: 'Abrir formulario' }));
    await user.type(screen.getByLabelText('Título'), 'Comprar pan');
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    expect(screen.getByRole('list', { name: 'Tareas creadas' })).toHaveTextContent('Comprar pan');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('cierra el modal con Escape', async () => {
    const user = userEvent.setup();
    render(<TaskModal />);

    await user.click(screen.getByRole('button', { name: 'Abrir formulario' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
