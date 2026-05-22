-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Sinkronisasi kuota_terisi sekarang ditangani otomatis oleh trigger
-- database. Lihat database/migration_v6.sql (trigger sync_kuota_terisi).

-- Seed admin user (jalankan setelah buat user di Supabase Auth)
-- UPDATE public.profiles SET role = 'admin' WHERE nim = 'ADMIN001';

-- View untuk dashboard admin (opsional)
CREATE OR REPLACE VIEW admin_registration_summary AS
SELECT
  cp.nama as program_nama,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE r.status = 'PENDING_PAYMENT') as pending_payment,
  COUNT(*) FILTER (WHERE r.status = 'PAID') as paid,
  COUNT(*) FILTER (WHERE r.status = 'APPROVED') as approved,
  COUNT(*) FILTER (WHERE r.status = 'REJECTED') as rejected
FROM registrations r
JOIN certification_programs cp ON r.program_id = cp.id
GROUP BY cp.id, cp.nama;
