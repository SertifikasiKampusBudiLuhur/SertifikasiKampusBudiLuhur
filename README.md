# Sistem Registrasi Sertifikasi Kampus — Paket Basic

Aplikasi Next.js + Supabase + Midtrans untuk registrasi sertifikasi kampus.

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Payment**: Midtrans Sandbox (Snap)
- **Styling**: Tailwind CSS

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/               # Login & Register mahasiswa
│   │   ├── login/
│   │   └── register/
│   ├── (mahasiswa)/          # Halaman khusus mahasiswa
│   │   ├── dashboard/
│   │   ├── programs/
│   │   │   └── [id]/
│   │   ├── daftar/
│   │   │   └── [programId]/  # Form pendaftaran + Midtrans
│   │   └── riwayat/
│   ├── (admin)/              # Panel admin
│   │   └── admin/
│   │       ├── login/
│   │       ├── dashboard/
│   │       ├── programs/     # CRUD program
│   │       └── registrations/ # Verifikasi & approve/reject
│   ├── api/
│   │   ├── auth/logout/
│   │   └── midtrans/
│   │       ├── create-token/ # Generate Snap token
│   │       └── notification/ # Webhook dari Midtrans
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   └── globals.css
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client + service client
│   └── utils.ts
├── types/index.ts
└── middleware.ts             # Auth & role protection
database/
├── schema.sql                # Tabel + trigger
├── rls-policies.sql          # Row Level Security
└── functions.sql             # Helper functions + views
```

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd sertifikasi-kampus
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env.local
```

Isi `.env.local` dengan:
- `NEXT_PUBLIC_SUPABASE_URL` — dari Supabase dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key (rahasia, hanya server)
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — dari dashboard Midtrans Sandbox
- `MIDTRANS_SERVER_KEY` — dari dashboard Midtrans Sandbox

### 3. Setup Database Supabase

Di **Supabase SQL Editor**, jalankan file berikut secara berurutan:

1. `database/schema.sql` — Buat tabel, trigger, function handle_new_user
2. `database/rls-policies.sql` — Row Level Security policies
3. `database/functions.sql` — Helper functions

### 4. Buat Akun Admin

```bash
# Option A: Via Supabase Auth dashboard
# Buat user baru, lalu di SQL Editor:
UPDATE public.profiles SET role = 'admin' WHERE nim = 'ADMIN001';

# Option B: Via SQL langsung (setelah user terdaftar)
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'uuid-dari-auth-users';
```

### 5. Konfigurasi Midtrans Webhook

Di dashboard Midtrans Sandbox → Settings → Configuration:

```
Payment Notification URL: https://yourdomain.com/api/midtrans/notification
```

Untuk development lokal, gunakan **ngrok**:
```bash
ngrok http 3000
# Gunakan URL ngrok sebagai Payment Notification URL
```

### 6. Jalankan Aplikasi

```bash
npm run dev
```

Buka http://localhost:3000

## Alur Sistem

### Mahasiswa
1. Registrasi akun (NIM, nama, prodi, dll)
2. Login → Dashboard
3. Pilih program sertifikasi
4. Isi form pendaftaran
5. Bayar via Midtrans Snap (VA/QRIS/e-wallet)
6. Tunggu webhook → status PAID otomatis
7. Tunggu verifikasi admin → APPROVED/REJECTED

### Admin
1. Login di `/admin/login`
2. Dashboard: lihat statistik
3. CRUD program sertifikasi
4. Lihat daftar pendaftar (filter by status)
5. Verifikasi data (NIM, prodi, kuota)
6. Approve / Reject (dengan alasan)
7. Export data APPROVED ke Excel

## Status Alur Pendaftaran

```
DRAFT → PENDING_PAYMENT → PAID → APPROVED
                                ↘ REJECTED
```

- `DRAFT` — Form diisi, belum bayar
- `PENDING_PAYMENT` — Snap token dibuat, menunggu pembayaran
- `PAID` — Webhook Midtrans diterima (settlement)
- `APPROVED` — Admin menyetujui
- `REJECTED` — Admin menolak (refund manual via WA)

## Catatan Penting

- **Refund**: Tidak terintegrasi ke sistem (scope Paket Basic). Admin proses manual via WhatsApp.
- **Midtrans mode**: Sandbox. Untuk production, ubah URL ke `app.midtrans.com` dan set `MIDTRANS_IS_PRODUCTION=true`.
- **Service Role Key**: Hanya digunakan di server (webhook). Jangan expose ke client.
- **Webhook**: Pastikan endpoint `/api/midtrans/notification` dapat diakses publik (tidak di-block middleware).
