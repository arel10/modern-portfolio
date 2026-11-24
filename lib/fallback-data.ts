// ============================================================
// Fallback / default data (digunakan saat DB belum tersedia
// atau saat proses build statis)
// ============================================================

import type {
  ProfileRow,
  RoleRow,
  QuickStatRow,
  SocialRow,
  ExperienceRow,
  OrganizationRow,
  EducationRow,
  AchievementRow,
  CertificateRow,
  ProjectRow,
} from './db'

export const FALLBACK_PROFILE: ProfileRow = {
  id: 0,
  full_name: 'Afcha Arel Pratama',
  short_name: 'Afcha',
  bio: 'Fresh graduate Software Engineer dengan pengalaman nyata di fullstack development, product development, dan SaaS applications.',
  avatar_url: '/images/hero.jpg',
  cv_url: '/cv.pdf',
  place_of_birth: 'Bukittinggi, Indonesia',
  phone: '+62 389-614-0885',
  email: 'afchaarelpratama@gmail.com',
  gpa: '3.44',
  education: 'D4 Teknik Informatika — Politeknik Negeri Padang',
  location_name: 'Politeknik Negeri Padang',
  location_city: 'Padang, Indonesia',
  maps_embed_url:
    'https://maps.google.com/maps?q=-0.9492,100.3543&t=&z=14&ie=UTF8&iwloc=&output=embed',
  who_am_i:
    'Fresh Graduate Software Engineer dengan pengalaman praktis di fullstack development, pengembangan produk, dan SaaS applications. Ahli menerjemahkan kebutuhan bisnis menjadi fitur perangkat lunak yang fungsional.',
  my_approach:
    'Berkomitmen memberikan solusi teknologi yang efisien, mudah dipelihara, dan berorientasi pada pengguna dengan menerapkan best practices arsitektur perangkat lunak.',
}

export const FALLBACK_ROLES: RoleRow[] = [
  { id: 1, label: 'Software Developer', sort_order: 1 },
  { id: 2, label: 'Fullstack Developer', sort_order: 2 },
  { id: 3, label: 'Product Development', sort_order: 3 },
]

export const FALLBACK_QUICK_STATS: QuickStatRow[] = [
  { id: 1, label: 'Experience', value: '2+ Years', message: '2+ Years Experience' },
  { id: 2, label: 'Projects', value: '10+ Completed', message: '10+ Projects Completed' },
  { id: 3, label: 'Focus', value: 'Fullstack', message: 'Fullstack & Product Dev' },
]

export const FALLBACK_SOCIALS: SocialRow[] = [
  { id: 1, platform: 'github', url: 'https://github.com/afcha', username: 'afcha' },
  { id: 2, platform: 'linkedin', url: 'https://www.linkedin.com/in/afcha-arel-pratama-472721310/', username: 'Afcha Arel Pratama' },
  { id: 3, platform: 'instagram', url: 'https://instagram.com', username: '@afcha' },
  { id: 4, platform: 'tiktok', url: 'https://tiktok.com', username: '@afcha' },
  { id: 5, platform: 'whatsapp', url: 'https://wa.me/6238961408850', username: '+62 389-614-0885' },
  { id: 6, platform: 'email', url: 'afchaarelpratama@gmail.com', username: 'afchaarelpratama@gmail.com' },
]

