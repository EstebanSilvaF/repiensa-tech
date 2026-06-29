import type { Product } from '../types/api'

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    seller_id: 'seller-1',
    university_id: 'uni-1',
    name: 'Arduino Uno R3 (original)',
    description:
      'Placa Arduino Uno R3 original, usada en prácticas de electrónica. Funciona correctamente.',
    price: 75000,
    is_donation: false,
    category: 'microcontrollers',
    condition: 'good',
    status: 'available',
    image_url: '',
    image_public_id: null,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    seller_name: 'Juan R.',
  },
  {
    id: 'mock-2',
    seller_id: 'seller-2',
    university_id: 'uni-1',
    name: 'Raspberry Pi 4 — 4GB',
    description:
      'Usado en Laboratorio de Sistemas Embebidos, solo un semestre. Funciona perfectamente y viene con cable USB incluido. No tiene quemados ni daños físicos.',
    price: 320000,
    is_donation: false,
    category: 'microcontrollers',
    condition: 'new',
    status: 'available',
    image_url: '',
    image_public_id: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    seller_name: 'Ana L.',
  },
  {
    id: 'mock-3',
    seller_id: 'seller-3',
    university_id: 'uni-1',
    name: 'Display OLED 0.96" I2C',
    description: 'Pantalla OLED monocromática con interfaz I2C. Ideal para proyectos con Arduino.',
    price: 18000,
    is_donation: false,
    category: 'displays',
    condition: 'good',
    status: 'available',
    image_url: '',
    image_public_id: null,
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
    seller_name: 'Pablo M.',
  },
  {
    id: 'mock-4',
    seller_id: 'seller-4',
    university_id: 'uni-1',
    name: 'Kit de cables Dupont',
    description: 'Pack de 40 cables dupont macho-macho de 20 cm.',
    price: 12000,
    is_donation: false,
    category: 'cables',
    condition: 'new',
    status: 'available',
    image_url: '',
    image_public_id: null,
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
    seller_name: 'Miguel A.',
  },
  {
    id: 'mock-5',
    seller_id: 'seller-5',
    university_id: 'uni-1',
    name: 'Lenovo ThinkPad T480',
    description: 'Laptop empresarial con 16 GB RAM y SSD 512 GB. Batería en buen estado.',
    price: 1850000,
    is_donation: false,
    category: 'other',
    condition: 'good',
    status: 'available',
    image_url: '',
    image_public_id: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    seller_name: 'Carlos V.',
  },
  {
    id: 'mock-6',
    seller_id: 'seller-6',
    university_id: 'uni-1',
    name: 'ESP32 DevKit v1',
    description: 'Módulo ESP32 con WiFi y Bluetooth integrados.',
    price: 35000,
    is_donation: false,
    category: 'microcontrollers',
    condition: 'new',
    status: 'available',
    image_url: '',
    image_public_id: null,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    seller_name: 'Laura S.',
  },
  {
    id: 'mock-7',
    seller_id: 'seller-7',
    university_id: 'uni-1',
    name: 'Mouse Logitech MX Master',
    description: 'Mouse ergonómico inalámbrico, poco uso.',
    price: 180000,
    is_donation: false,
    category: 'other',
    condition: 'good',
    status: 'available',
    image_url: '',
    image_public_id: null,
    created_at: daysAgo(6),
    updated_at: daysAgo(6),
    seller_name: 'Diego F.',
  },
  {
    id: 'mock-8',
    seller_id: 'seller-8',
    university_id: 'uni-1',
    name: 'Sensor ultrasónico HC-SR04',
    description: 'Sensor de distancia ultrasónico, donación para proyectos estudiantiles.',
    price: 0,
    is_donation: true,
    category: 'sensors',
    condition: 'good',
    status: 'available',
    image_url: '',
    image_public_id: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    seller_name: 'Maikel R.',
  },
]

export function getMockProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id)
}

export function filterMockProducts(filters?: {
  category?: string
  search?: string
}): Product[] {
  let result = [...MOCK_PRODUCTS]

  if (filters?.category) {
    result = result.filter((p) => p.category === filters.category)
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false),
    )
  }

  return result
}
