/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ¿QUÉ SE TESTEA AQUÍ?
 *   El componente <TaskForm /> → frontend/components/TaskForm.tsx
 *
 * Tipo de test: componente (render + interacción real de usuario).
 * Dónde está: junto al componente, siguiendo la convención `*.test.tsx`.
 *
 * Ejercicio: 2 de estos tests deben fallar hasta que se corrijan los TODOs
 * marcados en el componente (validación de vacío y recorte de espacios).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/components/TaskForm';

describe('<TaskForm /> · crear una tarea', () => {
  it('no envía nada y muestra un error si el título está vacío', async () => {
    // Arrange
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    // Act: pulsamos "Agregar" sin escribir nada.
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    // Assert: no se crea la tarea y se avisa del error.
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/obligatorio/i);
  });

  it('recorta los espacios del título antes de enviarlo', async () => {
    // Arrange
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    // Act: el usuario escribe con espacios de más.
    await user.type(screen.getByLabelText('Título'), '  Comprar pan  ');
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    // Assert: al handler le llega el título limpio.
    expect(onAdd).toHaveBeenCalledWith('Comprar pan');
  });

  it('envía el título cuando es válido', async () => {
    // Arrange
    const onAdd = jest.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    // Act
    await user.type(screen.getByLabelText('Título'), 'Comprar pan');
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    // Assert
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith('Comprar pan');
  });

  it('limpia el campo después de enviar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TaskForm onAdd={jest.fn()} />);

    // Act
    await user.type(screen.getByLabelText('Título'), 'Comprar pan');
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    // Assert
    expect(screen.getByLabelText('Título')).toHaveValue('');
  });
});
