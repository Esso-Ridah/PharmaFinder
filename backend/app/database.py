from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.config import settings

# Handle different database URLs
if settings.DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
else:
    # For SQLite or other databases
    ASYNC_DATABASE_URL = settings.DATABASE_URL

# Async engine for FastAPI
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=settings.DEBUG)
AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

# Sync engine for Alembic migrations
sync_engine = create_engine(settings.DATABASE_URL)
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

Base = declarative_base()


async def get_db():
    """Dependency for getting async database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_sync_db():
    """Get sync database session for migrations"""
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()