export const FALLBACK_EXPERIENCES: ExperienceRow[] = [
  {
    id: 1,
    company: 'bossapp.id — Padang, Indonesia',
    role: 'Chief Product Officer & Fullstack Developer',
    date_range: 'June 2025 – Present',
    description:
      'Memimpin arah produk dan pengembangan platform SaaS POS modern untuk bisnis multi-outlet, bertanggung jawab atas strategi produk, desain alur pengguna, dan berkontribusi langsung dalam arsitektur & implementasi aplikasi.',
    skills: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Product Strategy'],
    sort_order: 1,
  },
  {
    id: 2,
    company: 'PT Trans Retail Indonesia — Padang, Indonesia',
    role: 'Fullstack Developer | Intern',
    date_range: 'October 2025 – December 2025',
    description:
      'Merancang dan mengembangkan sistem manajemen kehadiran untuk program magang perusahaan, mencakup frontend dan backend serta fitur monitoring absensi.',
    skills: ['React.js', 'Node.js', 'PostgreSQL', 'REST API'],
    sort_order: 2,
  },
  {
    id: 3,
    company: 'PT BPD Sumbar (Bank Nagari) — Padang, Indonesia',
    role: 'Fullstack Developer | Intern',
    date_range: 'August 2025 – October 2025',
    description:
      'Merancang dan membangun sistem manajemen proyek internal di tim IT Development untuk perencanaan, tracking, dan kolaborasi proyek sesuai kebutuhan operasional bisnis.',
    skills: ['React.js', 'Node.js', 'PostgreSQL', 'Project Management System'],
    sort_order: 3,
  },
  {
    id: 4,
    company: 'CV. Sri Indera Bupala Organizer — Padang, Indonesia',
    role: 'Frontend Developer | Part-Time',
    date_range: 'January 2024 – January 2025',
    description:
      'Mengembangkan sistem berbasis web untuk Dinas Kehutanan Provinsi Sumatera Barat, termasuk sistem manajemen kenaikan gaji dan sistem cuti/izin karyawan.',
    skills: ['React.js', 'JavaScript', 'REST API', 'Government System'],
    sort_order: 4,
  },
]

// Data organisasi dikelola sepenuhnya dari admin. Fallback kosong agar
// halaman publik tetap tampil rapi saat database belum berisi data.
export const FALLBACK_ORGANIZATIONS: OrganizationRow[] = []

export const FALLBACK_EDUCATIONS: EducationRow[] = [
  {
    id: 1,
    institution: 'Politeknik Negeri Padang',
    degree: 'Sarjana Terapan (D4)',
    field_of_study: 'Rekayasa Perangkat Lunak (Software Engineering)',
    date_range: '2021 – 2025',
    grade: 'IPK 3.44 / 4.00',
    description:
      'Fokus pada rekayasa perangkat lunak, arsitektur web modern, basis data relasional, dan pengembangan sistem berskala besar. Aktif dalam proyek penelitian dan pengembangan aplikasi SaaS.',
    image_url: '/images/hero.jpg',
    skills: ['Software Engineering', 'Fullstack Development', 'Database Design', 'SaaS Architecture', 'Algorithms & Data Structures'],
    sort_order: 1,
  },
]

export const FALLBACK_ACHIEVEMENTS: AchievementRow[] = [
  {
    id: 1,
    title: 'Publikasi Jurnal Ilmiah: Machine Learning untuk Prediksi Churn Nasabah Bank Sampah Digital',
    category: 'jurnal',
    issuer: 'Jurnal Teknologi Informasi & Ilmu Komputer (JTIIK)',
    date: 'Desember 2024',
    description:
      'Penelitian implementasi algoritma Random Forest Classifier dalam memprediksi customer churn rate pada platform bank sampah digital dengan tingkat akurasi mencapai 87.82%.',
    link_url: 'https://doi.org/10.25126/jtiik',
    image_url: '/images/portofolio.jpeg',
    skills: ['Machine Learning', 'Python', 'Random Forest', 'Data Science', 'Scikit-Learn'],
    sort_order: 1,
  },
  {
    id: 2,
    title: 'Juara 1 Hackathon Inovasi Digital Nasional — Smart Waste Management',
    category: 'prestasi',
    issuer: 'Kementerian Komunikasi dan Digital RI',
    date: 'November 2024',
    description:
      'Memimpin tim pengembangan solusi digital bank sampah berbasis IoT dan mobile app yang berhasil memenangkan peringkat pertama dari 150+ tim mahasiswa se-Indonesia.',
    link_url: '#',
    image_url: '/images/hero.jpg',
    skills: ['Product Design', 'Next.js', 'Flutter', 'IoT Integration', 'Presentation Pitch'],
    sort_order: 2,
  },
]

