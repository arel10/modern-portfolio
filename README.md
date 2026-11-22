# Modern Developer Portfolio

Website portofolio developer modern, interaktif, dan responsif yang dibangun menggunakan **Next.js (App Router)**, **TypeScript**, dan **Tailwind CSS**.

Website ini sudah dirancang dengan struktur data terpusat (statis) sehingga sangat mudah dihubungkan ke basis data (MySQL, PostgreSQL, MongoDB, SQLite) dan Content Management System (CMS) / Web Admin di masa mendatang.

---

## 🚀 Fitur Utama

- **Modern & Responsive UI**: Tampilan minimalis dan profesional dengan animasi halus dari Framer Motion.
- **Data Terpusat**: Seluruh konten (profil, pengalaman, proyek, kontak, skills) diatur secara terpusat di `lib/portfolio-data.ts`.
- **AI Chatbot Assistant**: Dilengkapi dengan asisten chatbot AI berbasis streaming (OpenAI / OpenRouter) yang otomatis menyerap informasi dari profil portofolio.
- **Chat History SQLite**: Riwayat chat tersimpan secara lokal dan otomatis menggunakan SQLite database.
- **Form Kontak & Email**: Mendukung pengiriman pesan email via Nodemailer.
- **Dark / Light Mode**: Mendukung peralihan tema terang dan gelap dengan mulus.
- **SEO Ready**: Pengaturan metadata lengkap, OpenGraph, sitemap, dan robots.txt.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database (Chat)**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **AI Integration**: [OpenAI SDK](https://github.com/openai/openai-node)

---

## ⚙️ Konfigurasi Environment (`.env`)

Buat file `.env` di root direktori project (atau salin dari `.env.example`):

```bash
cp .env.example .env
```

Isi variabel environment sesuai kebutuhan:

```env
# URL & Info Website
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_TITLE="Modern Developer Portfolio"
NEXT_PUBLIC_GITHUB_URL=https://github.com

# Konfigurasi AI Chatbot (Opsional jika ingin mengaktifkan chatbot)
ROUTER_APIKEY=your_openrouter_or_openai_api_key
ROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=gpt-4o-mini

# Konfigurasi Email Nodemailer (Opsional untuk fitur kirim pesan)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Konfigurasi Database (Untuk pengembangan Web Admin & Database ke depan)
DATABASE_URL="file:./data/chat.db"
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio_db
```

---

## 💻 Memulai Pengembangan

1. **Install dependensi**:
   ```bash
   npm install
   # atau yarn / pnpm install
   ```

2. **Jalankan development server**:
   ```bash
   npm run dev
   ```

3. Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 📁 Struktur Konten & Persiapan Web Admin

Seluruh konten website saat ini berada di:
👉 `lib/portfolio-data.ts`

Objek data yang tersedia:
- `profileData`: Informasi nama, peran, bio, avatar, kontak, dan link sosial media.
- `quickStatsList`: Angka statistik ringkas pada bagian Hero.
- `experiencesData`: Daftar riwayat pekerjaan dan organisasi.
- `projectsData`: Daftar portofolio karya/proyek beserta tag teknologi, link demo, dan repository.
- `techCategories`: Kategori teknologi dan keahlian.

### Rencana Integrasi Database & Web Admin:
1. Skema database (tabel `profiles`, `experiences`, `projects`, `skills`) dapat langsung dipetakan dari interface TypeScript di `lib/portfolio-data.ts`.
2. Saat web admin dibuat, data dari form admin cukup di-*upsert* ke database.
3. Halaman frontend tinggal mengambil data melalui fetch/API/Server Actions dari database dengan fallback ke data statis.

---

## 📄 Lisensi

Open-source di bawah lisensi [MIT](LICENSE).
