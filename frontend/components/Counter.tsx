'use client';

import { useState } from 'react';

interface CounterProps {
  initialValue?: number;
}

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  return (
    <section aria-label="Contador">
      <p data-testid="count">Contador: {count}</p>
      <button type="button" onClick={() => setCount((value) => value - 1)}>
        Restar
      </button>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Sumar
      </button>
      <button type="button" onClick={() => setCount(initialValue)}>
        Reiniciar
      </button>
    </section>
  );
}
