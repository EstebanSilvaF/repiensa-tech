export function getRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === 'string') return value;
  return undefined;
}
