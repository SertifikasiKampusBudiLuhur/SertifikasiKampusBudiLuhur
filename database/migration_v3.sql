-- ============================================================
-- MIGRATION v3: Upload KTM & Sertifikat
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom ktm_url ke profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ktm_url TEXT;

-- 2. Tambah kolom sertifikat_url ke registrations
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS sertifikat_url TEXT;

-- ============================================================
-- STORAGE BUCKETS
-- Buat dua bucket di Supabase Dashboard → Storage → New Bucket
--
-- Bucket 1:
--   Name  : ktm
--   Public: false (private, hanya pemilik & admin yang bisa akses)
--
-- Bucket 2:
--   Name  : sertifikat
--   Public: false (private, hanya pemilik & admin yang bisa akses)
--
-- Atau jalankan SQL berikut (uncomment jika perlu):
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('ktm', 'ktm', false), ('sertifikat', 'sertifikat', false)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS POLICIES untuk bucket 'ktm'
-- ============================================================

-- Mahasiswa bisa upload KTM milik sendiri
CREATE POLICY "ktm_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ktm'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Mahasiswa bisa update/replace KTM milik sendiri
CREATE POLICY "ktm_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'ktm'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Mahasiswa bisa lihat KTM milik sendiri, admin bisa lihat semua
CREATE POLICY "ktm_select_own_or_admin" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'ktm'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Admin bisa hapus KTM
CREATE POLICY "ktm_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'ktm'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- RLS POLICIES untuk bucket 'sertifikat'
-- ============================================================

-- Admin bisa upload sertifikat
CREATE POLICY "sertifikat_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sertifikat'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin bisa update sertifikat
CREATE POLICY "sertifikat_update_admin" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'sertifikat'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Mahasiswa bisa lihat sertifikat milik sendiri (via signed URL), admin lihat semua
CREATE POLICY "sertifikat_select_own_or_admin" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'sertifikat'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Admin bisa hapus sertifikat
CREATE POLICY "sertifikat_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'sertifikat'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
