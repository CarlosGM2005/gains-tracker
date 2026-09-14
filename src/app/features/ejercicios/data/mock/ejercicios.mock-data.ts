import { type Ejercicio, type Musculo, type Nivel } from '../../domain/ejercicio.model';

const IMAGEN_INICIO = 'ejercicios/placeholder-inicio.svg';
const IMAGEN_FINAL = 'ejercicios/placeholder-final.svg';

function ejercicio(
  id: string,
  nombre: string,
  musculo: Musculo,
  nivel: Nivel,
  musculosImplicados: string | null,
  recomendado: boolean,
  descripcion: string,
): Ejercicio {
  return {
    id,
    nombre,
    musculo,
    nivel,
    musculosImplicados,
    descripcion,
    imagenInicio: IMAGEN_INICIO,
    imagenFinal: IMAGEN_FINAL,
    recomendado,
  };
}

/**
 * Catálogo de ejemplo para trabajar sin Firebase. Cubre todos los músculos, deja combinaciones
 * vacías a propósito (p. ej. lumbares/intermedio) y tiene más de 8 recomendados.
 */
export const EJERCICIOS_MOCK: readonly Ejercicio[] = [
  // Espalda
  ejercicio('ej-jalon-al-pecho', 'Jalón al pecho', 'espalda', 'principiante', 'Dorsal ancho, bíceps', true,
    'Sentado en la máquina, tira de la barra hacia la parte alta del pecho manteniendo la espalda recta.'),
  ejercicio('ej-remo-con-mancuerna', 'Remo con mancuerna', 'espalda', 'principiante', 'Dorsal ancho, romboides', false,
    'Apoya rodilla y mano en el banco y lleva la mancuerna hacia la cadera sin girar el tronco.'),
  ejercicio('ej-remo-con-barra', 'Remo con barra', 'espalda', 'intermedio', 'Dorsal ancho, trapecio, lumbares', true,
    'Con el tronco inclinado y la espalda neutra, lleva la barra hacia el abdomen.'),
  ejercicio('ej-dominadas', 'Dominadas', 'espalda', 'avanzado', 'Dorsal ancho, bíceps, core', true,
    'Colgado de la barra, sube hasta que la barbilla la supere y baja controlando.'),
  ejercicio('ej-peso-muerto', 'Peso muerto', 'espalda', 'avanzado', 'Lumbares, glúteos, isquiotibiales', false,
    'Levanta la barra desde el suelo empujando con las piernas y extendiendo la cadera.'),
  // Pecho
  ejercicio('ej-flexiones', 'Flexiones', 'pecho', 'principiante', 'Pectoral, tríceps, hombro anterior', true,
    'Con el cuerpo en línea, baja el pecho hasta casi tocar el suelo y empuja.'),
  ejercicio('ej-press-de-banca', 'Press de banca', 'pecho', 'intermedio', 'Pectoral, tríceps, hombro anterior', true,
    'Tumbado en el banco, baja la barra al pecho y empújala hasta estirar los brazos.'),
  ejercicio('ej-aperturas-mancuernas', 'Aperturas con mancuernas', 'pecho', 'intermedio', 'Pectoral', false,
    'Abre los brazos con los codos semiflexionados y ciérralos sobre el pecho.'),
  ejercicio('ej-fondos-paralelas', 'Fondos en paralelas', 'pecho', 'avanzado', 'Pectoral inferior, tríceps', true,
    'Inclina el tronco hacia delante, baja flexionando los codos y sube empujando.'),
  // Hombros
  ejercicio('ej-elevaciones-laterales', 'Elevaciones laterales', 'hombros', 'principiante', 'Deltoides lateral', true,
    'Eleva las mancuernas hacia los lados hasta la altura de los hombros.'),
  ejercicio('ej-press-militar', 'Press militar', 'hombros', 'intermedio', 'Deltoides, tríceps', true,
    'De pie, empuja la barra desde los hombros hasta encima de la cabeza.'),
  ejercicio('ej-face-pull', 'Face pull', 'hombros', 'avanzado', 'Deltoides posterior, trapecio', false,
    'Tira de la cuerda de la polea hacia la cara separando las manos al final.'),
  // Tríceps
  ejercicio('ej-extension-polea', 'Extensión en polea', 'triceps', 'principiante', null, true,
    'Con los codos pegados al cuerpo, extiende los brazos hacia abajo.'),
  ejercicio('ej-press-frances', 'Press francés', 'triceps', 'intermedio', 'Tríceps', false,
    'Tumbado, baja la barra hacia la frente flexionando solo los codos.'),
  ejercicio('ej-press-cerrado', 'Press de banca cerrado', 'triceps', 'avanzado', 'Tríceps, pectoral', true,
    'Press de banca con agarre estrecho y codos pegados.'),
  // Bíceps
  ejercicio('ej-curl-barra', 'Curl con barra', 'biceps', 'principiante', 'Bíceps, braquial', true,
    'Flexiona los codos subiendo la barra sin balancear el cuerpo.'),
  ejercicio('ej-curl-martillo', 'Curl martillo', 'biceps', 'intermedio', 'Braquiorradial, bíceps', false,
    'Curl con agarre neutro, palmas enfrentadas.'),
  ejercicio('ej-curl-scott', 'Curl en banco Scott', 'biceps', 'avanzado', 'Bíceps', true,
    'Con los brazos apoyados en el banco, flexiona los codos de forma controlada.'),
  // Antebrazos
  ejercicio('ej-curl-muneca', 'Curl de muñeca', 'antebrazos', 'principiante', 'Flexores del antebrazo', false,
    'Con el antebrazo apoyado, flexiona la muñeca subiendo la mancuerna.'),
  ejercicio('ej-paseo-granjero', 'Paseo del granjero', 'antebrazos', 'intermedio', 'Antebrazos, trapecio, core', true,
    'Camina con una carga pesada en cada mano manteniendo la postura.'),
  ejercicio('ej-curl-inverso', 'Curl inverso', 'antebrazos', 'avanzado', 'Extensores del antebrazo', false,
    'Curl con barra y agarre prono.'),
  // Lumbares (no aparece en los filtros; se conserva en los datos)
  ejercicio('ej-hiperextensiones', 'Hiperextensiones', 'lumbares', 'principiante', 'Erectores espinales, glúteos', true,
    'En el banco romano, baja el tronco y súbelo hasta alinearlo con las piernas.'),
  ejercicio('ej-buenos-dias', 'Buenos días', 'lumbares', 'avanzado', 'Erectores espinales, isquiotibiales', false,
    'Con la barra en la espalda, inclina el tronco desde la cadera y vuelve.'),
  // Abdominales
  ejercicio('ej-plancha', 'Plancha', 'abdominales', 'principiante', 'Core', true,
    'Apoyado en antebrazos y puntas de los pies, mantén el cuerpo recto.'),
  ejercicio('ej-elevacion-piernas', 'Elevación de piernas colgado', 'abdominales', 'intermedio', 'Recto abdominal, flexores de cadera', false,
    'Colgado de la barra, sube las piernas sin balancearte.'),
  ejercicio('ej-rueda-abdominal', 'Rueda abdominal', 'abdominales', 'avanzado', 'Core, dorsal', true,
    'De rodillas, rueda hacia delante hasta estirarte y vuelve contrayendo el abdomen.'),
  // Piernas
  ejercicio('ej-prensa', 'Prensa de piernas', 'piernas', 'principiante', 'Cuádriceps, glúteos', true,
    'Empuja la plataforma sin bloquear las rodillas al final.'),
  ejercicio('ej-zancadas', 'Zancadas', 'piernas', 'principiante', 'Cuádriceps, glúteos', false,
    'Da un paso largo y baja hasta que ambas rodillas formen 90 grados.'),
  ejercicio('ej-sentadilla', 'Sentadilla', 'piernas', 'intermedio', 'Cuádriceps, glúteos, core', true,
    'Con la barra en la espalda, baja la cadera por debajo de las rodillas y sube.'),
  ejercicio('ej-sentadilla-bulgara', 'Sentadilla búlgara', 'piernas', 'avanzado', 'Cuádriceps, glúteos', true,
    'Con el pie trasero sobre un banco, baja en vertical con la pierna delantera.'),
];
