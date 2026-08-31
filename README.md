# SIWARGA05

**Sistem Informasi Warga RT 05**

SIWARGA05 adalah aplikasi berbasis web untuk membantu pengelolaan administrasi dan informasi lingkungan RT 05. Aplikasi ini memudahkan pengurus RT dan warga dalam mengakses informasi, mengelola data, serta transparansi keuangan lingkungan.

## Fitur

- **Berita** — Informasi dan pengumuman terkini seputar lingkungan RT
- **Iuran** — Pencatatan dan pemantauan iuran warga
- **Laporan** — Laporan kegiatan dan keuangan lingkungan
- **Data Rumah** — Manajemen data rumah/kepemilikan di RT 05
- **Data Warga** — Manajemen data kependudukan warga
- **Profile** — Pengaturan profil pengguna
- **Pengaturan** — Konfigurasi sistem

## Peran Pengguna

| Peran | Akses |
|---|---|
| **Warga** | Melihat berita, laporan, dan data pribadi |
| **Ketua RT** | Mengelola seluruh data dan approval |
| **Sekretaris** | Mengelola data warga, rumah, dan berita |
| **Bendahara** | Mengelola iuran dan laporan keuangan |

## Tech Stack

- **Backend**: Laravel
- **Frontend**: React + Inertia.js
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Instalasi

### Prasyarat
Pastikan sudah terinstall:
- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL / database sesuai konfigurasi

### Langkah Instalasi

1. **Clone repository**
```bash
   git clone https://github.com/Mhmdfahriy/Siwarga05.git
   cd Siwarga05
```

2. **Install dependency backend**
```bash
   composer install
```

3. **Install dependency frontend**
```bash
   npm install
```

4. **Setup environment**
```bash
   cp .env.example .env
   php artisan key:generate
```
   Lalu sesuaikan konfigurasi database di file `.env`.

5. **Migrasi database**
```bash
   php artisan migrate
```
   Tambahkan `--seed` jika ada data awal (seeder):
```bash
   php artisan migrate --seed
```

6. **Jalankan aplikasi**

   Buka 2 terminal secara terpisah:

   Terminal 1 — Laravel server:
```bash
   php artisan serve
```

   Terminal 2 — Vite dev server (frontend):
```bash
   npm run dev
```
