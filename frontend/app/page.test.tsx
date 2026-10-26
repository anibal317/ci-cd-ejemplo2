import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Página de inicio', () => {
  it('explica el objetivo del ejemplo', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Demo CI/CD' })).toBeInTheDocument();
    expect(screen.getByText(/si los tests fallan/i)).toBeInTheDocument();
  });

  it('muestra el precio formateado', () => {
    render(<Home />);

    expect(screen.getByText(/1\.999,00 €/)).toBeInTheDocument();
  });

  it('incluye el contador interactivo', () => {
    render(<Home />);

    expect(screen.getByRole('region', { name: 'Contador' })).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('Contador: 0');
  });
});
