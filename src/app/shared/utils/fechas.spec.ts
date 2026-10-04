import { diaLocal, lunesDe, sumarDias } from './fechas';

describe('fechas como YYYY-MM-DD', () => {
  it('da el día local con ceros a la izquierda', () => {
    expect(diaLocal(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('suma y resta días cruzando meses y años', () => {
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('el lunes de un domingo es el de seis días antes', () => {
    expect(lunesDe('2026-10-04')).toBe('2026-09-28');
    expect(lunesDe('2026-09-28')).toBe('2026-09-28');
  });
});
