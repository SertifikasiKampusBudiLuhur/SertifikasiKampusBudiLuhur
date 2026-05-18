-- ============================================================
-- SEED DATA: Sistem Registrasi Sertifikasi Kampus UBL
-- Jalankan di Supabase SQL Editor setelah schema & migrations
-- ============================================================

-- Bersihkan data lama (opsional — hapus komentar jika perlu reset)
-- TRUNCATE public.transactions, public.registrations, public.certification_programs RESTART IDENTITY CASCADE;

-- ============================================================
-- CERTIFICATION PROGRAMS
-- ============================================================

INSERT INTO public.certification_programs (
  nama, deskripsi, biaya, kuota, kuota_terisi,
  tanggal_mulai, tanggal_selesai, lokasi, tipe_sesi, is_active, banner_url
) VALUES

-- 1. Microsoft Office Specialist
(
  'Sertifikasi Microsoft Office Specialist (MOS)',
  'Program sertifikasi resmi Microsoft Office Specialist mencakup Word, Excel, dan PowerPoint tingkat mahir. Peserta akan diuji kemampuan produktivitas dan pengolahan dokumen profesional sesuai standar industri internasional.',
  150000,
  35, 18,
  '2026-06-10', '2026-06-11',
  'Lab Komputer Gedung A Lt. 3, Universitas Budi Luhur',
  'offline', true,
  'https://images.unsplash.com/photo-1536148935331-408321065b18?auto=format&fit=crop&w=800&q=80'
),

-- 2. CCNA / Jaringan Komputer
(
  'Sertifikasi Jaringan Komputer – CCNA Prep',
  'Persiapan sertifikasi Cisco Certified Network Associate (CCNA) meliputi routing, switching, dasar keamanan jaringan, dan troubleshooting. Materi disampaikan oleh instruktur bersertifikat Cisco dengan praktik langsung menggunakan perangkat nyata.',
  500000,
  25, 10,
  '2026-07-05', '2026-07-07',
  'Lab Jaringan Gedung B Lt. 2, Universitas Budi Luhur',
  'offline', true,
  'https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&fit=crop&w=800&q=80'
),

-- 3. Python for Data Science
(
  'Python Programming for Data Science',
  'Pelajari Python dari dasar hingga analisis data menggunakan Pandas, NumPy, dan Matplotlib. Program mencakup manipulasi data, visualisasi, dan pengenalan machine learning. Cocok untuk mahasiswa Teknik Informatika dan Sistem Informasi yang ingin berkarir di bidang data.',
  300000,
  40, 27,
  '2026-06-20', '2026-06-21',
  'Online via Zoom (link dikirim H-1 pelaksanaan)',
  'online', true,
  'https://images.unsplash.com/photo-1753715613457-63127ec40824?auto=format&fit=crop&w=800&q=80'
),

-- 4. Komputer Akuntansi (Accurate)
(
  'Kompetensi Komputer Akuntansi – Accurate Online',
  'Sertifikasi kompetensi penggunaan software akuntansi Accurate Online untuk kebutuhan pembukuan dan laporan keuangan perusahaan. Materi meliputi setup perusahaan, jurnal, laporan neraca, dan rekonsiliasi bank. Wajib bagi mahasiswa Akuntansi.',
  250000,
  35, 35,
  '2026-05-24', '2026-05-24',
  'Lab Akuntansi Gedung C Lt. 1, Universitas Budi Luhur',
  'offline', true,
  'https://plus.unsplash.com/premium_photo-1679923813998-6603ee2466c5?auto=format&fit=crop&w=800&q=80'
),

-- 5. Web Development
(
  'Web Development Fundamentals (HTML, CSS & JavaScript)',
  'Program sertifikasi pengembangan web mencakup HTML5 semantik, CSS3 modern, dan JavaScript ES6+. Peserta akan membangun portofolio website responsif dan mendapatkan sertifikat kompetensi yang diakui industri. Tersedia mentoring 1-on-1 pasca sertifikasi.',
  200000,
  50, 31,
  '2026-07-19', '2026-07-20',
  'Online via Google Meet (link dikirim H-1 pelaksanaan)',
  'online', true,
  'https://plus.unsplash.com/premium_photo-1682130147350-c1f80c968967?auto=format&fit=crop&w=800&q=80'
),

-- 6. Digital Marketing
(
  'Digital Marketing Professional Certification',
  'Kuasai strategi pemasaran digital mencakup SEO, SEM, social media marketing, email marketing, dan Google Analytics. Program ini dirancang bersama praktisi industri dan memberikan sertifikat yang relevan untuk karir di era digital. Cocok untuk mahasiswa Ilmu Komunikasi dan Manajemen.',
  350000,
  30, 14,
  '2026-08-02', '2026-08-03',
  'Hybrid – Sesi teori online, praktik di Aula Gedung Rektorat',
  'hybrid', true,
  'https://plus.unsplash.com/premium_photo-1661425715124-310ec1b49b8a?auto=format&fit=crop&w=800&q=80'
),

