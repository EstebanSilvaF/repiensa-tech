import { describe, expect, it, vi, beforeEach } from 'vitest'
import { productService } from '../../../src/application/services/product.service'
import { productRepository } from '../../../src/infrastructure/persistence/repositories/product.repository'
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

describe('productService search expansion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
