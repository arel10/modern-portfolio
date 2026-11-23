# Panduan Lengkap Deployment Portofolio ke Vercel

Panduan ini berisi seluruh langkah detail untuk mendeploy website modern portfolio ke **Vercel** dengan database cloud **Neon (PostgreSQL)**, penyimpanan gambar permanen **Vercel Blob**, domain pribadi **`chaarells.cloud`**, serta otomatisasi **CI/CD** melalui GitHub.

---

## Daftar Isi
1. [Memahami Arsitektur: Kenapa Butuh Database Cloud & Vercel Blob?](#1-memahami-arsitektur-kenapa-butuh-database-cloud--vercel-blob)
2. [Ringkasan Arsitektur & Alur CI/CD](#2-ringkasan-arsitektur--alur-cicd)
3. [Langkah 1: Setup Database PostgreSQL di Neon.tech](#langkah-1-setup-database-postgresql-di-neontech)
4. [Langkah 2: Seed Database Neon dari Laptop](#langkah-2-seed-database-neon-dari-laptop)
5. [Langkah 3: Push Kode ke GitHub (Fondasi CI/CD)](#langkah-3-push-kode-ke-github-fondasi-cicd)
6. [Langkah 4: Deploy Project di Vercel & Sambungkan Vercel Blob](#langkah-4-deploy-project-di-vercel--sambungkan-vercel-blob)
7. [Langkah 5: Konfigurasi Custom Domain `chaarells.cloud`](#langkah-5-konfigurasi-custom-domain-chaarellscloud)
8. [Langkah 6: Cara Update Fitur Production dengan CI/CD](#langkah-6-cara-update-fitur-production-dengan-cicd)
9. [Troubleshooting & Solusi Masalah Umum](#troubleshooting--solusi-masalah-umum)

---

## 1. Memahami Arsitektur: Kenapa Butuh Database Cloud & Vercel Blob?

Banyak developer pemula bertanya: *"Di laptop saya sudah ada PostgreSQL dan folder upload gambar, kenapa di Vercel harus pakai Neon dan Vercel Blob?"*

### A. Mengapa Butuh Neon (Database Cloud)?
* **Di Laptop**: Database Anda berada di `localhost:5432`. Alamat `localhost` ini hanya hidup di dalam komputer lokal Anda dan tidak bisa diakses dari internet luar.
* **Di Vercel**: Server Vercel berada di data center global (cloud). Agar Vercel bisa membaca dan menyimpan data (proyek, edukasi, pengalaman, login admin), kita butuh database yang juga online 24/7 di cloud. **Neon.tech** adalah PostgreSQL serverless cloud gratis dengan performa tinggi.

### B. Mengapa Butuh Vercel Blob (Penyimpanan Foto Cloud)?
* **Di Laptop**: Foto yang Anda upload dari dashboard admin disimpan ke folder fisik `public/uploads/` di harddisk laptop Anda. Harddisk laptop bersifat permanen.
* **Di Vercel (Serverless)**:
  1. Vercel tidak menggunakan server statis biasa, melainkan **Serverless Functions**. Serverless hanya berjalan saat ada orang yang membuka web.
  2. Sistem penyimpanan file di Vercel bersifat **Read-Only dan Ephemeral (Sementara)**.
  3. Setiap kali Anda melakukan update kode via Git (CI/CD), Vercel akan membuat instalasi baru yang bersih dari repository GitHub Anda.
  4. **Akibatnya**: Jika Anda upload foto sertifikat/jurnal langsung ke folder server Vercel, upload akan gagal (*read-only error*), atau foto tersebut akan **terhapus otomatis saat ada deployment update baru**.
* **Solusi Vercel Blob**:
  Vercel Blob adalah layanan penyimpanan file cloud (mirip Google Drive/AWS S3 resmi dari Vercel). Saat Anda upload foto di dashboard admin, foto dikirim ke Vercel Blob, lalu Vercel Blob memberikan link permanen (misal: `https://...public.blob.vercel-storage.com/foto.webp`). Link ini tersimpan aman di database Neon dan tidak akan pernah hilang selamanya.

---

## 2. Ringkasan Arsitektur & Alur CI/CD

```
+-----------------------------------------------------------------------------------+
|                                  ALUR KERJA CI/CD                                 |
+-----------------------------------------------------------------------------------+

 [ Laptop Anda ]
       |
       | (1) git push origin main
       v
 [ GitHub Repository ]
       |
       | (2) Otomatis memicu Webhook Deployment
       v
 [ Vercel CI/CD Pipeline ]
   ├── Menjalankan: npm run build
   ├── Membaca Environment Variables
   └── Menghubungkan:
         ├── Neon Database (Data Teks, Akun Admin, Relasi)
         └── Vercel Blob (Penyimpanan File Foto/Sertifikat)
       |
       | (3) Live dalam 1-2 Menit
       v
 [ https://chaarells.cloud ] (Otomatis Aktif SSL HTTPS)
```

---

## Langkah 1: Setup Database PostgreSQL di Neon.tech

1. Buka situs [https://neon.tech](https://neon.tech) dan klik **Sign Up** (Anda bisa login menggunakan akun GitHub).
2. Setelah masuk ke dashboard Neon:
   - Klik **Create Project**.
   - Berikan nama project, misalnya: `portfolio-prod`.
   - Pilih Region server terdekat: **Singapore (ap-southeast-1)** agar akses website sangat cepat dari Indonesia.
   - Klik **Create Project**.
3. Di halaman utama Dashboard Neon:
   - Anda akan melihat kotak **Connection Details**.
   - Pilih tab **Connection String**, pastikan opsi **Pooled connection** tercentang.
   - Salin connection string yang mirip seperti ini:
     ```text
     postgresql://chaarells_owner:AbCdEf123456@ep-cool-fog-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
   - **Simpan URL ini di catatan Anda**, ini adalah nilai `DATABASE_URL` Anda!

---

## Langkah 2: Seed Database Neon dari Laptop

Sebelum website di-deploy, database Neon Anda masih kosong. Kita perlu menjalankan skrip migrasi dan seed sekali saja dari laptop untuk membuat tabel dan mengisi data awal (profil, akun admin, tech stack, dll).

1. Buka file `.env` di VS Code laptop Anda.
2. Ubah sementara nilai `DATABASE_URL` dan `DATABASE_SSL` menjadi koneksi Neon:
   ```env
   DATABASE_URL=postgresql://chaarells_owner:AbCdEf123456@ep-cool-fog-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   DATABASE_SSL=true
   ```
3. Buka terminal (PowerShell / Command Prompt) di folder project:
   ```bash
   npm run db:seed
   ```
4. Jika muncul pesan sukses bahwa tabel dibuat dan data awal berhasil di-seed:
   - Database Neon Anda sekarang sudah terisi penuh data profil, sertifikat, pencapaian, project, dan akun admin!
5. Kembalikan file `.env` lokal Anda ke pengaturan semula (atau biarkan jika ingin laptop langsung tersinkron ke Neon).

---

## Langkah 3: Push Kode ke GitHub (Fondasi CI/CD)

Vercel membutuhkan repository Git untuk menjalankan otomatisasi CI/CD.

1. Buka [https://github.com](https://github.com) dan buat repository baru:
   - Nama repository: `modern-portfolio`
   - Visibilitas: **Private** (disarankan agar aman)
   - Jangan centang opsi "Initialize with README"
   - Klik **Create repository**.

2. Buka terminal di folder project Anda di laptop, lalu jalankan perintah berikut secara berurutan:
   ```bash
   # Cek status git
   git status

   # Tambahkan semua perubahan
   git add .

   # Buat commit pertama
   git commit -m "feat: complete portfolio with admin dashboard, achievements, and typography styling"

   # Ubah branch utama menjadi main
   git branch -M main

   # Hubungkan ke repository GitHub Anda (ganti URL di bawah dengan URL repo Anda)
   git remote add origin https://github.com/USERNAME_ANDA/modern-portfolio.git

   # Push kode ke GitHub
   git push -u origin main
   ```

---

## Langkah 4: Deploy Project di Vercel & Sambungkan Vercel Blob

1. Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun **GitHub** Anda.
2. Di Dashboard Vercel:
   - Klik tombol **Add New...** di kanan atas -> pilih **Project**.
   - Anda akan melihat daftar repository GitHub Anda. Cari `modern-portfolio`, lalu klik **Import**.
3. Di halaman **Configure Project**:
   - **Framework Preset**: Biarkan otomatis `Next.js`.
   - **Root Directory**: `./` (default).
   - Buka bagian accordion **Environment Variables**, masukkan variabel berikut:

     | Key / Nama Variabel | Value / Nilai | Catatan |
     | :--- | :--- | :--- |
     | `DATABASE_URL` | *Paste URL Neon Anda* | Contoh: `postgresql://...@...neon.tech/neondb?sslmode=require` |
     | `DATABASE_SSL` | `true` | Wajib `true` untuk koneksi cloud |
     | `ADMIN_JWT_SECRET` | *(Ketik string acak minimal 32 karakter)* | Contoh: `k4h89dh28734hksdjfhkasjdhfkjahsdff` |
     | `ADMIN_USERNAME` | `admin` | Username login admin |
     | `ADMIN_EMAIL` | `afchaarelpratama@gmail.com` | Email login admin |
     | `ADMIN_PASSWORD` | `afchaarel1006` | Password admin Anda |
     | `GEMINI_API_KEY` | *(API Key Google Gemini Anda)* | Diambil dari Google AI Studio |
     | `NEXT_PUBLIC_BASE_URL` | `https://chaarells.cloud` | Domain publik Anda |

4. Klik tombol **Deploy**.
   - Vercel akan otomatis melakukan cloning kode dari GitHub, menginstal dependencies, dan menjalankan `npm run build`.
   - Tunggu sekitar 1–2 menit sampai muncul animasi confetti dan status **Congratulations! Your project is deployed.**

### Mengaktifkan Vercel Blob (Untuk Upload Gambar):
1. Masuk ke project Anda di dashboard Vercel.
2. Klik tab **Storage** di menu atas.
3. Klik **Create Database / Storage** -> pilih **Blob** -> klik **Continue**.
4. Beri nama store, misalnya: `portfolio-blob-storage`.
5. Klik **Create Blob Store**.
6. Hubungkan ke project Anda (klik tombol **Connect to Project**).
7. Vercel akan otomatis menambahkan token `BLOB_READ_WRITE_TOKEN` ke Environment Variables project Anda tanpa perlu Anda salin manual!

---

## Langkah 5: Konfigurasi Custom Domain `chaarells.cloud`

Setelah website live di URL default Vercel (misal: `modern-portfolio-xxx.vercel.app`), sekarang kita hubungkan ke domain Anda: **`chaarells.cloud`**.

### 1. Tambahkan Domain di Vercel
1. Di dashboard Vercel project Anda, klik tab **Settings**.
2. Pilih menu **Domains** di bilah navigasi kiri.
3. Di input text domain, masukkan:
   - `chaarells.cloud` lalu klik **Add**.
   - Pilih rekomendasi redirect: `Redirect chaarells.cloud to www.chaarells.cloud` (atau sebaliknya sesuai preferensi Anda).
4. Vercel akan menampilkan status *DNS Configuration Required* beserta nilai DNS yang perlu Anda input.

### 2. Atur DNS di Registrar Domain Anda
Buka tempat Anda membeli domain `chaarells.cloud` (misalnya Niagahoster, Domainesia, Cloudflare, Namecheap, IDCloudHost, dll):
1. Masuk ke menu **DNS Management** atau **DNS Zone Editor**.
2. Tambahkan / sesuaikan 2 DNS Record berikut:

| Tipe (Type) | Nama Host / Subdomain | Target / Nilai (Value / Points to) | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (atau kosong) | `76.76.21.21` | Automatic / 3600 |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic / 3600 |

> [!NOTE]
> Jika Anda menggunakan Cloudflare untuk mengelola DNS, pastikan ikon Proxy Status diubah menjadi **DNS Only (ikon abu-abu)** saat verifikasi awal agar Vercel bisa menerbitkan sertifikat SSL dengan lancar.

### 3. Verifikasi & SSL Otomatis
- Tunggu proses propagasi DNS (biasanya 5 menit sampai maksimal beberapa jam).
- Di dashboard Vercel, status domain akan berubah menjadi checklist hijau: **Valid Configuration**.
- Sertifikat SSL (HTTPS) akan diterbitkan otomatis secara gratis oleh Vercel. Sekarang website Anda resmi live di **`https://chaarells.cloud`**!

---

## Langkah 6: Cara Update Fitur Production dengan CI/CD

Inilah keunggulan utama alur **CI/CD (Continuous Integration / Continuous Deployment)**: Anda tidak perlu lagi upload file manual lewat cPanel atau FTP setiap kali ingin mengubah fitur!

### Alur Update Harian (Sangat Mudah):
1. Anda membuka project di VS Code laptop dan mengedit kode (misal menambah fitur baru, merapikan teks, atau styling).
2. Setelah selesai coding di laptop dan dites via `npm run dev`:
   ```bash
   git add .
   git commit -m "Menambahkan fitur baru atau perbaikan tampilan"
   git push origin main
   ```
3. **Itu saja!** Begitu perintah `git push` selesai:
   - GitHub langsung mengirimkan sinyal ke Vercel.
   - Vercel langsung menjalankan proses build di cloud.
   - Dalam 1–2 menit, perubahan Anda otomatis langsung aktif di **`https://chaarells.cloud`** tanpa ada website *downtime*.

### Tips: Menggunakan Preview Deployment (Uji Coba Fitur Tanpa Takut Rusak)
Jika Anda ingin mencoba fitur eksperimental yang besar tanpa langsung mengubah website utama:
1. Buat branch baru di Git:
   ```bash
   git checkout -b fitur-eksperimen
   ```
2. Lakukan coding dan push:
   ```bash
   git add .
   git commit -m "Coba fitur baru"
   git push origin fitur-eksperimen
   ```
3. Vercel akan otomatis membuatkan **URL Preview khusus** (misalnya `modern-portfolio-git-fitur-eksperimen-chaarell.vercel.app`).
4. Anda bisa membuka URL tersebut di HP atau laptop untuk menguji. Website utama `chaarells.cloud` tetap aman tidak berubah.
5. Jika sudah puas dengan hasilnya, tinggal merge branch tersebut ke `main`:
   ```bash
   git checkout main
   git merge fitur-eksperimen
   git push origin main
   ```
   Website `chaarells.cloud` otomatis terupdate ke versi baru!

---

## Troubleshooting & Solusi Masalah Umum

### 1. Error Database: `password authentication failed` atau `connection timeout`
- **Penyebab**: Format `DATABASE_URL` salah atau parameter SSL belum aktif.
- **Solusi**: Pastikan di akhir connection string Neon ada `?sslmode=require` dan variabel `DATABASE_SSL=true` telah ditambahkan di Vercel Environment Variables.

### 2. Error Build: `Module not found` atau `Type error`
- **Solusi**: Selalu jalankan `npx tsc --noEmit` dan `npm run build` di terminal laptop Anda sebelum melakukan `git push`. Jika di lokal berhasil lulus, maka di Vercel dipastikan 100% lulus.

### 3. Domain Belum Aktif / Error SSL
- **Solusi**: Propagasi DNS di internet membutuhkan waktu. Tunggu 15–30 menit. Pastikan tidak ada duplikasi A Record lain di DNS domain Anda selain IP `76.76.21.21`.

### 4. Lupa Password Admin di Production
- **Solusi**: Buka dashboard Neon Anda di web, jalankan SQL query untuk reset password atau gunakan endpoint API setup dengan secret token admin.

---
*Dokumen ini dibuat otomatis sebagai panduan standar deployment modern-portfolio.*
