#!/bin/bash
set -e
python -m alembic upgrade b9c3d2e1f0a4
python -m alembic upgrade c3f1a2b4e5d6
python - <<'EOF'
import os, psycopg2
conn = psycopg2.connect(os.environ["DATABASE_URL"])
cur = conn.cursor()
cur.execute("ALTER TABLE training_documents ADD COLUMN IF NOT EXISTS status VARCHAR NOT NULL DEFAULT 'processing'")
conn.commit()
cur.close()
conn.close()
print("status column ensured")
EOF
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
