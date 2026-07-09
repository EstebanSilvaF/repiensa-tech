import ImagePlaceholderIcon from '../components/icons/ImagePlaceholderIcon'
import type { Product } from '../types/api'
import { formatPrice } from '../utils/formatPrice'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import {
  getCategoryLabel,
  getConditionLabel,
  getProductStatusLabel,
} from '../utils/productLabels'

type ProductDetailBodyProps = Readonly<{
  isLoading: boolean
  error: string | null
  product: Product | null
  isOwner: boolean
  canReserve: boolean
  isOpeningChat: boolean
  isReserving: boolean
  actionMessage: string | null
  actionError: string | null
  onOpenChat: () => void
  onReserve: () => void
}>

export function ProductDetailBody({
  isLoading,
  error,
  product,
  isOwner,
  canReserve,
  isOpeningChat,
  isReserving,
  actionMessage,
  actionError,
  onOpenChat,
  onReserve,
}: ProductDetailBodyProps) {
  if (isLoading) {
    return <p className="product-detail-page__status">Cargando producto...</p>
  }

  if (error || !product) {
    return (
      <p
        className="product-detail-page__status product-detail-page__status--error"
        role="alert"
      >
        {error ?? 'Producto no encontrado'}
      </p>
    )
  }

  return (
    <ProductDetailCard
      product={product}
      isOwner={isOwner}
      canReserve={canReserve}
      isOpeningChat={isOpeningChat}
      isReserving={isReserving}
      actionMessage={actionMessage}
      actionError={actionError}
      onOpenChat={onOpenChat}
      onReserve={onReserve}
    />
  )
}

type ProductDetailCardProps = Readonly<{
  product: Product
  isOwner: boolean
  canReserve: boolean
  isOpeningChat: boolean
  isReserving: boolean
  actionMessage: string | null
  actionError: string | null
  onOpenChat: () => void
  onReserve: () => void
}>

function ProductDetailCard({
  product,
  isOwner,
  canReserve,
  isOpeningChat,
  isReserving,
  actionMessage,
  actionError,
  onOpenChat,
  onReserve,
}: ProductDetailCardProps) {
  return (
    <article className="product-detail-card">
      <ProductImage imageUrl={product.image_url} name={product.name} />

      <div className="product-detail-card__info">
        <h2 className="product-detail-card__name">{product.name}</h2>
        <ProductPriceRow isDonation={product.is_donation} price={product.price} />

        {product.description && (
          <p className="product-detail-card__description">{product.description}</p>
        )}

        <ProductMeta product={product} />

        {isOwner ? (
          <p className="product-detail-card__disclaimer">Este es tu producto publicado.</p>
        ) : (
          <ProductBuyerActions
            product={product}
            canReserve={canReserve}
            isOpeningChat={isOpeningChat}
            isReserving={isReserving}
            actionMessage={actionMessage}
            actionError={actionError}
            onOpenChat={onOpenChat}
            onReserve={onReserve}
          />
        )}
      </div>
    </article>
  )
}

type ProductImageProps = Readonly<{
  imageUrl: string | null | undefined
  name: string
}>

function ProductImage({ imageUrl, name }: ProductImageProps) {
  return (
    <div className="product-detail-card__image">
      {imageUrl ? <img src={imageUrl} alt={name} /> : <ImagePlaceholderIcon />}
    </div>
  )
}

type ProductPriceRowProps = Readonly<{
  isDonation: boolean
  price: number
}>

function ProductPriceRow({ isDonation, price }: ProductPriceRowProps) {
  return (
    <div className="product-detail-card__price-row">
      {isDonation ? (
        <span className="product-detail-card__donation">Donación</span>
      ) : (
        <span className="product-detail-card__price">{formatPrice(price, false)}</span>
      )}
      {!isDonation && (
        <span className="product-detail-card__payment-note">
          Pago en persona al encontrarse
        </span>
      )}
    </div>
  )
}

type ProductMetaProps = Readonly<{
  product: Product
}>

function ProductMeta({ product }: ProductMetaProps) {
  return (
    <dl className="product-detail-card__meta">
      <div className="product-detail-card__meta-row">
        <dt>Estado</dt>
        <dd>{getConditionLabel(product.condition)}</dd>
      </div>
      <div className="product-detail-card__meta-row">
        <dt>Categoría</dt>
        <dd>{getCategoryLabel(product.category)}</dd>
      </div>
      <div className="product-detail-card__meta-row">
        <dt>Disponibilidad</dt>
        <dd>{getProductStatusLabel(product.status)}</dd>
      </div>
      <div className="product-detail-card__meta-row">
        <dt>Publicado</dt>
        <dd>{formatRelativeTime(product.created_at)}</dd>
      </div>
      {product.seller_name && (
        <div className="product-detail-card__meta-row">
          <dt>Vendedor</dt>
          <dd>{product.seller_name}</dd>
        </div>
      )}
    </dl>
  )
}

type ProductBuyerActionsProps = Readonly<{
  product: Product
  canReserve: boolean
  isOpeningChat: boolean
  isReserving: boolean
  actionMessage: string | null
  actionError: string | null
  onOpenChat: () => void
  onReserve: () => void
}>

function ProductBuyerActions({
  product,
  canReserve,
  isOpeningChat,
  isReserving,
  actionMessage,
  actionError,
  onOpenChat,
  onReserve,
}: ProductBuyerActionsProps) {
  const chatButtonLabel = isOpeningChat ? 'Abriendo chat...' : 'Abrir chat con vendedor'
  const reserveButtonLabel = isReserving ? 'Reservando...' : 'Reservar producto'

  return (
    <>
      <div className="product-detail-card__actions">
        <button
          type="button"
          className="product-detail-card__btn product-detail-card__btn--primary"
          onClick={onOpenChat}
          disabled={isOpeningChat || product.status === 'sold'}
        >
          {chatButtonLabel}
        </button>
        <button
          type="button"
          className="product-detail-card__btn product-detail-card__btn--secondary"
          onClick={onReserve}
          disabled={!canReserve || isReserving}
        >
          {reserveButtonLabel}
        </button>
      </div>

      {actionMessage && (
        <output className="product-detail-card__disclaimer">{actionMessage}</output>
      )}
      {actionError && (
        <p
          className="product-detail-page__status product-detail-page__status--error"
          role="alert"
        >
          {actionError}
        </p>
      )}

      <p className="product-detail-card__disclaimer">
        Reserva = bloqueas este producto 7 días pagando una tarifa pequeña. Si no
        compras, pierdes la tarifa.
      </p>
    </>
  )
}
