import AppFooter from '../components/layout/AppFooter'
import AppNavbar from '../components/layout/AppNavbar'
import { useProductDetailPage } from '../hooks/useProductDetailPage'
import { ProductDetailBody } from './ProductDetailPage.parts'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const detail = useProductDetailPage()

  if (detail.isAuthLoading || !detail.isAuthenticated) {
    return (
      <div className="product-detail-page">
        <AppNavbar />
        <p className="product-detail-page__status">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      <AppNavbar />

      <main className="product-detail-page__main">
        <button
          type="button"
          className="product-detail-page__back"
          onClick={detail.handleBack}
        >
          ← Volver
        </button>

        <h1 className="product-detail-page__title">Detalle del producto</h1>

        <ProductDetailBody
          isLoading={detail.isLoading}
          error={detail.error}
          product={detail.product}
          isOwner={detail.isOwner}
          canReserve={detail.canReserve}
          isOpeningChat={detail.isOpeningChat}
          isReserving={detail.isReserving}
          actionMessage={detail.actionMessage}
          actionError={detail.actionError}
          onOpenChat={() => void detail.handleOpenChat()}
          onReserve={() => void detail.handleReserve()}
        />
      </main>

      <AppFooter variant="light" />
    </div>
  )
}
