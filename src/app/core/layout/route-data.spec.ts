import { type ActivatedRouteSnapshot, type Data } from '@angular/router';

import { navModeDe } from './route-data';

function snapshot(data: Data, firstChild: ActivatedRouteSnapshot | null = null): ActivatedRouteSnapshot {
  return { data, firstChild } as unknown as ActivatedRouteSnapshot;
}

describe('navModeDe', () => {
  it('usa full si ninguna ruta lo declara', () => {
    expect(navModeDe(snapshot({}, snapshot({})))).toBe('full');
  });

  it('gana la ruta más profunda que lo declara', () => {
    const arbol = snapshot({ nav: 'full' }, snapshot({}, snapshot({ nav: 'mobile-only' })));
    expect(navModeDe(arbol)).toBe('mobile-only');
  });

  it('ignora valores no válidos', () => {
    expect(navModeDe(snapshot({ nav: 'none' }, snapshot({ nav: 'otro' })))).toBe('none');
  });
});
