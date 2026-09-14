import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { EjerciciosRepository } from './data/ejercicios-repository';

/** Traduce el enlace antiguo `/main/info-exercice/:nombre` al nuevo `/ejercicios/detalle/:id`. */
export const legacyDetalleGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const repositorio = inject(EjerciciosRepository);
  const nombre = route.paramMap.get('nombre');
  const ejercicio = nombre ? await repositorio.porNombre(nombre) : null;

  return ejercicio
    ? router.createUrlTree(['/ejercicios/detalle', ejercicio.id])
    : router.createUrlTree(['/ejercicios']);
};
