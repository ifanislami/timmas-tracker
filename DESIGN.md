# DESIGN.md — Timmas Tracker

> **Peringatan:** arah ini ditulis agent dari brief singkat (produk tracker internal, mood operasional/tajam). Arah yang dihasilkan agent cenderung mendekati rasa AI default. Anggap ini titik awal yang bisa kamu revisi, bukan brand final.

## Product
Timmas Tracker: tool kerja internal untuk mencatat aspirasi konstituen, performa multimedia, dan to-do/event. Dipakai di browser, data lokal, fokus kecepatan input dan baca status.

## Audience
Staf timmas / operator lapangan yang bekerja cepat di laptop atau HP, butuh kejelasan status lebih dari dekorasi.

## Personality
Operasional, tajam, rapi. Sedikit formal tanpa terasa birokratis. Hierarki visual tegas: apa yang harus dikerjakan hari ini menonjol lebih dulu daripada ornamen.

## Mood
Dashboard kerja harian: kontras cukup kuat, aksen tegas, sedikit ruang untuk dekorasi lembut.

## Palette
- Core 1: Navy `#0b1f3a` (struktur, header, aksi primer)
- Core 2: Surface putih / abu dingin `#ffffff` / `#eef2f7` (kanvas kerja)
- Accent: Emas `#c9a227` (penanda identitas Timmas, hemat pemakaian)
- Neutrals: slate untuk teks sekunder dan border
- Warna status/platform (hijau selesai, merah bahaya, warna brand IG/FB/X) hanya untuk semantik, bukan palet dekoratif

## Typography
- Sans sistem (`Segoe UI` / `system-ui`): cepat, familiar di Windows, cocok tool internal
- Judul panel tegas; label tabel sentence case (bukan uppercase + tracking lebar)
- Angka metrik lebih berat dari labelnya

## Icons
- Lucide untuk aksi data (edit, hapus, arsip, cari): familiar di tool internal, stroke konsisten
- Ikon brand platform (IG/FB/X) digambar inline, bukan Lucide generik

## Layout
- Shell satu kolom: header tools, tab utama, panel konten
- Konten mengikuti kebutuhan data (tabel aspirasi, kartu metrik, daftar to-do), bukan template landing
- Mobile: stack vertikal, tap target nyaman, tabel bisa scroll horizontal di dalam wrapper

## Motif identitas
Blok aksen emas tipis + navy padat (bukan glow/orb penuh halaman). Logo sementara: mark teks `TM` sampai ada aset resmi.

## Dials
Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

- ENERGY 2: tajam tapi tidak teatrikal
- RHYTHM 2: pola konsisten antar tab, dengan sedikit variasi (tabel vs kartu vs daftar)
- MOTION 1: hover/focus saja, tanpa scroll-reveal atau parallax

## Theme
Light default (lingkungan kerja kantor/lapangan siang hari). Dark mode opsional nanti jika diminta; jangan dipaksakan tanpa kebutuhan.

## Decision log (R-31)
- Warna navy: struktur & aksi primer, terasa instansi tanpa ungu/neon AI default
- Emas: aksen identitas hemat (rail header/main/modal), bukan glow penuh halaman
- Background flat: hindari radial orb (R-01); fokus ke konten kerja
- Shadow hanya di header + modal: elevation selektif (R-12)
- Radius 6/10/12: chip & kontrol kotak-bulat, bukan pill 999 di semua elemen (R-11)
- Tap 44px: target sentuh mobile (R-03)
- Focus emas `:focus-visible`: keyboard jelas tanpa outline:none mentah (R-32)
- Empty/error banner: state nyata untuk data lokal + import (R-27)
