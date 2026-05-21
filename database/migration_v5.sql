-- ============================================================
-- MIGRATION v5: Foto profil mahasiswa
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom avatar_url ke profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================
-- STORAGE BUCKET: avatars (foto profil)
-- Buat di Supabase Dashboard → Storage → New Bucket
--   Name  : avatars
--   Public: true (centang Public bucket — foto profil bisa diakses publik)
--
-- Atau jalankan SQL berikut:
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS POLICIES untuk bucket 'avatars'
-- ============================================================

-- Semua orang bisa lihat foto profil (public read)
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- User bisa upload foto profil milik sendiri
CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- User bisa ganti foto profil milik sendiri
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- User bisa hapus foto profil milik sendiri
CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
