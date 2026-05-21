// ============================================================
// Types — Sistem Registrasi Sertifikasi Kampus
// ============================================================

export type Role = 'mahasiswa' | 'admin'

export type RegistrationStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'APPROVED'
  | 'REJECTED'

export interface Profile {
  id: string
  nim: string
  nama_lengkap: string
  program_studi: string
  angkatan: string
  no_wa?: string
  ktm_url?: string
  avatar_url?: string
  role: Role
  created_at: string
  updated_at: string
}

export type TipeSesi = 'online' | 'offline' | 'hybrid'

export interface CertificationProgram {
  id: string
  nama: string
  deskripsi?: string
  biaya: number
  kuota: number
  kuota_terisi: number
  tanggal_mulai: string
  tanggal_selesai?: string
  lokasi?: string
  tipe_sesi: TipeSesi
  sesi_1?: string
  sesi_2?: string
  is_active: boolean
  banner_url?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  user_id: string
  program_id: string
  jadwal_pilihan?: string
  catatan?: string
  alasan_tolak?: string
  sertifikat_url?: string
  status: RegistrationStatus
  verified_by?: string
  verified_at?: string
  created_at: string
  updated_at: string
  // joined
  program?: CertificationProgram
  user?: Profile
  transaction?: Transaction
}

export interface Transaction {
  id: string
  registration_id: string
  order_id: string
  snap_token?: string
  snap_redirect_url?: string
  gross_amount: number
  payment_type?: string
  transaction_id?: string
  midtrans_status?: string
  paid_at?: string
  created_at: string
  updated_at: string
}

// Midtrans Snap
export interface MidtransResult {
  order_id: string
  transaction_status: string
  fraud_status?: string
  payment_type?: string
}

// Dashboard stats
export interface AdminStats {
  total: number
  pending_payment: number
  paid: number
  approved: number
  rejected: number
}
