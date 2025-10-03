#!/usr/bin/env python3
"""
Migration 005: Add validation_timeout_at field to prescription_requests table
"""
import sqlite3
import logging

logger = logging.getLogger(__name__)

def upgrade(db_path: str = "pharmafinder.db"):
    """Add validation_timeout_at field to prescription_requests table"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if column already exists
        cursor.execute("PRAGMA table_info(prescription_requests)")
        existing_columns = [column[1] for column in cursor.fetchall()]

        if "validation_timeout_at" not in existing_columns:
            # Add validation_timeout_at column
            cursor.execute("""
                ALTER TABLE prescription_requests
                ADD COLUMN validation_timeout_at TIMESTAMP
            """)
            logger.info("Added validation_timeout_at column to prescription_requests table")

        conn.commit()
        logger.info("✅ Migration 005 completed: Added validation_timeout_at field")

    except Exception as e:
        logger.error(f"❌ Migration 005 failed: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

def downgrade(db_path: str = "pharmafinder.db"):
    """Remove validation_timeout_at field (not supported in SQLite)"""
    logger.warning("⚠️  Downgrade not supported for SQLite - column will remain")
    pass

if __name__ == "__main__":
    upgrade()