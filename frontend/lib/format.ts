/**
 * Convierte céntimos a un precio con formato español: 199900 -> "1.999,00 €".
 * Es una utilidad pura, ideal para un test unitario rápido.
 */
export function formatPrice(cents: number): string {
  if (!Number.isFinite(cents)) {
    throw new TypeError('El precio debe ser un número finito');
  }

  const negative = cents < 0;
  const absolute = Math.abs(Math.round(cents));
  const euros = Math.floor(absolute / 100).toString();
  const decimals = (absolute % 100).toString().padStart(2, '0');
  const thousands = euros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${negative ? '-' : ''}${thousands},${decimals} €`;
}
