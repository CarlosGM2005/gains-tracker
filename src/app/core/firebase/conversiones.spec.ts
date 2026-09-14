import { fecha, numero, positivoONull, texto, textoONull } from './conversiones';

describe('conversiones de Firestore', () => {
  it('texto y textoONull', () => {
    expect(texto('a')).toBe('a');
    expect(texto(3)).toBe('');
    expect(textoONull('  ')).toBeNull();
    expect(textoONull(' 600 ')).toBe('600');
  });

  it('numero acepta números como texto', () => {
    expect(numero('12.5')).toBe(12.5);
    expect(numero('abc', -1)).toBe(-1);
    expect(numero(undefined)).toBe(0);
  });

  it('positivoONull convierte el 0 antiguo en null', () => {
    expect(positivoONull(0)).toBeNull();
    expect(positivoONull(75)).toBe(75);
  });

  it('fecha lee Timestamp, Date e ISO', () => {
    const d = new Date('2025-06-01T10:00:00Z');
    expect(fecha({ toDate: () => d })).toBe(d);
    expect(fecha(d)).toBe(d);
    expect(fecha('2025-06-01T10:00:00Z')?.getTime()).toBe(d.getTime());
    expect(fecha('no es fecha')).toBeNull();
    expect(fecha(undefined)).toBeNull();
  });
});
