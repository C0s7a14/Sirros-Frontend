#!/bin/bash
set -e
python -m alembic upgrade b9c3d2e1f0a4
python -m alembic upgrade c3f1a2b4e5d6
python -m alembic upgrade 7a50ebcc5496
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
