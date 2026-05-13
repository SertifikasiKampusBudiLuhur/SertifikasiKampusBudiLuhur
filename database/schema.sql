-- ============================================================
-- SCHEMA: Sistem Registrasi Sertifikasi Kampus - Paket Basic
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nim          VARCHAR(20) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  program_studi VARCHAR(100) NOT NULL,
  angkatan     VARCHAR(4) NOT NULL,
  no_wa        VARCHAR(20),
  role         VARCHAR(10) NOT NULL DEFAULT 'mahasiswa' CHECK (role IN ('mahasiswa', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: certification_programs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certification_programs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama         VARCHAR(200) NOT NULL,
  deskripsi    TEXT,
  biaya        BIGINT NOT NULL DEFAULT 0,       -- dalam rupiah
  kuota        INT NOT NULL DEFAULT 30,
  kuota_terisi INT NOT NULL DEFAULT 0,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE,
  lokasi       VARCHAR(200),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  banner_url   TEXT,
  created_by   UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.registrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id      UUID NOT NULL REFERENCES public.certification_programs(id) ON DELETE CASCADE,
  jadwal_pilihan  VARCHAR(200),
  catatan         TEXT,                         -- catatan dari mahasiswa
  alasan_tolak    TEXT,                         -- alasan reject dari admin
  status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT','PENDING_PAYMENT','PAID','APPROVED','REJECTED')),
  verified_by     UUID REFERENCES public.profiles(id),
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, program_id)                   -- 1 mahasiswa 1x daftar per program
);

-- ============================================================
-- TABLE: transactions (Midtrans)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  order_id        VARCHAR(100) UNIQUE NOT NULL,  -- format: CERT-{reg_id}-{timestamp}
  snap_token      TEXT,
  snap_redirect_url TEXT,
  gross_amount    BIGINT NOT NULL,
  payment_type    VARCHAR(50),                   -- va_bank, qris, gopay, dll
  transaction_id  VARCHAR(100),                  -- dari Midtrans
  midtrans_status VARCHAR(50),                   -- settlement, pending, expire, cancel
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_registrations_user_id    ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_program_id ON public.registrations(program_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status     ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id    ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reg_id      ON public.transactions(registration_id);

-- ============================================================
-- FUNCTION: auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_programs_updated_at
  BEFORE UPDATE ON public.certification_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: handle new user (auto create profile from auth)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nim, nama_lengkap, program_studi, angkatan, no_wa, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nim', ''),
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', ''),
    COALESCE(NEW.raw_user_meta_data->>'program_studi', ''),
    COALESCE(NEW.raw_user_meta_data->>'angkatan', ''),
    NEW.raw_user_meta_data->>'no_wa',
    COALESCE(NEW.raw_user_meta_data->>'role', 'mahasiswa')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
