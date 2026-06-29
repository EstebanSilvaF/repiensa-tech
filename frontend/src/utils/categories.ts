import type { ProductCategory } from '../types/api'

export const galleryCategories = [
  'Todo',
  'Microcontroladores',
  'Sensores',
  'Memorias',
  'Displays',
  'Cables',
  'Energía',
  'Otros',
] as const

export type GalleryCategory = (typeof galleryCategories)[number]

const categoryToApi: Record<Exclude<GalleryCategory, 'Todo'>, ProductCategory> =
  {
    Microcontroladores: 'microcontrollers',
    Sensores: 'sensors',
    Memorias: 'memory',
    Displays: 'displays',
    Cables: 'cables',
    Energía: 'power',
    Otros: 'other',
  }

export type PublishCategory = Exclude<GalleryCategory, 'Todo'>

export const publishCategories = galleryCategories.filter(
  (c): c is PublishCategory => c !== 'Todo',
)

export function toApiCategory(
  category: GalleryCategory,
): ProductCategory | undefined {
  if (category === 'Todo') return undefined
  return categoryToApi[category]
}

export function toApiCategoryFromPublish(
  category: PublishCategory,
): ProductCategory {
  return categoryToApi[category]
}

const apiToPublish: Record<ProductCategory, PublishCategory> = {
  microcontrollers: 'Microcontroladores',
  sensors: 'Sensores',
  memory: 'Memorias',
  displays: 'Displays',
  cables: 'Cables',
  power: 'Energía',
  other: 'Otros',
}

export function fromApiCategoryToPublish(category: ProductCategory): PublishCategory {
  return apiToPublish[category]
}
