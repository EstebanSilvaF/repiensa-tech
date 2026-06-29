export interface Product {
  id: string
  name: string
  price: number
  category: string
}

export const categories = [
  'Todo',
  'Microcontroladores',
  'Displays',
  'Cables',
  'Laptops & accesorios',
] as const

export type Category = (typeof categories)[number]

export const products: Product[] = [
  {
    id: '1',
    name: 'Arduino Uno R3 (original)',
    price: 75000,
    category: 'Microcontroladores',
  },
  {
    id: '2',
    name: 'Raspberry Pi 4 — 4GB',
    price: 320000,
    category: 'Microcontroladores',
  },
  {
    id: '3',
    name: 'Display OLED 0.96" I2C',
    price: 18000,
    category: 'Displays',
  },
  {
    id: '4',
    name: 'Kit de cables Dupont',
    price: 12000,
    category: 'Cables',
  },
]

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')} COP`
}
