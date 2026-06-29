import { API_URL, TOKEN_KEY } from '../config/env'
import type {
  CreateProductRequest,
  GenerateProductDescriptionResponse,
  Product,
  ProductFilters,
  UploadProductImageResponse,
} from '../types/api'
import { ApiError, apiClient } from './client'

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export function validateProductImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return 'Formato no válido. Usa JPG, PNG, WEBP o GIF.'
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'La imagen no puede superar 5 MB.'
  }

  return null
}

async function uploadProductImage(file: File): Promise<UploadProductImageResponse> {
  const formData = new FormData()
  formData.append('image', file)

  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/upload/product-image`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    let message = `Error al subir imagen (${response.status})`
    try {
      const errorBody = await response.json()
      if (typeof errorBody.message === 'string') {
        message = errorBody.message
      }
    } catch {
      // use default message
    }
    throw new ApiError(message, response.status)
  }

  return response.json() as Promise<UploadProductImageResponse>
}

async function generateDescription(file: File): Promise<GenerateProductDescriptionResponse> {
  const validationError = validateProductImage(file)
  if (validationError) {
    throw new ApiError(validationError, 400)
  }

  const formData = new FormData()
  formData.append('image', file)

  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/products/generate-description`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    let message = `Error al generar descripción (${response.status})`
    try {
      const errorBody = await response.json()
      if (typeof errorBody.message === 'string') {
        message = errorBody.message
      }
    } catch {
      // use default message
    }
    throw new ApiError(message, response.status)
  }

  return response.json() as Promise<GenerateProductDescriptionResponse>
}

export const productService = {
  getProducts: (filters?: ProductFilters) =>
    apiClient.get<Product[]>('/products', {
      params: {
        category: filters?.category,
        condition: filters?.condition,
        is_donation: filters?.is_donation,
        search: filters?.search,
      },
    }),

  getProductById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),

  createProduct: (data: CreateProductRequest) =>
    apiClient.post<Product>('/products', { body: data }),

  uploadProductImage,

  generateDescription,

  publishProduct: async (
    file: File,
    data: Omit<CreateProductRequest, 'image_url' | 'image_public_id'>,
  ) => {
    const image = await uploadProductImage(file)
    return productService.createProduct({
      ...data,
      image_url: image.image_url,
      image_public_id: image.image_public_id,
    })
  },
}
