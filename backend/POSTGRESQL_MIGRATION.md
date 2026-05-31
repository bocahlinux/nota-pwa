# PostgreSQL Migration Guide — Nota

## Overview

Default development database adalah **SQLite**. Untuk production, disarankan menggunakan **PostgreSQL** performa dan reliability yang lebih baik.

## Prerequisites

- PostgreSQL 14+ terinstall
- Database dan user sudah dibuat

## Step-by-Step Migration

### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Verifikasi
sudo systemctl status postgresql
```

### 2. Create Database & User

```bash
sudo -u postgres psql
```

```sql
-- Buat database
CREATE DATABASE nota_db;

-- Buat user dengan password
CREATE USER nota_user WITH PASSWORD 'your-secure-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nota_db TO nota_user;

-- Set timezone
ALTER DATABASE nota_db SET TIME_ZONE = 'Asia/Jakarta';

-- Exit
\q
```

### 3. Install psycopg2

```bash
# Sudah ada di requirements.txt
pip install psycopg2-binary
```

### 4. Update .env

Edit `backend/backend/.env`:

```env
# Ganti dari SQLite ke PostgreSQL
DB_ENGINE=postgres
DB_NAME=nota_db
DB_USER=nota_user
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432
```

### 5. Run Migrations

```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

### 6. Migrate Data dari SQLite (Opsional)

Kalau udah punya data di SQLite yang perlu dipindahkan:

```bash
# Dump data dari SQLite
python manage.py dumpdata --natural-foreign --natural-primary --indent 2 > /tmp/nota_backup.json

# Switch ke PostgreSQL (update .env dulu)
python manage.py migrate
python manage.py loaddata /tmp/nota_backup.json
```

### 7. Verify

```bash
# Cek database
python manage.py shell -c "from django.db import connection; print(connection.vendor)"
# Output: postgresql

# Cek tables
python manage.py shell -c "from django.db import connection; cursor = connection.cursor(); cursor.execute(\"SELECT tablename FROM pg_tables WHERE schemaname='public'\"); print(cursor.fetchall())"
```

### 8. Create Superuser

```bash
python manage.py createsuperuser
```

## Production Checklist

- [ ] PostgreSQL 14+ installed
- [ ] Database & user created
- [ ] `DB_ENGINE=postgres` di `.env`
- [ ] Password kuatan (min. 20 karakter random)
- [ ] Migrations running successfully
- [ ] Superuser created
- [ ] Backup cron job setup

## Backup & Restore

### Backup
```bash
# Full database dump
pg_dump -U nota_user -d nota_db > /tmp/nota_backup_$(date +%Y%m%d).sql

# Compress
gzip /tmp/nota_backup_$(date +%Y%m%d).sql
```

### Restore
```bash
# From SQL dump
gunzip < /tmp/nota_backup_20260531.sql.gz | psql -U nota_user -d nota_db

# From Django fixture
python manage.py loaddata /tmp/nota_backup.json
```

## Troubleshooting

| Error | Solusi |
|---|---|
| `FATAL: database "nota_db" does not exist` | Buat database: `sudo -u postgres createdb nota_db` |
| `FATAL: password authentication failed` | Cek user/password di `.env` match dengan PostgreSQL |
| `could not connect to server: Connection refused` | PostgreSQL tidak running: `sudo systemctl start postgresql` |
| `permission denied for database` | Grant privileges: `GRANT ALL ON DATABASE nota_db TO nota_user;` |
| `django.db.utils.OperationalError` | Run migrations: `python manage.py migrate` |

## Performance Tuning

Untuk production, tambahkan di `postgresql.conf`:

```ini
# Connection
max_connections = 100

# Memory
shared_buffers = 512MB
work_mem = 16MB
maintenance_work_mem = 128MB

# WAL
wal_buffers = 64MB
checkpoint_completion_target = 0.9

# Query
random_page_cost = 1.1
effective_cache_size = 1GB
```

Restart PostgreSQL setelah perubahan:
```bash
sudo systemctl restart postgresql
```
