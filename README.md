# Timmas Tracker

Web tracker internal untuk mencatat aspirasi, performa multimedia, dan to-do/event.

## Fitur

### 1. Aspirasi (Supabase)
- Kartu laporan: nama, organisasi, topik, waktu, aspirasi, tindak lanjut
- Aksi: Edit, Selesai, Hapus
- Topik bawaan: ASN, Guru, Pertanahan, Lain-lain (+ topik kustom lokal)
- Data disimpan di **Supabase** (sinkron antar perangkat/browser)

### 2. Multimedia
- Dashboard IG / Facebook / X per minggu
- Ringkasan agregat per bulan (posts, reach, engagement, followers, eng. rate)
- Clipper monitoring: judul, clipper, platform, views, status, link
- Masih di **localStorage** browser

### 3. To-do
- Daftar pekerjaan (prioritas, status, deadline)
- Event besar (tanggal, lokasi, status)
- Masih di **localStorage** browser

## Setup Supabase (wajib untuk Aspirasi)

### 1. Ambil URL + anon key
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Timmas
3. **Project Settings → API**
4. Salin **Project URL** dan **anon public** key

### 2. Buat tabel
1. Di dashboard: **SQL Editor → New query**
2. Paste isi file `supabase/aspirasi.sql`
3. Klik **Run**

### 3. Isi environment lokal
```bash
copy .env.example .env.local
```
Edit `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 4. Isi environment Vercel (produksi)
Di Vercel project → **Settings → Environment Variables**, tambahkan nama yang sama:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Lalu **Redeploy**.

## Menjalankan

```bash
cd timmas-tracker
npm install
npm run dev
```

Buka URL yang muncul di terminal (biasanya `http://localhost:5173`).

## Build produksi

```bash
npm run build
npm run preview
```
