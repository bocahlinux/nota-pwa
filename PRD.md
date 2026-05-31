# Product Requirements Document (PRD)
## Nota — Aplikasi Catatan Pribadi

> **Versi:** 1.0.0
> **Tanggal:** 31 Mei 2026
> **Status:** In Progress
> **Author:** Yudha

---

## 1. Ringkasan Produk

**Nota** adalah aplikasi catatan pribadi (personal notes) berbasis web yang simpel, cepat, dan bisa diakses kapan saja — bahkan offline. Dibangun sebagai **Progressive Web App (PWA)** dengan **Django REST Framework** di backend dan **React + TypeScript** di frontend.

### Tujuan Produk
- Menyediakan tempat menulis dan mengelola catatan pribadi yang mudah digunakan
- Bisa dipasang (install) di HP/laptop seperti native app
- Bekerja offline dengan service worker
- Antarmuka bersih, minimalis, dan responsif

### Tech Stack

| Layer | Teknologi |
|---|---|
| **Backend** | Django 5.2 + Django REST Framework |
| **Database** | SQLite (dev) → PostgreSQL (prod) |
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Custom CSS (tanpa framework CSS) |
| **PWA** | Workbox (via vite-plugin-pwa) |
| **Auth** | Django Session + Basic Auth |

---

## 2. User Personas

### Persona 1 — "Pelajar / Mahasiswa"
- Butuh tempat simpan catatan kuliah yang ringkas
- Sering akses dari HP
- Mau bisa cari catatan dengan cepat

### Persona 2 — "Profesional / Pekerja"
- Men catat ide, to-do, meeting notes
- Butuh organisasi (pin, arsip, status)
- Lebih suka UI yang clean dan tidak ramai

### Persona 3 — "Penulis / Creator"
- Menulis draft konten panjang
- Butuh status draft → published
- Mau lihat statistik produktivitas

---

## 3. Fitur & Requirements

### 3.1 Autentikasi (`Auth`)

| ID | Fitur | Status | Prioritas |
|---|---|---|---|
| AU-01 | Login dengan username & password | ✅ Done | P0 |
| AU-02 | Logout | ✅ Done | P0 |
| AU-03 | Session management (localStorage + Django session) | ✅ Done | P0 |
| AU-04 | Registrasi user baru | ❌ Not Started | P1 |
| AU-05 | Reset password | ❌ Not Started | P2 |

### 3.2 Manajemen Nota (CRUD)

| ID | Fitur | Status | Prioritas |
|---|---|---|---|
| CR-01 | Buat nota baru (judul + isi + status) | ✅ Done | P0 |
| CR-02 | Lihat daftar nota (list view) | ✅ Done | P0 |
| CR-03 | Edit/update nota | ✅ Done | P0 |
| CR-04 | Hapus nota (dengan konfirmasi) | ✅ Done | P0 |
| CR-05 | Detail nota (auto-generated summary) | ✅ Done | P1 |
| CR-06 | Pagination (20 per halaman) | ✅ Done | P1 |
| CR-07 | Status nota: Draft / Published / Archived | ✅ Done | P0 |

### 3.3 Organisasi & Filter

| ID | Fitur | Status | Prioritas |
|---|---|---|---|
| OR-01 | Pin / unpin nota (nota muncul di atas) | ✅ Done | P0 |
| OR-02 | Arsipkan nota (archive) | ✅ Done | P1 |
| OR-03 | Filter berdasarkan status (All / Published / Draft / Archived) | ✅ Done | P1 |
| OR-04 | Urutkan berdasarkan tanggal judul | ✅ Done | P1 |
| OR-05 | Pencarian real-time (search by title & content) | ✅ Done | P0 |

### 3.4 Statistik

| ID | Fitur | Status | Prioritas |
|---|---|---|---|
| ST-01 | Tampilkan statistik: total, published, draft, archived, pinned | ✅ Done | P1 |
| ST-02 | Statistik catatan dibuat 7 hari terakhir | ✅ Done | P2 |

### 3.5 PWA & UI/UX

| ID | Fitur | Status | Prioritas |
|---|---|---|---|
| PW-01 | Web App Manifest (standalone display) | ✅ Done | P0 |
| PW-02 | Service Worker (offline caching) | ✅ Done | P0 |
| PW-03 | App icons (192px, 512px) | ✅ Done | P0 |
| PW-04 | Responsive design (mobile-first) | ✅ Done | P0 |
| PW-05 | Safe area support (notch/home indicator) | ✅ Done | P1 |
| PW-06 | Splash screen / loading state | ✅ Done | P1 |
| PW-07 | Dark mode | ❌ Not Started | P2 |
| PW-08 | Push notification reminder | ❌ Not Started | P3 |

### 3.6 Keamanan

| ID | Fitur | Status | Prioritas |
|---|---|---|---|
| SE-01 | CSRF protection | ✅ Done | P0 |
| SE-02 | Authentication required untuk semua API endpoint | ✅ Done | P0 |
| SE-03 | User hanya bisa akses nota sendiri | ✅ Done | P0 |
| SE-04 | Input validation & sanitization | ✅ Done | P0 |
| SE-05 | Rate limiting / throttling | ❌ Not Started | P2 |

