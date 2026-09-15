-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run
-- Tabel penyimpanan aspirasi Timmas Tracker

create extension if not exists "pgcrypto";

create table if not exists public.aspirasi (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  nama text not null,
  organisasi text not null default '',
  wa text not null default '',
  aspirasi text not null,
  topik text not null,
  tindak_lanjut text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aspirasi_tanggal_idx on public.aspirasi (tanggal desc);
create index if not exists aspirasi_archived_idx on public.aspirasi (archived);

alter table public.aspirasi enable row level security;

-- Tool internal tanpa login: anon boleh CRUD.
-- Ganti kebijakan ini jika nanti ada autentikasi anggota.
drop policy if exists "aspirasi_anon_all" on public.aspirasi;
create policy "aspirasi_anon_all"
  on public.aspirasi
  for all
  to anon, authenticated
  using (true)
  with check (true);
