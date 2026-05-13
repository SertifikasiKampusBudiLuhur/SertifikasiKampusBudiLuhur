-- ============================================================
-- MIGRATION v2: Tambah kolom tipe_sesi ke certification_programs
-- Jalankan di Supabase SQL Editor
-- ============================================================

ALTER TABLE public.certification_programs
  ADD COLUMN IF NOT EXISTS tipe_sesi VARCHAR(10) NOT NULL DEFAULT 'offline'
    CHECK (tipe_sesi IN ('online', 'offline', 'hybrid'));

-- ============================================================
-- STORAGE BUCKET: Buat bucket untuk upload poster program
-- Buat di Supabase Dashboard → Storage → New Bucket
--   Name  : banners
--   Public: true (centang Public bucket)
-- Atau jalankan via Supabase Storage API:
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('banners', 'banners', true)
-- ON CONFLICT (id) DO NOTHING;

-- RLS Policy untuk bucket banners (jalankan jika perlu):
-- CREATE POLICY "Public read banners" ON storage.objects
--   FOR SELECT USING (bucket_id = 'banners');
-- CREATE POLICY "Admin upload banners" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'banners');
-- CREATE POLICY "Admin delete banners" ON storage.objects
--   FOR DELETE USING (bucket_id = 'banners');
