import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { chatService } from '../api/chatService'
import { ApiError } from '../api/client'
import { productService } from '../api/productService'
import { reservationService } from '../api/reservationService'
import { useAuth } from './useAuth'
import { paths } from '../routes/paths'
import type { Product } from '../types/api'

function getApiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

function isOwnProduct(product: Product | null, userId: string | undefined): boolean {
  return Boolean(product && userId && product.seller_id === userId)
}

function canReserveProduct(
  product: Product | null,
  isOwner: boolean,
): boolean {
  return Boolean(product?.status === 'available' && !isOwner)
}

export function useProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpeningChat, setIsOpeningChat] = useState(false)
  const [isReserving, setIsReserving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const isOwner = isOwnProduct(product, user?.id)
  const canReserve = canReserveProduct(product, isOwner)

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(paths.gallery, { replace: true })
  }, [navigate])

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(paths.login)
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  const loadProduct = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await productService.getProductById(id)
      setProduct(data)
    } catch (err) {
      setProduct(null)
      setError(getApiErrorMessage(err, 'No se pudo cargar el producto'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !id) return
    void loadProduct()
  }, [isAuthenticated, id, loadProduct])

  const handleOpenChat = useCallback(async () => {
    if (!product || isOwner || isOpeningChat) return

    setIsOpeningChat(true)
    setActionMessage(null)
    setActionError(null)

    try {
      const chat = await chatService.openChat({ product_id: product.id })
      navigate(paths.chatWithId(chat.id))
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo abrir el chat'))
    } finally {
      setIsOpeningChat(false)
    }
  }, [isOpeningChat, isOwner, navigate, product])

  const handleReserve = useCallback(async () => {
    if (!product) return

    setIsReserving(true)
    setActionMessage(null)
    setActionError(null)

    try {
      await reservationService.reserveProduct({ product_id: product.id })
      setActionMessage('Producto reservado por 7 días.')
      await loadProduct()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo reservar el producto'))
    } finally {
      setIsReserving(false)
    }
  }, [loadProduct, product])

  return {
    isAuthLoading,
    isAuthenticated,
    product,
    isLoading,
    isOpeningChat,
    isReserving,
    error,
    actionMessage,
    actionError,
    isOwner,
    canReserve,
    handleBack,
    handleOpenChat,
    handleReserve,
  }
}
