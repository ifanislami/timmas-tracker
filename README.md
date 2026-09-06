# Timmas Tracker

Web tracker internal untuk mencatat aspirasi, performa multimedia, dan to-do/event.

## Fitur

### 1. Aspirasi
- Tabel: pihak pengaju (hyperlink WhatsApp), aspirasi, topik, tindak lanjut, checkbox arsip
- Topik bawaan: ASN, Guru, Pertanahan, Lain-lain (+ topik kustom)
- Filter aktif/arsip, pencarian, edit & hapus

### 2. Multimedia
- Dashboard IG / Facebook / X per minggu
- Ringkasan agregat per bulan (posts, reach, engagement, followers, eng. rate)
- Clipper monitoring: judul, clipper, platform, views, status, link

### 3. To-do
- Daftar pekerjaan (prioritas, status, deadline)
- Event besar (tanggal, lokasi, status)

Data disimpan di **localStorage** browser. Gunakan tombol **Export / Import** untuk backup JSON.

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
