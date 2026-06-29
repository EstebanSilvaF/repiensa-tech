import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { reservationService } from '../api/reservationService'
import { transactionService } from '../api/transactionService'
import AppNavbar from '../components/layout/AppNavbar'
import ImagePlaceholderIcon from '../components/icons/ImagePlaceholderIcon'
import { useAuth } from '../hooks/useAuth'
import { paths } from '../routes/paths'
import type { Transaction, TransactionFilter } from '../types/api'
import {
  buildHistorySummary,
  mapApiTransaction,
  mapReservationToTransaction,
} from '../utils/mapHistoryTransactions'
import './HistoryPage.css'

const FILTERS: { key: TransactionFilter; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'purchase', label: 'Compras' },
  { key: 'sale', label: 'Ventas' },
  { key: 'donation', label: 'Donaciones' },
]

const STATUS_LABELS = {
  reserved: 'Reservado',
  completed: 'Completado',
  donated: 'Donado',
} as const

function formatAmount(amount: number): string {
  const abs = Math.abs(amount).toLocaleString('es-CO')
  if (amount > 0) return `+$${abs}`
  if (amount < 0) return `-$${abs}`
  return '$0'
}

function formatMonthLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatShortDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  return d
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    .replace('.', '')
}

function transactionMeta(tx: Transaction): string {
  const date = formatShortDate(tx.date)
  if (tx.type === 'purchase') {
    return `Compra · ${date} · Vendedor: ${tx.counterparty_name}`
  }
  if (tx.type === 'sale') {
    return `Venta · ${date} · Comprador: ${tx.counterparty_name}`
  }
  return `Donación · ${date} · Donado a: ${tx.counterparty_name}`
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TransactionFilter>('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
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

    async function loadHistory() {
      setIsLoading(true)
      setError(null)

      try {
        const [apiTransactions, reservations] = await Promise.all([
          transactionService.getTransactions(),
          reservationService.getReservations(),
        ])

        const completed = apiTransactions.map(mapApiTransaction)
        const activeReservations = reservations
          .map(mapReservationToTransaction)
          .filter((item): item is Transaction => item !== null)

        const merged = [...activeReservations, ...completed].sort((a, b) =>
          b.date.localeCompare(a.date),
        )

        if (!cancelled) setTransactions(merged)
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el historial')
          setTransactions([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions
    return transactions.filter((t) => t.type === filter)
  }, [filter, transactions])

  const summary = useMemo(
    () => buildHistorySummary(transactions),
    [transactions],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of filtered) {
      const key = formatMonthLabel(tx.date)
      const group = map.get(key)
      if (group) {
        group.push(tx)
      } else {
        map.set(key, [tx])
      }
    }
    return [...map.entries()]
  }, [filtered])

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="history-page">
        <AppNavbar />
        <p className="history-page__status">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="history-page">
      <AppNavbar />

      <main className="history-page__main">
        <Link to={paths.gallery} className="history-page__back">
          ← Volver
        </Link>

        <header className="history-page__header">
          <h1 className="history-page__title">Historial</h1>
          <p className="history-page__subtitle">
            Registro de tus compras, ventas y donaciones
          </p>
        </header>

        <section className="history-page__summary" aria-label="Resumen">
          <article className="history-card history-card--purchases">
            <span className="history-card__value history-card__value--blue">
              {summary.purchases}
            </span>
            <span className="history-card__label">Compras realizadas</span>
          </article>
          <article className="history-card history-card--sales">
            <span className="history-card__value history-card__value--green">
              {summary.sales}
            </span>
            <span className="history-card__label">Ventas completadas</span>
          </article>
          <article className="history-card history-card--savings">
            <span className="history-card__value history-card__value--orange">
              ${summary.savings.toLocaleString('es-CO')}
            </span>
            <span className="history-card__label">Ahorrado comprando</span>
          </article>
        </section>

        <div
          className="history-page__filters"
          role="group"
          aria-label="Filtrar transacciones"
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`history-page__filter${
                filter === key ? ' history-page__filter--active' : ''
              }`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <section className="history-page__list">
          {isLoading ? (
            <p className="history-page__status">Cargando historial...</p>
          ) : error ? (
            <p className="history-page__status" role="alert">
              {error}
            </p>
          ) : grouped.length === 0 ? (
            <p className="history-page__status">
              No hay transacciones con este filtro.
            </p>
          ) : (
            grouped.map(([month, items]) => (
              <div key={month} className="history-month">
                <h2 className="history-month__title">{month}</h2>
                <ul className="history-month__items">
                  {items.map((tx) => (
                    <li key={tx.id} className="history-item">
                      <div className="history-item__thumb">
                        {tx.image_url ? (
                          <img src={tx.image_url} alt="" />
                        ) : (
                          <ImagePlaceholderIcon />
                        )}
                      </div>
                      <div className="history-item__body">
                        <p className="history-item__name">{tx.product_name}</p>
                        <p className="history-item__meta">{transactionMeta(tx)}</p>
                      </div>
                      <div className="history-item__aside">
                        <span
                          className={`history-item__amount history-item__amount--${tx.type}`}
                        >
                          {formatAmount(tx.amount)}
                        </span>
                        <span
                          className={`history-item__badge history-item__badge--${tx.status}`}
                        >
                          {STATUS_LABELS[tx.status]}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      </main>

      <footer className="history-page__footer">
        <span>© 2026 Re-Pensa Tech</span>
        <span>Economía circular universitaria</span>
      </footer>
    </div>
  )
}
