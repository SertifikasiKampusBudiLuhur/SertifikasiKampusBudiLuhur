-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: get current user role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES policies
-- ============================================================
-- Mahasiswa: lihat & edit profil sendiri
CREATE POLICY "profiles_select_own"    ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own"    ON public.profiles FOR UPDATE USING (id = auth.uid());
-- Admin: lihat semua profil
CREATE POLICY "profiles_select_admin"  ON public.profiles FOR SELECT USING (get_my_role() = 'admin');

-- ============================================================
-- CERTIFICATION PROGRAMS policies
-- ============================================================
-- Semua authenticated user: lihat program aktif
CREATE POLICY "programs_select_active" ON public.certification_programs
  FOR SELECT USING (is_active = TRUE OR get_my_role() = 'admin');
-- Admin only: insert, update, delete
CREATE POLICY "programs_insert_admin"  ON public.certification_programs FOR INSERT WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "programs_update_admin"  ON public.certification_programs FOR UPDATE USING (get_my_role() = 'admin');
CREATE POLICY "programs_delete_admin"  ON public.certification_programs FOR DELETE USING (get_my_role() = 'admin');

-- ============================================================
-- REGISTRATIONS policies
-- ============================================================
-- Mahasiswa: lihat & insert pendaftaran sendiri
CREATE POLICY "registrations_select_own"    ON public.registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "registrations_insert_own"    ON public.registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "registrations_update_own"    ON public.registrations
  FOR UPDATE USING (user_id = auth.uid() AND status = 'DRAFT');
-- Admin: lihat & update semua
CREATE POLICY "registrations_select_admin"  ON public.registrations FOR SELECT USING (get_my_role() = 'admin');
CREATE POLICY "registrations_update_admin"  ON public.registrations FOR UPDATE USING (get_my_role() = 'admin');

-- ============================================================
-- TRANSACTIONS policies
-- ============================================================
-- Mahasiswa: lihat transaksi milik sendiri
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (
    registration_id IN (SELECT id FROM public.registrations WHERE user_id = auth.uid())
  );
CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT WITH CHECK (
    registration_id IN (SELECT id FROM public.registrations WHERE user_id = auth.uid())
  );
-- Admin: lihat semua
CREATE POLICY "transactions_select_admin" ON public.transactions FOR SELECT USING (get_my_role() = 'admin');
-- Service role (webhook): update transaksi (bypass RLS via service key)
