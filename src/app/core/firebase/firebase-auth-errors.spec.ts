import { AuthError } from '../auth/auth.model';
import { aAuthError } from './firebase-auth-errors';

describe('aAuthError', () => {
  it('traduce los códigos de Firebase Auth', () => {
    expect(aAuthError({ code: 'auth/invalid-credential' }).code).toBe('credenciales-invalidas');
    expect(aAuthError({ code: 'auth/email-already-in-use' }).code).toBe('email-en-uso');
    expect(aAuthError({ code: 'auth/popup-blocked' }).code).toBe('popup-bloqueado');
    expect(aAuthError({ code: 'auth/requires-recent-login' }).code).toBe('requiere-login-reciente');
    expect(aAuthError({ code: 'auth/network-request-failed' }).code).toBe('red');
  });

  it('usa desconocido para códigos no previstos o errores sin código', () => {
    expect(aAuthError({ code: 'auth/otro' }).code).toBe('desconocido');
    expect(aAuthError(new Error('x')).code).toBe('desconocido');
    expect(aAuthError(null).code).toBe('desconocido');
  });

  it('deja pasar un AuthError tal cual', () => {
    const original = new AuthError('sin-sesion');
    expect(aAuthError(original)).toBe(original);
  });
});
