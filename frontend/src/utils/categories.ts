import type { ProductCategory } from '../types/api'

export const galleryCategories = [
  'Todo',
  'Microcontroladores',
  'Sensores',
  'Memorias',
  'Displays',
  'Cables',
  'Energía',
  'Libros y Apuntes',
  'Laboratorio y Ciencias',
  'Arte y Diseño',
  'Herramientas',
  'Deporte y Fitness',
  'Ropa y Accesorios',
  'Muebles y Decoración',
  'Instrumentos Musicales',
  'Papelería y Oficina',
  'Cocina y Hogar',
  'Servicios',
  'Otros',
] as const

export type GalleryCategory = (typeof galleryCategories)[number]

const categoryToApi: Record<Exclude<GalleryCategory, 'Todo'>, ProductCategory> = {
  Microcontroladores: 'microcontrollers',
  Sensores: 'sensors',
  Memorias: 'memory',
  Displays: 'displays',
  Cables: 'cables',
  Energía: 'power',
  'Libros y Apuntes': 'books_notes',
  'Laboratorio y Ciencias': 'lab_science',
  'Arte y Diseño': 'art_design',
  Herramientas: 'tools_hardware',
  'Deporte y Fitness': 'sports_fitness',
  'Ropa y Accesorios': 'clothing_accessories',
  'Muebles y Decoración': 'furniture_decor',
  'Instrumentos Musicales': 'musical_instruments',
  'Papelería y Oficina': 'stationery_office',
  'Cocina y Hogar': 'home_kitchen',
  Servicios: 'services',
  Otros: 'other',
}

export type PublishCategory = Exclude<GalleryCategory, 'Todo'>

export const publishCategories = galleryCategories.filter(
  (c): c is PublishCategory => c !== 'Todo',
)

export function toApiCategory(category: GalleryCategory): ProductCategory | undefined {
  if (category === 'Todo') return undefined
  return categoryToApi[category]
}

export function toApiCategoryFromPublish(category: PublishCategory): ProductCategory {
  return categoryToApi[category]
}

const apiToPublish: Record<ProductCategory, PublishCategory> = Object.fromEntries(
  Object.entries(categoryToApi).map(([label, api]) => [api, label]),
) as Record<ProductCategory, PublishCategory>

export function fromApiCategoryToPublish(category: ProductCategory): PublishCategory {
  return apiToPublish[category]
}