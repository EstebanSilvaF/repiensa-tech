import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productService } from '../api/productService'
import AppFooter from '../components/layout/AppFooter'
import AppNavbar from '../components/layout/AppNavbar'
import ImagePlaceholderIcon from '../components/icons/ImagePlaceholderIcon'
import { useAuth } from '../hooks/useAuth'
import { paths } from '../routes/paths'
import type { Product } from '../types/api'
import { filterMockProducts } from '../data/mockProducts'
import { getLikedProductIds } from '../utils/favorites'
import { formatPrice } from '../utils/formatPrice'
import HeartIcon from '../components/icons/HeartIcon'
import './FavoritesPage.css'

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(paths.login)
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function loadFavorites() {
      setIsLoading(true)
      setError(null)

      try {
        const favoriteIds = getLikedProductIds()
        const allProducts = await productService.getProducts()
        if (!cancelled) {
          setProducts(
            allProducts.filter(
              (product) =>
                favoriteIds.includes(product.id) && product.status === 'available',
            ),
          )
        }
      } catch {
        if (!cancelled) {
          const favoriteIds = getLikedProductIds()
          setProducts(
            filterMockProducts()
              .filter((product) => favoriteIds.includes(product.id))
              .filter((product) => product.status === 'available'),
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadFavorites()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const favoriteCount = useMemo(() => products.length, [products])

  return (
    <div className="favorites-page">
      <AppNavbar />

      <main className="favorites-page__main">
        <Link to={paths.profile} className="favorites-page__back">
          ← Volver al perfil
        </Link>

        <section className="favorites-page__content">
          <div className="favorites-page__header">
            <div>
              <h1>Productos favoritos</h1>
              <p>Selecciona y revisa los productos que guardaste con me gusta.</p>
            </div>
            <span className="favorites-page__badge">{favoriteCount} favoritos</span>
          </div>

          {isLoading ? (
            <p className="favorites-page__status">Cargando favoritos...</p>
          ) : products.length === 0 ? (
            <div className="favorites-page__empty">
              <HeartIcon className="favorites-page__empty-icon" />
              <p>No tienes productos favoritos aún.</p>
              <Link to={paths.gallery} className="favorites-page__action">
                Ir al catálogo de productos
              </Link>
            </div>
          ) : (
            <div className="favorites-page__grid">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={paths.productDetail(product.id)}
                  className="favorites-page__card"
                >
                  <div className="favorites-page__card-image">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="favorites-page__card-img"
                      />
                    ) : (
                      <ImagePlaceholderIcon />
                    )}
                  </div>
                  <div className="favorites-page__card-body">
                    <h2>{product.name}</h2>
                    {product.is_donation ? (
                      <span className="favorites-page__card-donation">Donación</span>
                    ) : (
                      <p className="favorites-page__card-price">
                        {formatPrice(product.price, false)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <AppFooter variant="light" />
    </div>
  )
}
