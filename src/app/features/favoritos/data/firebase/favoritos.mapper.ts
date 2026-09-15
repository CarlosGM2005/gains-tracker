/** Lee el campo `favoritos` (array de ids). Tolera que falte o tenga valores que no son texto. */
export function idsFavoritos(valor: unknown): string[] {
  if (!Array.isArray(valor)) {
    return [];
  }
  return [...new Set(valor.filter((id): id is string => typeof id === 'string' && id.length > 0))];
}