export const FALLBACK_CERTIFICATES: CertificateRow[] = [
  {
    id: 1,
    title: 'Associate Cloud Engineer Certification',
    issuer: 'Google Cloud',
    issue_date: 'November 2024',
    expiration_date: 'November 2027',
    credential_id: 'GCP-ACE-892410',
    credential_url: 'https://www.credential.net',
    image_url: '/images/portofolio.jpeg',
    skills: ['Google Cloud Platform', 'Kubernetes', 'Compute Engine', 'Cloud Architecture', 'IAM & Security'],
    sort_order: 1,
  },
  {
    id: 2,
    title: 'Menjadi Back-End Developer Expert',
    issuer: 'Dicoding Indonesia',
    issue_date: 'Agustus 2024',
    expiration_date: 'Tidak Ada Kadaluarsa',
    credential_id: 'DICODING-BACKEND-7731',
    credential_url: 'https://www.dicoding.com/certificates',
    image_url: '/images/jadibotwa.jpeg',
    skills: ['Node.js', 'PostgreSQL', 'Clean Architecture', 'RESTful API', 'Testing & CI/CD'],
    sort_order: 2,
  },
]

export const FALLBACK_PROJECTS: ProjectRow[] = [
  {
    id: 1,
    title: 'BossApp — SaaS POS Platform',
    short_description:
      'Platform Point of Sale berbasis SaaS untuk bisnis multi-outlet dengan manajemen terpusat untuk F&B dan Retail.',
    image_path: '/images/jadibotwa.jpeg',
    created_at_label: '2025-06-01',
    tech: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    features: ['Multi-outlet Management', 'Centralized Dashboard', 'Inventory & Sales Tracking', 'Role-based Access Control'],
    github_url: '#',
    live_demo_url: 'https://bossapp.id',
    is_private_repo: true,
    sort_order: 1,
  },
  {
    id: 2,
    title: 'Digital Waste Bank Platform',
    short_description:
      'Platform bank sampah digital berbasis Android dengan gamifikasi dan model prediksi churn (Random Forest, 87.82% accuracy).',
    image_path: '/images/portofolio.jpeg',
    created_at_label: '2026-01-01',
    tech: ['Flutter', 'Next.js', 'Flask', 'Python', 'PostgreSQL', 'Scikit-learn'],
    features: ['Android Mobile App', 'Admin Dashboard', 'Gamification', 'Churn Prediction ML', 'Waste Tracking'],
    github_url: 'https://github.com/afcha',
    live_demo_url: '#',
    is_private_repo: false,
    sort_order: 2,
  },
  {
    id: 3,
    title: 'Attendance Management System',
    short_description:
      'Sistem manajemen kehadiran terintegrasi untuk program magang PT Trans Retail Indonesia dengan monitoring real-time.',
    image_path: '',
    created_at_label: '2025-10-01',
    tech: ['React.js', 'Node.js', 'Express.js', 'PostgreSQL'],
    features: ['Real-time Attendance', 'Admin Dashboard', 'Intern Management', 'Report & Analytics'],
    github_url: '#',
    live_demo_url: '#',
    is_private_repo: true,
    sort_order: 3,
  },
  {
    id: 4,
    title: 'Internal Project Management System',
    short_description:
      'Sistem manajemen proyek internal untuk tim IT Development Bank Nagari (PT BPD Sumbar).',
    image_path: '',
    created_at_label: '2025-08-01',
    tech: ['React.js', 'Node.js', 'PostgreSQL'],
    features: ['Project Planning', 'Task Management', 'Team Collaboration', 'Progress Monitoring'],
    github_url: '#',
    live_demo_url: '#',
    is_private_repo: true,
    sort_order: 4,
  },
]
