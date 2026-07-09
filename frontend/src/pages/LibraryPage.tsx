import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import { authService } from '../api/authService'
import { productService } from '../api/productService'
import { transactionService } from '../api/transactionService'
import { useAuth } from '../hooks/useAuth'
import { paths } from '../routes/paths'
import type { Product, Transaction, User } from '../types/api'
import { mapApiTransaction } from '../utils/mapHistoryTransactions'
import './HistoryPage.css'

interface LibraryProductItem extends Product {
  kind: 'product'
}

interface LibraryTransactionItem extends Transaction {
  kind: 'transaction'
  buyer_name?: string
  seller_name?: string
}

type LibraryItem = LibraryProductItem | LibraryTransactionItem

function getLibraryItemSearchText(item: LibraryItem): string {
  if (item.kind === 'transaction') {
    const parties = `${item.seller_name ?? ''} ${item.buyer_name ?? ''}`.trim()
    return `${item.product_name} ${parties}`
  }

  return `${item.name} ${item.seller_name ?? ''}`
}

function getLibraryItemMeta(item: LibraryItem): string {
  if (item.kind === 'transaction') {
    return `Entregado por ${item.seller_name ?? 'Vendedor'} · Adquirido por ${item.buyer_name ?? 'Comprador'}`
  }

  return `Subido por ${item.seller_name ?? 'Biblioteca'} · Universidad`
}

type LibraryItemsSectionProps = Readonly<{
  isLoading: boolean
  error: string | null
  items: LibraryItem[]
  users: User[]
  selectedBuyerId: string
  onBuyerChange: (buyerId: string) => void
  onAcquire: (productId: string) => void
  onDelete: (productId: string) => void
}>

function LibraryItemsSection({
  isLoading,
  error,
  items,
  users,
  selectedBuyerId,
  onBuyerChange,
  onAcquire,
  onDelete,
}: LibraryItemsSectionProps) {
  if (isLoading) {
    return <p className="history-page__status">Cargando productos...</p>
  }

  if (error) {
    return (
      <p className="history-page__status" role="alert">
        {error}
      </p>
    )
  }

  if (items.length === 0) {
    return <p className="history-page__status">No hay elementos para mostrar.</p>
  }

  return (
    <section className="history-page__list">
      {items.map((item) => (
        <article key={item.id} className="history-item">
          <div className="history-item__thumb">
            {item.image_url ? <img src={item.image_url} alt="" /> : <span>📦</span>}
          </div>
          <div className="history-item__body">
            <p className="history-item__name">
              {item.kind === 'transaction' ? item.product_name : item.name}
            </p>
            <p className="history-item__meta">{getLibraryItemMeta(item)}</p>
          </div>
          <div className="history-item__aside">
            {item.kind !== 'transaction' && (
              <>
                <select
                  className="history-page__filter"
                  value={selectedBuyerId}
                  onChange={(event) => onBuyerChange(event.target.value)}
                  aria-label="Seleccionar adquiriente"
                >
                  {users.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.full_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="history-page__filter"
                  onClick={() => onAcquire(item.id)}
                >
                  Adquirido
                </button>
                <button
                  type="button"
                  className="history-page__filter"
                  onClick={() => onDelete(item.id)}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </article>
      ))}
    </section>
  )
}

interface LibraryPageProps {
  view?: 'default' | 'delivered'
}

export default function LibraryPage({ view = 'default' }: Readonly<LibraryPageProps>) {
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
    if (user?.role !== 'library') return

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
      setTransactions(
        history.map((tx) => ({
          ...mapApiTransaction(tx),
          buyer_name: tx.buyer_name,
          seller_name: tx.seller_name,
        })),
      )
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
    if (view === 'delivered') {
      return transactions.map((transaction) => ({ ...transaction, kind: 'transaction' as const }))
    }

    return products.map((product) => ({ ...product, kind: 'product' as const }))
  }, [products, transactions, user, view])

  const searchedItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return visibleProducts

    return visibleProducts.filter((item) =>
      getLibraryItemSearchText(item).toLowerCase().includes(query),
    )
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
            {view === 'delivered'
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

        <LibraryItemsSection
          isLoading={isLoading}
          error={error}
          items={searchedItems}
          users={users}
          selectedBuyerId={selectedBuyerId}
          onBuyerChange={setSelectedBuyerId}
          onAcquire={handleAcquire}
          onDelete={handleDelete}
        />
      </main>
    </div>
  )
}