---

## 4. API Endpoints

### Base URL: `/api/`

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/notas/` | List nota (paginated, searchable) |
| POST | `/api/notas/` | Buat nota baru |
| GET | `/api/notas/{id}/` | Detail nota |
| PUT | `/api/notas/{id}/` | Update nota (full) |
| PATCH | `/api/notas/{id}/` | Update nota (partial) |
| DELETE | `/api/notas/{id}/` | Hapus nota |
| POST | `/api/notas/{id}/toggle_pin/` | Toggle pin status |
| POST | `/api/notas/{id}/archive/` | Arsipkan nota |
| GET | `/api/notas/stats/` | Statistik nota |
| - | `/api/auth/` | Django REST browsable API auth |

### Query Parameters (GET /api/notas/)
- `page` — nomor halaman
- `search` — pencarian berdasarkan title / content
- `ordering` — `-created_at`, `updated_at`, `title`, dll

---

## 5. Data Model

### Nota

| Field | Type | Keterangan |
|---|---|---|
| id | AutoField | Primary key |
| title | Char(200) | Judul catatan |
| content | Text | Isi catatan |
| status | Char(10) | draft / published / archived |
| author | FK → User | Pemilik catatan |
| is_pinned | Boolean | Pin status (default: false) |
| created_at | DateTime | Auto on create |
| updated_at | DateTime | Auto on update |

**Default ordering:** `[-is_pinned, -updated_at]` (pinned terlebih dahulu, lalu terbaru)

---

## 6. Frontend Architecture

```
frontend/src/
├── App.tsx              # Root → Auth routing
├── main.tsx             # Entry point
├── index.css            # Global styles
├── pages/
│   ├── LoginPage.tsx    # Login form
│   └── HomePage.tsx     # Main dashboard (list + form)
├── components/
│   ├── Navbar.tsx       # Top navigation bar
│   ├── StatsBar.tsx     # Statistics display
│   ├── NotaList.tsx     # List of nota cards
│   ├── NotaForm.tsx     # Create / edit modal
│   └── ...
├── hooks/
│   └── useNotas.ts      # Data fetching & actions
├── context/
│   └── AuthContext.tsx  # Auth state management
└── services/
    └── api.ts           # Axios client + API calls
```

---

## 7. Backend Architecture

```
backend/
├── backend/
│   ├── settings.py      # Django config + DRF settings
│   ├── urls.py          # Root URL routing
│   └── wsgi/asgi.py
├── notes/
│   ├── models.py        # Nota model
│   ├── serializers.py   # DRF serializer
│   ├── views.py         # NotaViewSet (CRUD + actions)
│   ├── urls.py          # App URL routing
│   ├── admin.py         # Admin config
│   └── migrations/
└── db.sqlite3
```

---

## 8. Progress Ringkasan

### ✅ Sudah Selesai (v0.1.0)
- [x] Django project + REST Framework setup
- [x] Nota model + migrations
- [x] NotaViewSet (CRUD + toggle pin + archive + stats)
- [x] Serializers + filtering + search + pagination
- [x] React + TypeScript + Vite setup
- [x] Auth context (login/logout with session)
- [x] Home page (list + search + filter + pagination)
- [x] Nota form (create/edit modal)
- [x] Pin, archive, delete actions
- [x] Stats bar
- [x] PWA manifest + service worker
- [x] Responsive CSS (mobile-first)
- [x] CSRF protection

### ❌ Belum Dikerjakan
- [ ] User registration
- [ ] Tests (backend + frontend)
- [ ] Dark mode
- [ ] PostgreSQL migration
- [ ] Production deployment setup
- [ ] API token auth (menggantikan basic auth)
- [ ] Push notifications
- [ ] Rich text / markdown editor
- [ ] Tags / categories
- [ ] File attachments
- [ ] Export / import notes

---

## 9. Roadmap

### v0.2.0 — Testing & Registration
- Unit & integration tests (backend)
- User registration flow
- Error handling improvements

### v0.3.0 — Dark Mode & Polish
- Dark mode toggle
- Smooth animations
- Toast notifications

### v1.0.0 — Production Ready
- PostgreSQL setup
- Deployment (Docker + CI/CD)
- API token authentication
- Performance optimization

---

## 10. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| **Performance** | Page load < 2s di 3G, API response < 200ms |
| **Availability** | PWA bisa offline untuk melihat cached notes |
| **Security** | HTTPS wajib di production, CSRF protected |
| **Accessibility** | Semantic HTML, keyboard navigable |
| **Responsif** | Mobile-first, support 320px → 1920px |
| **Browser** | Chrome, Firefox, Safari, Edge (2 versi terakhir) |

---

*Dokumen ini bersifat hidup (living document) dan akan diperbarui seiring perkembangan proyek.*
