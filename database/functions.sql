-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Increment kuota_terisi saat pembayaran berhasil
CREATE OR REPLACE FUNCTION increment_kuota_terisi(program_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.certification_programs
  SET kuota_terisi = kuota_terisi + 1
  WHERE id = program_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
