-- ============================================================
-- PORTFOLIO DATABASE SCHEMA (PostgreSQL)
-- Untuk: Afcha Arel Pratama - Portfolio & Admin Panel
-- ============================================================

-- ============================================================
-- TABLE: profile
-- Data utama profil pemilik portfolio
-- ============================================================
CREATE TABLE IF NOT EXISTS profile (
  id              SERIAL PRIMARY KEY,
  full_name       VARCHAR(150)   NOT NULL,
  short_name      VARCHAR(50)    NOT NULL,
  bio             TEXT           NOT NULL,
  avatar_url      VARCHAR(500)   NOT NULL DEFAULT '/images/hero.jpg',
  cv_url          VARCHAR(500)   NOT NULL DEFAULT '/cv.pdf',
  place_of_birth  VARCHAR(100),
  phone           VARCHAR(30),
  email           VARCHAR(150),
  gpa             VARCHAR(10),
  education       VARCHAR(200),

  -- Lokasi untuk peta kontak
  location_name   VARCHAR(200),
  location_city   VARCHAR(100),
  maps_embed_url  TEXT,

  -- Bagian About
  who_am_i        TEXT,
  my_approach     TEXT,

  -- Meta (hanya satu row yang aktif)
  is_active       BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: roles
-- Roles / jabatan yang muncul di typewriter Hero section
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id         SERIAL PRIMARY KEY,
  label      VARCHAR(100) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLE: quick_stats
-- Badge statistik kecil di bagian Hero
-- ============================================================
CREATE TABLE IF NOT EXISTS quick_stats (
  id         SERIAL PRIMARY KEY,
  label      VARCHAR(100) NOT NULL,
  value      VARCHAR(100) NOT NULL,
  message    VARCHAR(200) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLE: socials
-- Link media sosial
-- ============================================================
CREATE TABLE IF NOT EXISTS socials (
  id         SERIAL PRIMARY KEY,
  platform   VARCHAR(50)  NOT NULL UNIQUE,  -- 'github', 'linkedin', 'instagram', etc.
  url        VARCHAR(500) NOT NULL,
  username   VARCHAR(150),                  -- label tampilan (opsional)
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLE: experiences
-- Riwayat pekerjaan / pengalaman
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
  id          SERIAL PRIMARY KEY,
  company     VARCHAR(200) NOT NULL,
  role        VARCHAR(200) NOT NULL,
  date_range  VARCHAR(100) NOT NULL,         -- "Jan 2024 – Present"
  description TEXT         NOT NULL,
  skills      TEXT[]       NOT NULL DEFAULT '{}',
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: organizations
-- Pengalaman organisasi, komunitas, dan kepanitiaan
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  role        VARCHAR(200) NOT NULL,
  date_range  VARCHAR(100) NOT NULL,
  description TEXT         NOT NULL DEFAULT '',
  image_url   VARCHAR(500) NOT NULL DEFAULT '',   -- foto sampul
  images      TEXT[]       NOT NULL DEFAULT '{}', -- foto tambahan
  skills      TEXT[]       NOT NULL DEFAULT '{}',
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: educations
-- Riwayat pendidikan & almamater
-- ============================================================
CREATE TABLE IF NOT EXISTS educations (
  id              SERIAL PRIMARY KEY,
  institution     VARCHAR(200) NOT NULL,
  degree          VARCHAR(200) NOT NULL,
  field_of_study  VARCHAR(200),
  date_range      VARCHAR(100) NOT NULL,
  grade           VARCHAR(50),
  description     TEXT,
  image_url       VARCHAR(500),
  skills          TEXT[]       NOT NULL DEFAULT '{}',
  sort_order      INT          NOT NULL DEFAULT 0,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: achievements
-- Pencapaian, publikasi jurnal ilmiah, kompetisi, dan penghargaan
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(250) NOT NULL,
  category    VARCHAR(50)  NOT NULL DEFAULT 'prestasi', -- 'jurnal', 'prestasi', 'penghargaan', 'lainnya'
  issuer      VARCHAR(200) NOT NULL,
  date        VARCHAR(100) NOT NULL,
  description TEXT,
  link_url    VARCHAR(500),
  image_url   VARCHAR(500),
  skills      TEXT[]       NOT NULL DEFAULT '{}',
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: certificates
-- Sertifikasi profesional, lisensi, dan kredensial
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(250) NOT NULL,
  issuer          VARCHAR(200) NOT NULL,
  issue_date      VARCHAR(100) NOT NULL,
  expiration_date VARCHAR(100),
  credential_id   VARCHAR(150),
  credential_url  VARCHAR(500),
  image_url       VARCHAR(500),
  skills          TEXT[]       NOT NULL DEFAULT '{}',
  sort_order      INT          NOT NULL DEFAULT 0,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: projects
-- Portofolio karya / proyek
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(200)  NOT NULL,
  short_description TEXT          NOT NULL,
  full_description  TEXT,
  image_path        VARCHAR(500)  NOT NULL DEFAULT '/images/portofolio.jpeg',
  images            TEXT[]        NOT NULL DEFAULT '{}',  -- galeri foto tambahan (sampul tetap image_path)
  created_at_label  VARCHAR(50),                         -- "2025-05-10"
  tech              TEXT[]        NOT NULL DEFAULT '{}',
  features          TEXT[]        NOT NULL DEFAULT '{}',
  github_url        VARCHAR(500)  NOT NULL DEFAULT '#',
  live_demo_url     VARCHAR(500)  NOT NULL DEFAULT '#',
  is_private_repo   BOOLEAN       NOT NULL DEFAULT FALSE,
  sort_order        INT           NOT NULL DEFAULT 0,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: tech_categories
-- Kategori teknologi (Frontend, Backend, dsb.)
-- ============================================================
CREATE TABLE IF NOT EXISTS tech_categories (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(100) NOT NULL,
  description TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLE: tech_items
-- Item teknologi per kategori
-- ============================================================
CREATE TABLE IF NOT EXISTS tech_items (
  id          SERIAL PRIMARY KEY,
  category_id INT          NOT NULL REFERENCES tech_categories(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  svg_path    VARCHAR(500) NOT NULL DEFAULT '',
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLE: chat_sessions & chat_messages
-- Riwayat AI chatbot (ganti SQLite)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         TEXT         PRIMARY KEY,
  session_id UUID         NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender     VARCHAR(10)  NOT NULL CHECK (sender IN ('user', 'bot')),
  text       TEXT         NOT NULL,
  created_at BIGINT       NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at ASC);

-- ============================================================
-- TABLE: contact_messages
-- Pesan masuk dari form kontak (opsional)
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  message    TEXT         NOT NULL,
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: page_views
-- Analytics pengunjung website (anonim)
-- Dibuat otomatis juga oleh lib/analytics.ts saat request pertama,
-- jadi database production tidak perlu dimigrasi manual.
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id          BIGSERIAL PRIMARY KEY,
  visitor_id  VARCHAR(64)  NOT NULL,
  path        VARCHAR(500) NOT NULL,
  referrer    VARCHAR(500),
  source      VARCHAR(80)  NOT NULL DEFAULT 'Direct',
  user_agent  TEXT,
  ip_hash     VARCHAR(64),
  country     VARCHAR(10),
  region      VARCHAR(120),
  city        VARCHAR(120),
  device      VARCHAR(20)  NOT NULL DEFAULT 'Desktop',
  browser     VARCHAR(50)  NOT NULL DEFAULT 'Unknown',
  os          VARCHAR(50)  NOT NULL DEFAULT 'Unknown',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at
  ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor
  ON page_views (visitor_id, created_at DESC);

-- ============================================================
-- TABLE: admin_users
-- User untuk web admin (bcrypt password)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profile_updated_at
  BEFORE UPDATE ON profile FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_experiences_updated_at
  BEFORE UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEED DATA: Afcha Arel Pratama
-- ============================================================

-- Profile
INSERT INTO profile (
  full_name, short_name, bio,
  avatar_url, cv_url,
  place_of_birth, phone, email, gpa, education,
  location_name, location_city, maps_embed_url,
  who_am_i, my_approach
) VALUES (
  'Afcha Arel Pratama',
  'Afcha',
  'Fresh graduate Software Engineer dengan pengalaman nyata di fullstack development, product development, dan SaaS applications. Saya senang menerjemahkan kebutuhan bisnis menjadi solusi software yang fungsional dan berdampak.',

  '/images/hero.jpg',
  '/cv.pdf',

  'Bukittinggi, Indonesia',
  '+6238961408850',
  'afchaarelpratama@gmail.com',
  '3.44',
  'D4 Software Engineer — Politeknik Negeri Padang (2022–2026)',

  'Politeknik Negeri Padang',
  'Padang, Indonesia',
  'https://maps.google.com/maps?q=-0.9492,100.3543&t=&z=14&ie=UTF8&iwloc=&output=embed',

  'Saya adalah Fresh Graduate Software Engineer dengan pengalaman praktis di fullstack development, pengembangan produk, dan SaaS applications. Ahli dalam menerjemahkan kebutuhan bisnis menjadi fitur perangkat lunak fungsional, mengembangkan sistem frontend dan backend, serta merancang alur kerja aplikasi.',

  'Saya berkomitmen untuk memberikan solusi teknologi yang efisien, mudah dipelihara, dan berorientasi pada pengguna — dengan menerapkan best practices arsitektur perangkat lunak dan terus belajar teknologi baru.'
);

-- Roles (typewriter)
INSERT INTO roles (label, sort_order) VALUES
  ('Software Developer',   1),
  ('Fullstack Developer',  2),
  ('Product Development',  3);

-- Quick Stats
INSERT INTO quick_stats (label, value, message, sort_order) VALUES
  ('Experience', '2+ Years',       '2+ Years Experience',     1),
  ('Projects',   '10+ Completed',  '10+ Projects Completed',  2),
  ('Focus',      'Fullstack',      'Fullstack & Product Dev',  3);

-- Socials
INSERT INTO socials (platform, url, username, sort_order) VALUES
  ('github',    'https://github.com/afcha',                                              'afcha',                1),
  ('linkedin',  'https://www.linkedin.com/in/afcha-arel-pratama-472721310/',             'Afcha Arel Pratama',   2),
  ('instagram', 'https://instagram.com',                                                 '@afcha',               3),
  ('tiktok',    'https://tiktok.com',                                                    '@afcha',               4),
  ('whatsapp',  'https://wa.me/6238961408850',                                           '+62 389-614-0885',     5),
  ('email',     'afchaarelpratama@gmail.com',                                            'afchaarelpratama@gmail.com', 6);

-- Experiences
INSERT INTO experiences (company, role, date_range, description, skills, sort_order) VALUES
(
  'bossapp.id — Padang, Indonesia',
  'Chief Product Officer & Fullstack Developer',
  'June 2025 – Present',
  'Memimpin arah produk dan pengembangan platform SaaS Point of Sale (POS) modern untuk bisnis multi-outlet. Platform memungkinkan manajemen outlet terpusat untuk berbagai industri (F&B, Retail). Bertanggung jawab atas strategi produk, penerjemahan kebutuhan bisnis ke fitur, desain alur pengguna, dan pengawasan siklus pengembangan produk penuh, sekaligus berkontribusi langsung dalam arsitektur dan implementasi aplikasi.',
  ARRAY['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Product Strategy', 'SaaS Architecture'],
  1
),
(
  'PT Trans Retail Indonesia — Padang, Indonesia',
  'Fullstack Developer | Intern',
  'October 2025 – December 2025',
  'Merancang dan mengembangkan sistem manajemen kehadiran untuk program magang perusahaan. Mengembangkan komponen frontend dan backend untuk mendukung alur absensi, fitur monitoring, dan manajemen kehadiran peserta magang.',
  ARRAY['React.js', 'Node.js', 'PostgreSQL', 'REST API'],
  2
),
(
  'PT BPD Sumbar (Bank Nagari) — Padang, Indonesia',
  'Fullstack Developer | Intern',
  'August 2025 – October 2025',
  'Bekerja dalam tim IT Development untuk merancang dan membangun sistem manajemen proyek internal. Mengembangkan komponen frontend dan backend untuk perencanaan, tracking, dan manajemen proyek sesuai kebutuhan operasional bisnis internal.',
  ARRAY['React.js', 'Node.js', 'PostgreSQL', 'Project Management System'],
  3
),
(
  'CV. Sri Indera Bupala Organizer — Padang, Indonesia',
  'Frontend Developer | Part-Time',
  'January 2024 – January 2025',
  'Mengembangkan dan memelihara sistem berbasis web internal untuk Dinas Kehutanan Provinsi Sumatera Barat. Membangun sistem manajemen kenaikan gaji berkala dan sistem manajemen cuti/izin karyawan untuk mendukung administrasi kepegawaian.',
  ARRAY['React.js', 'JavaScript', 'REST API', 'Government System'],
  4
);

-- Educations
INSERT INTO educations (institution, degree, field_of_study, date_range, grade, description, image_url, skills, sort_order) VALUES
(
  'Politeknik Negeri Padang',
  'Sarjana Terapan (D4)',
  'Rekayasa Perangkat Lunak (Software Engineering)',
  '2021 – 2025',
  'IPK 3.44 / 4.00',
  'Fokus pada rekayasa perangkat lunak, arsitektur web modern, basis data relasional, dan pengembangan sistem berskala besar. Aktif dalam proyek penelitian dan pengembangan aplikasi SaaS.',
  '/images/hero.jpg',
  ARRAY['Software Engineering', 'Fullstack Development', 'Database Design', 'SaaS Architecture', 'Algorithms & Data Structures'],
  1
);

-- Projects
INSERT INTO projects (title, short_description, image_path, created_at_label, tech, features, github_url, live_demo_url, is_private_repo, sort_order) VALUES
(
  'BossApp — SaaS POS Platform',
  'Platform Point of Sale berbasis SaaS untuk bisnis multi-outlet. Memungkinkan manajemen outlet terpusat untuk F&B dan Retail dalam satu akun.',
  '/images/jadibotwa.jpeg',
  '2025-06-01',
  ARRAY['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'SaaS'],
  ARRAY['Multi-outlet Management', 'Centralized Dashboard', 'Inventory & Sales Tracking', 'Role-based Access Control'],
  '#',
  'https://bossapp.id',
  TRUE,
  1
),
(
  'Digital Waste Bank Platform',
  'Platform bank sampah digital berbasis Android untuk Dinas Lingkungan Hidup Kota Padang, dilengkapi gamifikasi dan model prediksi churn pelanggan berbasis Machine Learning.',
  '/images/portofolio.jpeg',
  '2026-01-01',
  ARRAY['Flutter', 'Dart', 'Next.js', 'Flask', 'Python', 'PostgreSQL', 'Scikit-learn', 'Random Forest'],
  ARRAY['Android Mobile App (Flutter)', 'Admin Dashboard (Next.js)', 'Gamification (Points, Badges, Leaderboard)', 'Churn Prediction (87.82% accuracy)', 'Waste Deposit Tracking'],
  'https://github.com/afcha',
  '#',
  FALSE,
  2
),
(
  'Attendance Management System',
  'Sistem manajemen kehadiran terintegrasi untuk program magang PT Trans Retail Indonesia, dengan fitur monitoring dan laporan absensi real-time.',
  '',
  '2025-10-01',
  ARRAY['React.js', 'Node.js', 'Express.js', 'PostgreSQL', 'REST API'],
  ARRAY['Real-time Attendance Tracking', 'Admin Dashboard', 'Intern Management', 'Report & Analytics'],
  '#',
  '#',
  TRUE,
  3
),
(
  'Internal Project Management System',
  'Sistem manajemen proyek internal untuk tim IT Development Bank Nagari, mendukung perencanaan, tracking, dan kolaborasi proyek sesuai proses bisnis internal.',
  '',
  '2025-08-01',
  ARRAY['React.js', 'Node.js', 'PostgreSQL', 'REST API', 'Project Management'],
  ARRAY['Project Planning & Tracking', 'Task Management', 'Team Collaboration', 'Progress Monitoring'],
  '#',
  '#',
  TRUE,
  4
);

-- Tech Categories & Items
INSERT INTO tech_categories (title, description, sort_order) VALUES
  ('Frontend',              'Framework dan library untuk membangun antarmuka pengguna yang interaktif dan responsif.',  1),
  ('Backend & Frameworks',  'Teknologi server-side, framework REST API, dan mobile development.',                       2),
  ('Databases',             'Sistem basis data relasional untuk penyimpanan dan manajemen data.',                       3),
  ('Tools & Infrastructure','Alat pengembangan, version control, deployment, dan sistem analisis.',                     4);

-- Frontend techs
INSERT INTO tech_items (category_id, name, svg_path, sort_order) VALUES
  (1, 'React.js',    './icons/react.svg',       1),
  (1, 'Next.js',     './icons/nextjs.svg',       2),
  (1, 'Vue.js',      './icons/react.svg',        3),  -- placeholder
  (1, 'Flutter',     './icons/react.svg',        4),  -- placeholder
  (1, 'Tailwind CSS','./icons/tailwindcss.svg',  5),
  (1, 'TypeScript',  './icons/typescript.svg',   6);

-- Backend techs
INSERT INTO tech_items (category_id, name, svg_path, sort_order) VALUES
  (2, 'Node.js',     './icons/nodejs.svg',   1),
  (2, 'Express.js',  './icons/express.svg',  2),
  (2, 'Laravel',     './icons/laravel.svg',  3),
  (2, 'Flask',       './icons/react.svg',    4),  -- placeholder
  (2, 'Go (Golang)', './icons/go.svg',       5);

-- Database techs
INSERT INTO tech_items (category_id, name, svg_path, sort_order) VALUES
  (3, 'PostgreSQL',  './icons/postgresql.svg', 1),
  (3, 'MySQL',       './icons/mysql.svg',      2),
  (3, 'Prisma ORM',  './icons/prisma.svg',     3);

-- Tools
INSERT INTO tech_items (category_id, name, svg_path, sort_order) VALUES
  (4, 'Git',         './icons/git.svg',      1),
  (4, 'GitHub',      './icons/github.svg',   2),
  (4, 'Docker',      './icons/docker.svg',   3),
  (4, 'Linux',       './icons/linux.svg',    4),
  (4, 'Postman',     './icons/postman.svg',  5);
