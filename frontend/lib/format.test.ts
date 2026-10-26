import { formatPrice } from '@/lib/format';

describe('formatPrice', () => {
  it('formatea céntimos como euros con separador de miles', () => {
    expect(formatPrice(199900)).toBe('1.999,00 €');
  });

  it('rellena los decimales', () => {
    expect(formatPrice(5)).toBe('0,05 €');
  });

  it('admite precios negativos', () => {
    expect(formatPrice(-123456)).toBe('-1.234,56 €');
  });

  it('rechaza valores que no son números finitos', () => {
    expect(() => formatPrice(Number.NaN)).toThrow(TypeError);
  });
});
