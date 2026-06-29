import type { ApiTransaction, Reservation, Transaction } from '../types/api'

function toDateKey(iso: string): string {
  return iso.slice(0, 10)
}

export function mapApiTransaction(tx: ApiTransaction): Transaction {
  const isDonation = tx.final_price === 0
  const type: Transaction['type'] = isDonation
    ? 'donation'
    : tx.direction === 'sale'
      ? 'sale'
      : 'purchase'

  const counterparty_name =
    tx.direction === 'sale'
      ? (tx.buyer_name ?? 'Comprador')
      : (tx.seller_name ?? 'Vendedor')

  const amount =
    type === 'donation'
      ? 0
      : tx.direction === 'sale'
        ? tx.final_price
        : -tx.final_price

  return {
    id: tx.id,
    product_name: tx.product_name ?? 'Producto',
    image_url: tx.product_image,
    type,
    date: toDateKey(tx.confirmed_at),
    counterparty_name,
    amount,
    status: isDonation ? 'donated' : 'completed',
  }
}

export function mapReservationToTransaction(res: Reservation): Transaction | null {
  if (res.status !== 'active') return null

  return {
    id: `reservation-${res.id}`,
    product_name: res.product_name ?? 'Producto',
    image_url: res.product_image,
    type: 'purchase',
    date: toDateKey(res.created_at),
    counterparty_name: 'Vendedor',
    amount: -(res.product_price ?? 0),
    status: 'reserved',
  }
}

export function buildHistorySummary(transactions: Transaction[]) {
  return {
    purchases: transactions.filter((t) => t.type === 'purchase').length,
    sales: transactions.filter((t) => t.type === 'sale').length,
    savings: Math.abs(
      transactions
        .filter((t) => t.type === 'purchase' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
    ),
  }
}
