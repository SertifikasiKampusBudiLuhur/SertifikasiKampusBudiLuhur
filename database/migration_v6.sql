-- ============================================================
-- MIGRATION v6: Auto-sync kuota_terisi via trigger
-- ============================================================
-- Bug: kuota_terisi tidak bertambah saat user selesai bayar.
-- Penyebab: webhook memanggil RPC increment_kuota_terisi yang
--   gagal/terlewat secara diam-diam.
-- Solusi: trigger database yang otomatis menyinkronkan
--   kuota_terisi setiap kali status registrasi berubah —
--   bekerja untuk semua jalur (webhook bayar, admin tolak, dll).
-- ============================================================

-- 1. Fungsi trigger: sinkron kuota_terisi saat status registrasi berubah
CREATE OR REPLACE FUNCTION public.sync_kuota_terisi()
RETURNS TRIGGER AS $$
DECLARE
  -- Slot dianggap "terpakai" jika status PAID atau APPROVED
  was_counted BOOLEAN := (OLD.status IN ('PAID', 'APPROVED'));
  is_counted  BOOLEAN := (NEW.status IN ('PAID', 'APPROVED'));
BEGIN
  IF is_counted AND NOT was_counted THEN
    -- Mulai terpakai (mis. PENDING_PAYMENT → PAID): tambah kuota
    UPDATE public.certification_programs
    SET kuota_terisi = kuota_terisi + 1
    WHERE id = NEW.program_id;
  ELSIF was_counted AND NOT is_counted THEN
    -- Slot dilepas (mis. PAID → REJECTED): kurangi kuota
    UPDATE public.certification_programs
    SET kuota_terisi = GREATEST(kuota_terisi - 1, 0)
    WHERE id = NEW.program_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger: jalan setiap kali status registrasi berubah
DROP TRIGGER IF EXISTS trigger_sync_kuota_terisi ON public.registrations;
CREATE TRIGGER trigger_sync_kuota_terisi
  AFTER UPDATE OF status ON public.registrations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_kuota_terisi();

-- 3. Recalculate kuota_terisi semua program berdasarkan data aktual
--    (memperbaiki angka yang sudah terlanjur salah)
UPDATE public.certification_programs cp
SET kuota_terisi = (
  SELECT COUNT(*)
  FROM public.registrations r
  WHERE r.program_id = cp.id
    AND r.status IN ('PAID', 'APPROVED')
);
