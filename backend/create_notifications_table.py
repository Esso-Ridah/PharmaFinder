#!/usr/bin/env python3
"""
Script pour créer la table notifications
"""

import asyncio
import sys
import os

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import async_engine
from app.models import Base

async def create_tables():
    """Create all tables including notifications"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All tables created successfully including notifications")

if __name__ == "__main__":
    print("🔨 Creating notifications table...")
    asyncio.run(create_tables())