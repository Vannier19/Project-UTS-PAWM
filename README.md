# Laboratorium Fisika Virtual

Dibuat Oleh:
Stevan Einer Bonagabe / 18223028

## Cara Menjalankan

### 1. Setup File Environment (PENTING!)

Buat file `.env` di folder `Back_End/` (kuncinya ada di laporan)

Buat file `serviceAccountKey.json.json` di folder `Back_End/` (kuncinya ada di laporan)


### 2. Install Dependencies
```bash
cd Back_End
npm install
```

### 3. Jalankan Server Backend
```bash
cd Back_End
node server.js
```

Server akan berjalan di: `http://localhost:3001`

## Struktur Proyek

```
Back_End/
├── server.js              # File server utama
├── package.json           # Dependencies
├── .env                   # Kunci rahasia JWT (TIDAK di Git - buat manual)
└── serviceAccountKey.json.json  # Kredensial Firebase (TIDAK di Git - buat manual)

Front_End/
├── login.html             # Halaman Login/Register
├── index.html             # Aplikasi utama (butuh autentikasi)
├── css/                   # File stylesheet
│   ├── auth.css
│   ├── main.css
│   ├── sidebar.css
│   ├── content.css
│   ├── lab.css
│   ├── kuis.css
│   ├── materi-enhancement.css
│   └── dark-mode-fix.css
├── js/                    # File JavaScript
│   ├── auth.js            # Logika autentikasi
│   ├── main.js            # Logika aplikasi utama
│   ├── theme.js           # Dark/Light mode
│   ├── materi.js          # Modul materi
│   ├── lab.js             # Modul laboratorium virtual
│   ├── kuis.js            # Modul kuis
│   └── data.js            # Data soal kuis
└── assets/                # Gambar
    ├── car.png
    ├── rock.png
    └── parabola.png
```

## API Endpoints

### `GET /`
Mengembalikan status server

### `POST /register`
Daftar user baru
```json
{
  "username": "Tester",
  "password": "password"
}
```

### `POST /login`
Login user - mengembalikan JWT token
```json
{
  "username": "Tester",
  "password": "password"
}
```

### `GET /progress-kuis`
Mengambil progress kuis user (butuh token)
```
Headers: { Authorization: 'Bearer <token>' }
```

### `POST /progress-kuis`
Menyimpan progress kuis user (butuh token)
```json
{
  "topik": "glb",
  "skor": 8,
  "jawaban": [0, 1, 2, ...],
  "selesai": true
}
```

## Fitur Aplikasi

### 🎓 Materi Pembelajaran
- 4 Topik Fisika: GLB, GLBB, Gerak Vertikal, Gerak Parabola
- Video pembelajaran YouTube
- Penjelasan lengkap dengan contoh
- Tips belajar untuk setiap topik
- Formula box dengan rumus-rumus penting

### 🧪 Laboratorium Virtual
- Simulasi GLB (Gerak Lurus Beraturan)
- Simulasi GLBB (Gerak Lurus Berubah Beraturan)
- Simulasi Gerak Vertikal (Jatuh Bebas)
- Simulasi Gerak Parabola
- Visualisasi real-time dengan grafik
- Panel analisis data

### 📝 Kuis Interaktif
- 10 soal per topik (total 40 soal)
- Progress tersimpan otomatis di database
- Badge "✓ Selesai" untuk kuis yang sudah dikerjakan
- Tampilan skor dan riwayat jawaban
- Bisa mengerjakan ulang kuis

### 🌓 Dark Mode
- Toggle dark/light theme
- Warna konsisten di semua mode
- Tersimpan di localStorage

## Troubleshooting

**"Tidak bisa terhubung ke server"**
- Pastikan backend berjalan: `node server.js`
- Cek apakah port 3001 tersedia

**"Username sudah dipakai"**
- Gunakan username yang berbeda

**"Token tidak valid" atau halaman redirect ke login**
- Hapus localStorage browser (F12 → Application → Local Storage → Clear)
- Login lagi

**"Error Firebase" atau "Tidak bisa terhubung ke Firebase"**
- Pastikan file `.env` dan `serviceAccountKey.json.json` ada di folder `Back_End/`
- Cek isi file sudah benar (copy dari instruksi setup)
- Verifikasi proyek Firebase aktif

**"Gambar di lab ada background putih"**
- Pastikan file PNG memang transparent
- Clear browser cache (Ctrl+F5)
- Cek console browser untuk error loading gambar

## Persyaratan Environment

- Node.js (versi 14 atau lebih baru)
- npm
- Akun Firebase (untuk database)
- Browser modern (Chrome, Firefox, Edge)
