import type { ProductCategory, ProductCondition } from '../types/api'

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
  other: 'Otros',
}

export function getConditionLabel(condition: ProductCondition): string {
  return conditionLabels[condition]
}

export function getCategoryLabel(category: ProductCategory): string {
  return categoryLabels[category]
}
