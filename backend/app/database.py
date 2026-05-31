import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"].replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)


@event.listens_for(engine, "connect")
def _register_vector(dbapi_connection, _):
    from pgvector.psycopg2 import register_vector
    register_vector(dbapi_connection)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
