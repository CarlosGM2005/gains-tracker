import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store';
import { DEMO_PASSWORD, DEMO_USER } from '@core/auth/mock/demo-user';
import { RegistrosRepository } from '@features/registros/public-api';
import { TEST_ENVIRONMENT } from '@env/environment.testing';

import { provideDataLayer } from '../../../app.data';
import { PerfilRepository } from '../data/perfil-repository';
import { EliminarCuentaService } from './eliminar-cuenta.service';

describe('EliminarCuentaService', () => {
  let auth: AuthStore;
  let servicio: EliminarCuentaService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideDataLayer(TEST_ENVIRONMENT)],
    });
    auth = TestBed.inject(AuthStore);
    servicio = TestBed.inject(EliminarCuentaService);
    await auth.sesionResuelta();
    await auth.loginConEmail(DEMO_USER.email, DEMO_PASSWORD);
  });

  it('borra registros, perfil y cuenta, y cierra la sesión', async () => {
    await servicio.eliminar(DEMO_PASSWORD);

    expect(await auth.sesionResuelta()).toBeNull();
    expect(await firstValueFrom(TestBed.inject(RegistrosRepository).observar(DEMO_USER.uid))).toEqual([]);
    expect(await firstValueFrom(TestBed.inject(PerfilRepository).observar(DEMO_USER.uid))).toBeNull();
    await expect(auth.loginConEmail(DEMO_USER.email, DEMO_PASSWORD)).rejects.toMatchObject({
      code: 'credenciales-invalidas',
    });
  });

  it('con la contraseña incorrecta no borra nada', async () => {
    await expect(servicio.eliminar('mal')).rejects.toMatchObject({ code: 'credenciales-invalidas' });

    expect((await auth.sesionResuelta())?.uid).toBe(DEMO_USER.uid);
    expect((await firstValueFrom(TestBed.inject(RegistrosRepository).observar(DEMO_USER.uid))).length).toBeGreaterThan(0);
    expect(await firstValueFrom(TestBed.inject(PerfilRepository).observar(DEMO_USER.uid))).not.toBeNull();
  });
});
