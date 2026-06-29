export function formatPrice(price: number, isDonation = false): string {
  if (isDonation || price === 0) return 'Donación'
  return `$${price.toLocaleString('es-CO')} COP`
}
