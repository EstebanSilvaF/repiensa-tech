import type { ProductCategory, ProductCondition, ProductStatus } from '../types/api'

export const conditionChips: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'Casi nuevo' },
  { value: 'good', label: 'Buen estado' },
  { value: 'regular', label: 'Regular' },
]

const conditionLabels: Record<ProductCondition, string> = {
  new: 'Casi nuevo',
  good: 'Buen estado',
  regular: 'Regular',
}

const categoryLabels: Record<ProductCategory, string> = {
  microcontrollers: 'Microcontroladores',
  sensors: 'Sensores',
  memory: 'Memorias',
  displays: 'Displays',
  cables: 'Cables',
  power: 'Energía',
  books_notes: 'Libros y Apuntes',
  lab_science: 'Laboratorio y Ciencias',
  art_design: 'Arte y Diseño',
  tools_hardware: 'Herramientas',
  sports_fitness: 'Deporte y Fitness',
  clothing_accessories: 'Ropa y Accesorios',
  furniture_decor: 'Muebles y Decoración',
  musical_instruments: 'Instrumentos Musicales',
  stationery_office: 'Papelería y Oficina',
  home_kitchen: 'Cocina y Hogar',
  services: 'Servicios',
  other: 'Otros',
}

const statusLabels: Record<ProductStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
}

export function getConditionLabel(condition: ProductCondition): string {
  return conditionLabels[condition]
}

export function getCategoryLabel(category: ProductCategory): string {
  return categoryLabels[category]
}

export function getProductStatusLabel(status: ProductStatus): string {
  return statusLabels[status]
}