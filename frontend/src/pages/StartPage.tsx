import { useEffect, useState, type MouseEvent } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link, useNavigate } from 'react-router-dom'
import { productService } from '../api/productService'
import AppFooter from '../components/layout/AppFooter'
import AppNavbar from '../components/layout/AppNavbar'
import ChevronDownIcon from '../components/icons/ChevronDownIcon'
import ImagePlaceholderIcon from '../components/icons/ImagePlaceholderIcon'
import SearchIcon from '../components/icons/SearchIcon'
import { filterMockProducts } from '../data/mockProducts'
import { useAuth } from '../hooks/useAuth'
import { paths } from '../routes/paths'
import type { Product } from '../types/api'
import {
  galleryCategories,
  toApiCategory,
  type GalleryCategory,
} from '../utils/categories'
import { formatPrice } from '../utils/formatPrice'
import { getLikedProductIds, toggleProductLike } from '../utils/favorites'
import HeartIcon from '../components/icons/HeartIcon'
import './StartPage.css'

const quickCategories = galleryCategories.slice(0, 7)
const moreCategories = galleryCategories.slice(7)

export default function StartPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('Todo')
  const [products, setProducts] = useState<Product[]>([])
  const [likedProductIds, setLikedProductIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLikedProductIds(getLikedProductIds())
  }, [])

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(paths.login)
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  function handleToggleFavorite(event: MouseEvent<HTMLButtonElement>, productId: string) {
    event.preventDefault()
    event.stopPropagation()

    const updated = toggleProductLike(productId)
    setLikedProductIds(updated)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let cancelled = false

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await productService.getProducts({
          category: toApiCategory(activeCategory),
          search: search.trim() || undefined,
        })
        if (!cancelled) setProducts(data)
      } catch {
        if (!cancelled) {
          setProducts(
            filterMockProducts({
              category: toApiCategory(activeCategory),
              search: search.trim() || undefined,
            }),
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    const timeoutId = window.setTimeout(loadProducts, 300)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [isAuthenticated, activeCategory, search])

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="start-page">
        <AppNavbar />
        <p className="start-page__status">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="start-page">
      <AppNavbar />

      <main className="start-page__main">
        <div className="start-page__search">
          <SearchIcon className="start-page__search-icon" />
          <input
            type="search"
            className="start-page__search-input"
            placeholder="Busca productos, artículos o servicios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <section className="start-page__filters-panel" aria-labelledby="category-filter-title">
          <div className="start-page__filters-heading">
            <h1 id="category-filter-title" className="start-page__filters-title">
              Categorías
            </h1>
          </div>

          <div className="start-page__filters" role="group" aria-label="Categorías frecuentes">
            <div className="start-page__filters-scroll">
              {quickCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`start-page__filter${
                    activeCategory === category ? ' start-page__filter--active' : ''
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className={`start-page__dropdown-trigger${
                    moreCategories.includes(activeCategory)
                      ? ' start-page__dropdown-trigger--active'
                      : ''
                  }`}
                >
                  <span>
                    {moreCategories.includes(activeCategory)
                      ? activeCategory
                      : 'Más categorías'}
                  </span>
                  <ChevronDownIcon className="start-page__dropdown-chevron" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="start-page__dropdown-menu"
                  align="end"
                  sideOffset={8}
                  collisionPadding={16}
                >
                  {moreCategories.map((category) => (
                    <DropdownMenu.Item
                      key={category}
                      className={`start-page__dropdown-option${
                        activeCategory === category
                          ? ' start-page__dropdown-option--active'
                          : ''
                      }`}
                      onSelect={() => setActiveCategory(category)}
                    >
                      {category}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </section>

        {isLoading ? (
          <p className="start-page__status">Cargando productos...</p>
        ) : error ? (
          <p className="start-page__status start-page__status--error" role="alert">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="start-page__status">
            No hay productos disponibles con estos filtros.
          </p>
        ) : (
          <div className="start-page__grid">
            {products.map((product) => {
              const liked = likedProductIds.includes(product.id)

              return (
                <div key={product.id} className="start-page__card">
                  <button
                    type="button"
                    className={`start-page__like-button${liked ? ' start-page__like-button--active' : ''}`}
                    aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    onClick={(event) => handleToggleFavorite(event, product.id)}
                  >
                    <HeartIcon filled={liked} />
                  </button>

                  <Link
                    to={paths.productDetail(product.id)}
                    className="start-page__card-link"
                  >
                    <div className="start-page__card-image">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="start-page__card-img"
                        />
                      ) : (
                        <ImagePlaceholderIcon />
                      )}
                    </div>
                    <div className="start-page__card-body">
                      <h2 className="start-page__card-title">{product.name}</h2>
                      {product.is_donation ? (
                        <span className="start-page__card-donation">Donación</span>
                      ) : (
                        <p className="start-page__card-price">
                          {formatPrice(product.price, false)}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <AppFooter variant="light" />
    </div>
  )
}