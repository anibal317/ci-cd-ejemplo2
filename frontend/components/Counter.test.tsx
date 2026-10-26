/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ¿QUÉ SE TESTEA AQUÍ?
 *   El componente <Counter /> → frontend/components/Counter.tsx
 *
 * Tipo de test: componente (unitario + interacción real de usuario con jsdom).
 * Dónde está: junto al componente, siguiendo la convención `*.test.tsx`.
 * Herramientas: Jest + Testing Library + user-event.
 *
 * Patrón de cada test: Arrange (preparar) → Act (actuar) → Assert (comprobar).
 * Se busca el botón por su rol y nombre accesible ("Sumar"), no por CSS,
 * para que el test refleje cómo lo usa una persona.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from '@/components/Counter';

describe('<Counter /> · contador interactivo', () => {
  it('muestra en pantalla el valor inicial que recibe por props', () => {
    // Arrange: renderizamos el componente con un valor conocido.
    render(<Counter initialValue={3} />);

    // Assert: el texto visible es el esperado.
    expect(screen.getByTestId('count')).toHaveTextContent('Contador: 3');
  });

  it('suma al pulsar "Sumar" y resta al pulsar "Restar"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Counter />);

    // Act: dos clics en Sumar y uno en Restar.
    await user.click(screen.getByRole('button', { name: 'Sumar' }));
    await user.click(screen.getByRole('button', { name: 'Sumar' }));
    await user.click(screen.getByRole('button', { name: 'Restar' }));

    // Assert: 0 + 1 + 1 - 1 = 1.
    expect(screen.getByTestId('count')).toHaveTextContent('Contador: 1');
  });

  it('permite bajar de cero y muestra valores negativos', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Counter initialValue={0} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Restar' }));

    // Assert
    expect(screen.getByTestId('count')).toHaveTextContent('Contador: -1');
  });

  it('vuelve al valor inicial al pulsar "Reiniciar"', async () => {
    // Arrange: empezamos en 5 y lo subimos a 6.
    const user = userEvent.setup();
    render(<Counter initialValue={5} />);
    await user.click(screen.getByRole('button', { name: 'Sumar' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Reiniciar' }));

    // Assert: vuelve a 5, no a 0.
    expect(screen.getByTestId('count')).toHaveTextContent('Contador: 5');
  });
});
