-- ============================================================
-- MIGRATION v4: Sesi wajib (2 slot) untuk certification_programs
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah 2 kolom sesi (slot waktu) yang ditentukan admin.
--    Mahasiswa wajib memilih salah satu saat mendaftar.
ALTER TABLE public.certification_programs
  ADD COLUMN IF NOT EXISTS sesi_1 VARCHAR(200),
  ADD COLUMN IF NOT EXISTS sesi_2 VARCHAR(200);

-- 2. Backfill program lama agar tidak NULL.
UPDATE public.certification_programs
SET
  sesi_1 = COALESCE(NULLIF(sesi_1, ''), 'Sesi Pagi (08.00 - 12.00)'),
  sesi_2 = COALESCE(NULLIF(sesi_2, ''), 'Sesi Siang (13.00 - 17.00)')
WHERE sesi_1 IS NULL OR sesi_2 IS NULL OR sesi_1 = '' OR sesi_2 = '';

-- 3. Index untuk filter tanggal daftar (Day/Month/Year) di halaman admin.
CREATE INDEX IF NOT EXISTS idx_registrations_created_at
  ON public.registrations(created_at);
