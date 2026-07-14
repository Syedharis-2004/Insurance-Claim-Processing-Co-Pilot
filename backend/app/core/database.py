import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Priority:
# 1. DATABASE_URL env var → PostgreSQL (production with a real DB)
# 2. VERCEL env var set    → in-memory SQLite  (Vercel read-only FS)
# 3. Default              → local SQLite file  (local development)
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # PostgreSQL / external DB
    engine = create_engine(DATABASE_URL)
elif os.getenv("VERCEL"):
    # Vercel serverless: filesystem is read-only, use in-memory SQLite
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
else:
    # Local development: file-based SQLite
    engine = create_engine(
        "sqlite:///./claimwise.db",
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
