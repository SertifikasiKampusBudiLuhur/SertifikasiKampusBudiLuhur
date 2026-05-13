import { type ClassValue, clsx } from 'clsx'
import { RegistrationStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

export const STATUS_LABEL: Record<RegistrationStatus, string> = {
  DRAFT: 'Draft',
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAID: 'Sudah Dibayar',
  APPROVED: 'Diterima',
  REJECTED: 'Ditolak',
}

export const STATUS_COLOR: Record<RegistrationStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export function generateOrderId(registrationId: string): string {
  return `CERT-${registrationId.substring(0, 8)}-${Date.now()}`
}
