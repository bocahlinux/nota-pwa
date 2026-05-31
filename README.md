<div align="center">

# 📝 Nota — Aplikasi Catatan Pribadi

[![CI/CD](https://github.com/bocahlinux/nota-pwa/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/bocahlinux/nota-pwa/actions/workflows/ci-cd.yml)
[![Django](https://img.shields.io/badge/Django-5.2-green)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Aplikasi catatan pribadi yang simpel, powerful, dan bisa diakses offline.**
Dibangun dengan **Django REST Framework** + **React TypeScript** sebagai **Progressive Web App**.

[Demo](https://nota-demo.hermes) · [Bug Report](https://github.com/bocahlinux/nota-pwa/issues) · [Fitur Roadmap](#-roadmap)

![Nota Screenshot](./frontend/src/assets/hero.png)

</div>

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Quick Start](#-quick-start)
  - [Clone Repository](#1-clone-repository)
  - [Setup Backend](#2-setup-backend)
  - [Setup Frontend](#3-setup-frontend)
  - [Menjalankan Aplikasi](#4-menjalankan-aplikasi)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Development Guide](#-development-guide)
- [Roadmap](#-roadmap)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 📝 Manajemen Catatan
- **CRUD Lengkap** — Buat, baca, edit, hapus catatan dengan mudah
- **Rich Text / Markdown** — Supports GitHub Flavored Markdown dengan live preview
- **Auto-Summary** — Summary otomatis dari konten catatan

### 🏷️ Organisasi
- **Tags / Labels** — Kategorisasi catatan dengan warna custom
- **Pin / Unpin** — Sematkan catatan penting di atas
- **Archive** — Arsipkan catatan yang sudah tidak aktif
- **Pencarian Real-time** — Cari berdasarkan judul dan isi

### 📎 Lampiran
- **Drag & Drop Upload** — Upload file dengan drag dan drop
- **Progress Bar** — Indikator progress upload
- **Multi-File** — Upload sekaligus banyak file

### 💾 Data Portability
- **Export JSON** — Download semua catatan sebagai file JSON
- **Import JSON** — Restore catatan dari file backup

### 🎨 Pengalaman Pengguna
- **Dark Mode** — Tema gelap/terang dengan deteksi preferensi sistem
- **Toast Notifications** — Notifikasi aksi (sukses, error, info)
- **Responsive Design** — Mobile-first, tampil sempurna di semua perangkat
- **PWA** — Bisa di-install di HP/laptop, akses offline

### 🔒 Keamanan
- **JWT Authentication** — Token-based auth dengan auto-refresh
- **CSRF Protection** — Django CSRF token untuk keamanan form
- **Rate Limiting** — Proteksi dari abuse (30 req/min anon, 100 req/min user)
- **Input Validation** — Validasi dan sanitasi semua input

### 📊 Statistik
- Dashboard statistik: total, published, draft, archived, pinned
- Statistik catatan dibuat 7 hari terakhir

---

## 🛠 Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| **Backend** | Django | 5.2 |
| **API** | Django REST Framework | 3.17 |
| **Auth** | djangorestframework-simplejwt | 5.5 |
| **Database** | SQLite (dev) / PostgreSQL (prod) | — |
| **Frontend** | React | 18 |
| **Language** | TypeScript | 5.6 |
| **Build Tool** | Vite | 6.x |
| **Styling** | Custom CSS (CSS Variables) | — |
| **PWA** | vite-plugin-pwa + Workbox | — |
| **Markdown** | react-markdown + remark-gfm | — |
| **HTTP Client** | Axios | 1.x |
| **Process Manager** | Gunicorn (production) | 23.x |
| **Web Server** | Nginx | — |
| **SSL** | Let's Encrypt (Certbot) | — |
| **CI/CD** | GitHub Actions | — |
| **Containerization** | Docker + Docker Compose (optional) | — |

---

## 📁 Struktur Project

```
nota-pwa/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions CI/CD pipeline
├── backend/
│   ├── accounts/                # App: autentikasi & user management
│   │   ├── views.py             # Register, login, logout, me endpoints
│   │   ├── urls.py              # Auth URL routing
│   │   └── ...
│   ├── notes/                   # App: catatan, tags, attachments
│   │   ├── models.py            # Nota, Tag, Attachment models
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # NotaViewSet, TagViewSet, AttachmentViewSet
│   │   ├── urls.py              # URL routing + nested attachments
│   │   ├── tests.py             # 27 unit & integration tests
│   │   └── ...
│   ├── backend/
│   │   ├── settings.py          # Django config (env-based)
│   │   ├── urls.py              # Root URL routing
│   │   └── wsgi.py / asgi.py
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Template environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AttachmentUploader.tsx   # Drag & drop file upload
│   │   │   ├── ErrorBoundary.tsx        # Global error boundary
│   │   │   ├── ImportExportModal.tsx    # Export/Import UI
│   │   │   ├── MarkdownEditor.tsx       # Write/Preview tabs
│   │   │   ├── Navbar.tsx               # Top nav + dark mode toggle
│   │   │   ├── NotaForm.tsx             # Create/Edit form
│   │   │   ├── NotaList.tsx             # Cards list
│   │   │   ├── StatsBar.tsx             # Statistics display
│   │   │   └── TagSelector.tsx          # Tag chips + color picker
│   │   ├── context/
│   │   │   ├── AuthContext.tsx          # JWT auth state
│   │   │   ├── ThemeContext.tsx         # Light/Dark theme
│   │   │   └── ToastContext.tsx         # Toast notifications
│   │   ├── hooks/
│   │   │   ├── useNotas.ts              # Notes data + actions
│   │   │   └── useTags.ts               # Tags CRUD
│   │   ├── pages/
│   │   │   ├── HomePage.tsx             # Main dashboard
│   │   │   ├── LoginPage.tsx            # Login form
│   │   │   └── RegisterPage.tsx         # Registration form
│   │   ├── services/
│   │   │   └── api.ts                   # Axios client + API endpoints
│   │   ├── App.tsx                      # Root component
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Global styles + dark mode
│   ├── dist/                            # Build output
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   ├── deploy.sh                # Bare metal deployment (Ubuntu 22.04+)
│   └── setup-github.sh          # GitHub repo setup helper
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf                   # Production nginx config
├── PRD.md                       # Product Requirements Document
└── DEPLOY.md                    # Deployment guide
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Versi Minimal |
|---|---|
| Python | 3.11+ |
| Node.js | 20+ |
| npm | 10+ |
| Git | 2.40+ |

### 1. Clone Repository

```bash
# Clone repo
git clone https://github.com/bocahlinux/nota-pwa.git
cd nota-pwa

# Atau clone via SSH
git clone git@github.com:bocahlinux/nota-pwa.git
cd nota-pwa
```

### 2. Setup Backend

```bash
# Masuk ke direktori backend
cd backend

# Buat virtual environment
python3 -m venv venv
source venv/bin/activate              # Linux/macOS
# venv\Scripts\activate              # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Setup environment variables
cp .env.example backend/.env
# Edit .env sesuai kebutuhan (lihat bagian Konfigurasi Environment)

# Jalankan migrations
python manage.py migrate

# Buat superuser (opsional, untuk admin panel)
python manage.py createsuperuser

# Jalankan development server
python manage.py runserver
```

Backend sekarang berjalan di **http://127.0.0.1:8000**

### 3. Setup Frontend

```bash
# Buka terminal baru, masuk ke direktori frontend
cd frontend

# Install dependencies
npm ci

# Build untuk production
npm run build

# Atau jalankan development server (hot reload)
npm run dev
```

Frontend development server berjalan di **http://localhost:5173**

### 4. Menjalankan Aplikasi

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2 — Frontend (development)
cd frontend && npm run dev
```

Buka browser: **http://localhost:5173**

> **Note:** Pada development, frontend berjalan di Vite dev server (port 5173) dan API di Django (port 8000). Vite proxy otomatis mengarahkan `/api/*` ke backend.

---

## ⚙️ Konfigurasi Environment

File `.env` di `backend/backend/`:

```env
# ── Core (WAJIB diisi di production) ──
DJANGO_SECRET_KEY=ganti-dengan-un...n

# ── Opsional (default untuk development) ──
DB_ENGINE=                       # kosong = SQLite, "postgres" = PostgreSQL
DB_NAME=nota_db                  # untuk PostgreSQL
DB_USER=nota_user                # untuk PostgreSQL
DB_PASSWORD=secret               # untuk PostgreSQL
DB_HOST=localhost               # untuk PostgreSQL
DB_PORT=5432                    # untuk PostgreSQL

# ── CORS ──
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Default Credentials

| Role | Username | Password |
|---|---|---|
| Superuser | Buat via `createsuperbyes` | — |
| API | Username & password bebas | Register di `/api/auth/register/` |

---

## 📡 API Reference

### Base URL: `/api/`

#### Authentication

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register user baru | ❌ |
| `POST` | `/api/auth/login/` | Login, dapat access + refresh token | ❌ |
| `POST` | `/api/auth/refresh/` | Refresh access token | ❌ |
| `POST` | `/api/auth/logout/` | Blacklist refresh token | ✅ |
| `GET` | `/api/auth/me/` | Info user saat ini | ✅ |

#### Notas

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/api/notas/` | List nota (paginated) | ✅ |
| `POST` | `/api/notas/` | Buat nota baru | ✅ |
| `GET` | `/api/notas/{id}/` | Detail nota | ✅ |
| `PUT` | `/api/notas/{id}/` | Update nota (full) | ✅ |
| `PATCH` | `/api/notas/{id}/` | Update nota (partial) | ✅ |
| `DELETE` | `/api/notas/{id}/` | Hapus nota | ✅ |
| `POST` | `/api/notas/{id}/toggle_pin/` | Toggle pin | ✅ |
| `POST` | `/api/notas/{id}/archive/` | Arsipkan nota | ✅ |
| `GET` | `/api/notas/stats/` | Statistik nota | ✅ |
| `GET` | `/api/notas/export/` | Export semua nota (JSON download) | ✅ |
| `POST` | `/api/notas/import_notes/` | Import nota dari JSON | ✅ |

**Query Parameters (GET /api/notas/):**

| Param | Tipe | Deskripsi |
|---|---|---|
| `page` | int | Nomor halaman |
| `search` | string | Cari di title & content |
| `ordering` | string | `-created_at`, `updated_at`, `title` |
| `tag` | string | Filter by tag name |

#### Tags

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/api/tags/` | List tags | ✅ |
| `POST` | `/api/tags/` | Buat tag baru | ✅ |
| `PUT` | `/api/tags/{id}/` | Update tag | ✅ |
| `PATCH` | `/api/tags/{id}/` | Update tag (partial) | ✅ |
| `DELETE` | `/api/tags/{id}/` | Hapus tag | ✅ |

#### Attachments

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/api/notas/{nota_id}/attachments/` | List attachments | ✅ |
| `POST` | `/api/notas/{nota_id}/attachments/` | Upload file (multipart) | ✅ |
| `DELETE` | `/api/notas/{nota_id}/attachments/{id}/` | Hapus attachment | ✅ |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate

# Run semua tests
python manage.py test notes accounts --verbosity=2

# Run tests spesifik
python manage.py test notes.tests.AuthTests
python manage.py test notes.tests.NotaTests.test_create_nota

# Run dengan coverage
pip install coverage
coverage run manage.py test notes accounts
coverage report -m
coverage html   # Buka htmlcov/index.html
```

**27 tests covering:**
- Authentication (register, login, logout, token refresh, protected endpoints)
- CRUD nota (create, read, update, delete, pin, archive, search, filter, export, import)
- Tags (CRUD, duplicate rejection)
- Authorization (user isolation)

---

## 🚢 Deployment

### Opsi A: Bare Metal (Recommended untuk 2GB RAM VPS)

Lihat [DEPLOY.md](./DEPLOY.md) untuk panduan lengkap.

```bash
# 1. Copy files ke server
scp -r backend/ user@server:/var/www/nota/backend/
scp -r frontend/ user@server:/var/www/nota/frontend/
scp scripts/deploy.sh user@server:/tmp/

# 2. SSH ke server
ssh user@server

# 3. Jalankan deployment script
sudo bash /tmp/deploy.sh yourdomain.com

# ✅ Selesai! HTTPS aktif via Let's Encrypt
```

### Opsi B: Docker

```bash
# Build & run semua services
docker-compose up --build -d

# Backend: http://localhost:8000
# Frontend: http://localhost
```

### Opsi C: CI/CD Otomatis (GitHub Actions)

Push ke branch `main` → otomatis:
1. Backend tests (27 test cases)
2. Frontend build
3. Deploy via SSH ke production

Setup secrets di GitHub:
- `DEPLOY_HOST` — IP/domain server
- `DEPLOY_USER` — SSH username
- `DEPLOY_SSH_KEY` — SSH private key

---

## 💻 Development Guide

### Menambah Endpoint Baru

**Backend:**

1. Tambah model di `notes/models.py` (jika perlu)
2. Buat serializer di `notes/serializers.py`
3. Tambah view/endpoint di `notes/views.py`
4. Register URL di `notes/urls.py`
5. Buat test di `notes/tests.py`

**Frontend:**

1. Tambah tipe di `services/api.ts`
2. Tambah method API di `services/api.ts`
3. Buat/update hook di `hooks/`
4. Buat/update component di `components/`

### Code Style

**Backend (Python):**
```bash
pip install black isort flake8
black .
isort .
flake8 .
```

**Frontend (TypeScript/React):**
```bash
npm run lint      # ESLint
npm run build     # Type check + build
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/fitur-baru
git add .
git commit -m "feat: deskripsi fitur"
git push origin feature/fitur-baru
# Buat Pull Request di GitHub
```

---

## 🗺 Roadmap

### v0.2.0 — Testing & Polish
- [ ] Frontend unit tests (React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Performance optimization (bundle splitting, lazy loading)

### v0.3.0 — Enhanced Features
- [ ] Rich text toolbar (bold, italic, lists)
- [ ] Note templates
- [ ] Trash bin (soft delete)
- [ ] Keyboard shortcuts

### v1.0.0 — Production Scale
- [ ] PostgreSQL migration
- [ ] Redis caching
- [ ] Full-text search (Elasticsearch / PostgreSQL tsvector)
- [ ] WebSocket real-time sync
- [ ] Multi-device sync

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Cara berkontribusi:

1. **Fork** repository ini
2. Buat **feature branch**: `git checkout -b feature/fitur-keren`
3. **Commit** perubahan: `git commit -m "feat: tambah fitur keren"`
4. **Push** ke branch: `git push origin feature/fitur-keren`
5. Buka **Pull Request**

### Checklist PR

- [ ] Tests passing (`python manage.py test`)
- [ ] Code formatted (`black .` + `npm run lint`)
- [ ] Tidak ada TypeScript errors (`npx tsc --noEmit`)
- [ ] Dokumentasi updated (jika perlu)

---

## 🆘 Troubleshooting

| Masalah | Solusi |
|---|---|
| `ModuleNotFoundError` | Pastikan venv aktif: `source venv/bin/activate` |
| `npm ERR!` | Hapus `node_modules/` ulang: `rm -rf node_modules && npm ci` |
| CORS error | Cek `CORS_ALLOWED_ORIGINS` di `.env` |
| 401 Unauthorized | Token expired, login ulang atau refresh token |
| Static files 404 | Jalankan `python manage.py collectstatic --noinput` |
| Database locked (SQLite) | SQLite tidak untuk production, ganti PostgreSQL |

---

## 📄 Lisensi

Distributed under the **MIT License**. Lihat [LICENSE](LICENSE) untuk detail.

---

<div align="center">

**Dibuat dengan ❤️ oleh [bocahlinux](https://github.com/bocahlinux)**

⭐ Star repo ini jika kamu menemukan ini berguna!

[⬆ Kembali ke Atas](#-nota--aplikasi-catatan-pribadi)

</div>
