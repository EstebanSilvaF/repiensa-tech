import { describe, expect, it, vi, beforeEach } from 'vitest'
import { productService } from '../../../src/application/services/product.service'
import { productRepository } from '../../../src/infrastructure/persistence/repositories/product.repository'
import { transactionRepository } from '../../../src/infrastructure/persistence/repositories/transaction.repository'
import { expandSearchTerms } from '../../../src/infrastructure/config/ai'

vi.mock('../../../src/infrastructure/config/ai', () => ({
  expandSearchTerms: vi.fn(),
}))

vi.mock('../../../src/infrastructure/persistence/repositories/product.repository', () => ({
  productRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findBySeller: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../../../src/infrastructure/persistence/repositories/transaction.repository', () => ({
  transactionRepository: {
    createForProduct: vi.fn(),
  },
}))

describe('productService search expansion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marca como adquirido y registra la transacción', async () => {
    vi.mocked(productRepository.findById).mockResolvedValue({
      id: 'product-1',
      seller_id: 'seller-1',
      university_id: 'uni-1',
      name: 'Arduino',
      description: null,
      price: 10000,
      is_donation: false,
      category: 'microcontrollers',
      condition: 'good',
      status: 'available',
      image_url: 'https://example.com/image.jpg',
      image_public_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as any)

    await productService.markAsAcquired('product-1', 'buyer-1')

    expect(productRepository.updateStatus).toHaveBeenCalledWith('product-1', 'sold')
    expect(transactionRepository.createForProduct).toHaveBeenCalledWith({
      productId: 'product-1',
      sellerId: 'seller-1',
      buyerId: 'buyer-1',
      finalPrice: 10000,
    })
  })

  it('expands search terms for semantic matching', async () => {
    vi.mocked(expandSearchTerms).mockResolvedValue(['arte', 'dibujo', 'marcadores'])
    vi.mocked(productRepository.findAll).mockResolvedValue([])

    await productService.getAll('university-1', { search: 'arte' })

    expect(expandSearchTerms).toHaveBeenCalledWith('arte')
    expect(productRepository.findAll).toHaveBeenCalledWith('university-1', {
      search: 'arte',
      searchTerms: ['arte', 'dibujo', 'marcadores'],
    })
  })
})
