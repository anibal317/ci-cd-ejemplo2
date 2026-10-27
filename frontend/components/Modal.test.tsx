/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ¿QUÉ SE TESTEA AQUÍ?
 *   El componente <Modal /> → frontend/components/Modal.tsx
 *
 * Tipo de test: componente (render, accesibilidad y cierre).
 * Dónde está: junto al componente, siguiendo la convención `*.test.tsx`.
 *
 * Se comprueba el comportamiento visible para el usuario:
 * abrir/cerrar, título accesible, Escape y clic en el fondo.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/Modal';

function renderModal(open: boolean, onClose = jest.fn()) {
  render(
    <Modal open={open} title="Crear tarea" onClose={onClose}>
      <p>Contenido del modal</p>
    </Modal>,
  );

  return onClose;
}

describe('<Modal /> · diálogo accesible', () => {
  it('no renderiza nada cuando está cerrado', () => {
    renderModal(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el título y el contenido cuando está abierto', () => {
    renderModal(true);

    expect(screen.getByRole('dialog', { name: 'Crear tarea' })).toBeInTheDocument();
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
  });

  it('se cierra con el botón "Cerrar"', async () => {
    const user = userEvent.setup();
    const onClose = renderModal(true);

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('se cierra con la tecla Escape', async () => {
    const user = userEvent.setup();
    const onClose = renderModal(true);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('se cierra al pulsar el fondo, pero no al pulsar el contenido', async () => {
    const user = userEvent.setup();
    const onClose = renderModal(true);

    await user.click(screen.getByText('Contenido del modal'));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