-- 7. Cybersecurity
(
  'Cybersecurity Fundamentals & Ethical Hacking',
  'Pelajari konsep keamanan siber, vulnerability assessment, penetration testing dasar, dan incident response. Program ini mengikuti standar CompTIA Security+ dan cocok untuk mahasiswa yang ingin berkarir di bidang keamanan informasi. Menggunakan lab virtual Kali Linux.',
  450000,
  20, 9,
  '2026-08-22', '2026-08-24',
  'Lab Keamanan Siber Gedung B Lt. 3, Universitas Budi Luhur',
  'offline', true,
  'https://plus.unsplash.com/premium_photo-1661764393655-1dbffee8c0ce?auto=format&fit=crop&w=800&q=80'
),

-- 8. Data Analytics & Power BI
(
  'Data Analytics & Visualisasi dengan Power BI',
  'Kuasai analisis data bisnis menggunakan Microsoft Power BI untuk membuat dashboard interaktif dan laporan yang memukau. Materi mencakup DAX, data modeling, dan integrasi dengan Excel. Sertifikat diakui oleh mitra industri UBL untuk rekrutmen.',
  300000,
  40, 22,
  '2026-09-06', '2026-09-07',
  'Online via Zoom (rekaman tersedia 30 hari)',
  'online', true,
  'https://plus.unsplash.com/premium_photo-1681487767138-ddf2d67b35c1?auto=format&fit=crop&w=800&q=80'
),

-- 9. UI/UX Design
(
  'UI/UX Design Fundamentals – Figma & Design Thinking',
  'Pelajari proses desain produk digital dari riset pengguna, wireframing, prototyping, hingga usability testing menggunakan Figma. Program mencakup prinsip Design Thinking dan Human-Centered Design yang digunakan oleh perusahaan teknologi terkemuka.',
  350000,
  25, 7,
  '2026-09-20', '2026-09-21',
  'Hybrid – Lab Desain Gedung A & sesi online via Figma',
  'hybrid', true,
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80'
),

-- 10. AutoCAD
(
  'Sertifikasi AutoCAD 2D & 3D',
  'Program sertifikasi AutoCAD tingkat profesional mencakup gambar teknik 2D dan pemodelan 3D solid. Peserta akan mengerjakan proyek nyata berupa gambar arsitektur dan mekanikal. Sertifikat diakui oleh Autodesk Authorized Training Center.',
  400000,
  20, 5,
  '2026-10-04', '2026-10-05',
  'Lab CAD Gedung Teknik Lt. 2, Universitas Budi Luhur',
  'offline', true,
  'https://images.unsplash.com/photo-1503387837-b154d5074bd2?auto=format&fit=crop&w=800&q=80'
),

-- 11. Program sudah selesai (non-aktif) — untuk testing riwayat
(
  'Sertifikasi Komputer Dasar (ICDL)',
  'Program sertifikasi International Computer Driving Licence (ICDL) tingkat dasar mencakup penggunaan sistem operasi, pengolah kata, spreadsheet, dan internet. Sertifikat diakui secara internasional di lebih dari 100 negara.',
  100000,
  50, 50,
  '2026-03-15', '2026-03-15',
  'Lab Komputer Gedung A Lt. 1, Universitas Budi Luhur',
  'offline', false,
  'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=800&q=80'
),

-- 12. Program gratis — untuk testing edge case
(
  'Workshop Pengenalan AI & ChatGPT untuk Mahasiswa',
  'Workshop gratis pengenalan kecerdasan buatan dan pemanfaatan AI generatif (ChatGPT, Gemini, Copilot) untuk produktivitas akademik. Peserta akan belajar prompt engineering dasar, etika penggunaan AI, dan tools AI terbaik untuk mahasiswa.',
  0,
  100, 43,
  '2026-06-28', '2026-06-28',
  'Aula Utama Gedung Rektorat, Universitas Budi Luhur',
  'offline', true,
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80'
);


-- ============================================================
-- CARA MEMBUAT AKUN TEST (jalankan terpisah)
-- ============================================================
--
-- OPSI A — Via halaman /register di browser (paling mudah):
--   1. Buka /register, isi form dengan data berikut:
--
--   [MAHASISWA 1]
--   NIM           : 2021001001
--   Nama          : Budi Santoso
--   Program Studi : Teknik Informatika
--   Angkatan      : 2021
--   No WA         : 081234567890
--   Email         : mahasiswa1@test.com
--   Password      : password123
--
--   [MAHASISWA 2]
--   NIM           : 2022002002
--   Nama          : Siti Rahayu
--   Program Studi : Akuntansi
--   Angkatan      : 2022
--   No WA         : 082345678901
--   Email         : mahasiswa2@test.com
--   Password      : password123
--
--   [ADMIN]
--   NIM           : ADM001
--   Nama          : Administrator UBL
--   Program Studi : Staff Universitas
--   Angkatan      : 2020
--   Email         : admin@ubl.ac.id
--   Password      : admin123456
--
--   Kemudian jalankan SQL di bawah untuk set role admin:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE nim = 'ADM001';
--
--
-- OPSI B — Supabase Dashboard → Authentication → Users → "Add user"
--   Isi email & password, lalu update profiles.role = 'admin' via SQL.
--
-- ============================================================
