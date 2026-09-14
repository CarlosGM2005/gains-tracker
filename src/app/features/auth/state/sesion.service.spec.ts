import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store';
import { DEMO_GOOGLE_USER, DEMO_PASSWORD, DEMO_USER } from '@core/auth/mock/demo-user';
import { AuthError } from '@core/auth/auth.model';
import { PerfilRepository } from '@features/perfil/public-api';
import { TEST_ENVIRONMENT } from '@env/environment.testing';

import { provideDataLayer } from '../../../app.data';
import { SesionService } from './sesion.service';

describe('SesionService (con repositorios mock)', () => {
  let sesion: SesionService;
  let auth: AuthStore;
  let perfiles: PerfilRepository;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideDataLayer(TEST_ENVIRONMENT)],
    });
    sesion = TestBed.inject(SesionService);
    auth = TestBed.inject(AuthStore);
    perfiles = TestBed.inject(PerfilRepository);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await auth.sesionResuelta();
  });

  it('login con email abre sesión y va al returnUrl interno', async () => {
    await sesion.loginConEmail(DEMO_USER.email, DEMO_PASSWORD, '/registros');

    expect(auth.sesion()?.uid).toBe(DEMO_USER.uid);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/registros');
  });

  it('login con credenciales incorrectas lanza credenciales-invalidas', async () => {
    const error = await sesion.loginConEmail(DEMO_USER.email, 'mala').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AuthError);
    expect((error as AuthError).code).toBe('credenciales-invalidas');
    expect(auth.autenticado()).toBe(false);
  });

  it('registro crea la cuenta y el perfil con los datos físicos', async () => {
    await sesion.registrar({
      nombre: ' Ana ',
      email: 'ana@gains.dev',
      password: 'abc12345',
      telefono: '600111222',
      edad: 30,
      peso: 60,
      altura: 1.65,
    });

    const uid = auth.uidActual();
    const perfil = await firstValueFrom(perfiles.observar(uid));
    expect(perfil).toMatchObject({ nombre: 'Ana', email: 'ana@gains.dev', edad: 30, peso: 60, altura: 1.65 });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/inicio');
  });

  it('Google crea un perfil vacío la primera vez y no lo pisa después', async () => {
    await sesion.loginConGoogle();
    const uid = DEMO_GOOGLE_USER.uid;
    expect(await firstValueFrom(perfiles.observar(uid))).toMatchObject({ telefono: null, edad: null });

    await perfiles.actualizar(uid, { edad: 25 });
    await sesion.loginConGoogle();
    expect((await firstValueFrom(perfiles.observar(uid)))?.edad).toBe(25);
  });
});
