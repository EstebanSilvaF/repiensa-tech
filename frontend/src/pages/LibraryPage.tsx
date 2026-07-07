import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import { authService } from '../api/authService'
import { productService } from '../api/productService'
import { transactionService } from '../api/transactionService'
import { useAuth } from '../hooks/useAuth'
import { paths } from '../routes/paths'
import type { Product, Transaction, User } from '../types/api'

interface LibraryProductItem extends Product {
  kind: 'product'
}

interface LibraryTransactionItem extends Transaction {
  kind: 'transaction'
  buyer_name?: string
  seller_name?: string
}

type LibraryItem = LibraryProductItem | LibraryTransactionItem

interface LibraryPageProps {
  view?: 'default' | 'uploads' | 'delivered'
}

export default function LibraryPage({ view = 'default' }: LibraryPageProps) {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(paths.login)
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  async function loadData() {
    if (!user || user.role !== 'library') return

    setIsLoading(true)
    setError(null)

    try {
      const [allProducts, history, universityUsers] = await Promise.all([
        productService.getProducts(),
        transactionService.getTransactions(),
        authService.getUsersByUniversity(),
      ])

      const universityProducts = allProducts.filter(
        (product) => product.university_id === user.university_id,
      )
      setProducts(universityProducts)
      setUsers(universityUsers)
      setSelectedBuyerId((current) => current || universityUsers.find((candidate) => candidate.id === user.id)?.id || universityUsers[0]?.id || '')
      setTransactions(history.map((tx) => ({
        ...tx,
        product_name: tx.product_name ?? 'Producto',
        counterparty_name: tx.direction === 'sale' ? tx.buyer_name ?? 'Comprador' : tx.seller_name ?? 'Vendedor',
        amount: tx.direction === 'sale' ? tx.final_price : -tx.final_price,
        status: tx.final_price === 0 ? 'donated' : 'completed',
        type: tx.final_price === 0 ? 'donation' : tx.direction === 'sale' ? 'sale' : 'purchase',
        date: tx.confirmed_at.slice(0, 10),
        image_url: tx.product_image ?? undefined,
        buyer_name: tx.buyer_name,
        seller_name: tx.seller_name,
      })))
    } catch {
      setError('No se pudo cargar la vista de biblioteca')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'library') return

    let cancelled = false

    async function runLoad() {
      await loadData()
      if (cancelled) return
    }

    runLoad()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user])

  const visibleProducts = useMemo<LibraryItem[]>(() => {
    if (view === 'uploads') {
      return products.filter((product) => product.seller_id === user?.id).map((product) => ({ ...product, kind: 'product' as const }))
    }

    if (view === 'delivered') {
      return transactions.map((transaction) => ({ ...transaction, kind: 'transaction' as const }))
    }

    return products.map((product) => ({ ...product, kind: 'product' as const }))
  }, [products, transactions, user, view])

  const searchedItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return visibleProducts

    return visibleProducts.filter((item) => {
      const haystack = `${item.kind === 'transaction' ? item.product_name : item.name} ${item.kind === 'transaction' ? `${item.seller_name ?? ''} ${item.buyer_name ?? ''}` : item.seller_name ?? ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [search, visibleProducts])

  async function handleDelete(productId: string) {
    if (!window.confirm('¿Deseas eliminar este producto de la biblioteca?')) return

    try {
      await productService.deleteProduct(productId)
      await loadData()
    } catch {
      setError('No se pudo eliminar el producto')
    }
  }

  async function handleAcquire(productId: string) {
    if (!selectedBuyerId) {
      setError('Selecciona un adquiriente antes de confirmar')
      return
    }

    if (!window.confirm('¿Marcar este producto como adquirido?')) return

    try {
      await productService.acquireProduct(productId, selectedBuyerId)
      await loadData()
    } catch {
      setError('No se pudo marcar el producto como adquirido')
    }
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="history-page">
        <AppNavbar />
        <p className="history-page__status">Cargando...</p>
      </div>
    )
  }

  if (user?.role !== 'library') {
    return (
      <div className="history-page">
        <AppNavbar />
        <p className="history-page__status">Esta vista es exclusiva para usuarios de biblioteca.</p>
      </div>
    )
  }

  return (
    <div className="history-page">
      <AppNavbar />
      <main className="history-page__main">
        <header className="history-page__header">
          <h1 className="history-page__title">Biblioteca</h1>
          <p className="history-page__subtitle">
            {view === 'uploads'
              ? 'Productos subidos por la biblioteca'
              : view === 'delivered'
                ? 'Historial de productos entregados'
                : 'Productos disponibles para la universidad'}
          </p>
        </header>

        <input
          type="search"
          className="history-page__filter"
          placeholder="Buscar por producto o nombre"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ marginBottom: '1rem', width: '100%' }}
        />

        {isLoading ? (
          <p className="history-page__status">Cargando productos...</p>
        ) : error ? (
          <p className="history-page__status" role="alert">{error}</p>
        ) : searchedItems.length === 0 ? (
          <p className="history-page__status">No hay elementos para mostrar.</p>
        ) : (
          <section className="history-page__list">
            {searchedItems.map((item) => (
              <article key={item.id} className="history-item">
                <div className="history-item__thumb">
                  {item.image_url ? <img src={item.image_url} alt="" /> : <span>📦</span>}
                </div>
                <div className="history-item__body">
                  <p className="history-item__name">
                    {item.kind === 'transaction' ? item.product_name : item.name}
                  </p>
                  <p className="history-item__meta">
                    {item.kind === 'transaction'
                      ? `Entregado por ${item.seller_name ?? 'Vendedor'} · Adquirido por ${item.buyer_name ?? 'Comprador'}`
                      : item.kind === 'product' && view === 'uploads'
                        ? `Subido por ${item.seller_name ?? 'Biblioteca'}`
                        : `Subido por ${item.seller_name ?? 'Biblioteca'} · Universidad`}
                  </p>
                </div>
                <div className="history-item__aside">
                  {item.kind !== 'transaction' && (
                    <>
                      <select
                        className="history-page__filter"
                        value={selectedBuyerId}
                        onChange={(event) => setSelectedBuyerId(event.target.value)}
                        aria-label="Seleccionar adquiriente"
                      >
                        {users.map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.full_name}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="history-page__filter" onClick={() => handleAcquire(item.id)}>
                        Adquirido
                      </button>
                      <button type="button" className="history-page__filter" onClick={() => handleDelete(item.id)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
