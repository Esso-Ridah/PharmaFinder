#!/usr/bin/env python3
"""
Migration 003: Add flexible address fields for African addressing
"""
import sqlite3
import logging

logger = logging.getLogger(__name__)

def upgrade(db_path: str = "pharmafinder.db"):
    """Add flexible address fields to client_addresses table"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if columns already exist
        cursor.execute("PRAGMA table_info(client_addresses)")
        existing_columns = [column[1] for column in cursor.fetchall()]

        # Add new columns if they don't exist
        new_columns = [
            ("address_type", "VARCHAR(20) DEFAULT 'modern'"),
            ("street_address", "TEXT"),
            ("neighborhood", "VARCHAR(100)"),
            ("landmark_description", "TEXT"),
            ("delivery_phone", "VARCHAR(20)"),
            ("delivery_instructions", "TEXT")
        ]

        for column_name, column_definition in new_columns:
            if column_name not in existing_columns:
                sql = f"ALTER TABLE client_addresses ADD COLUMN {column_name} {column_definition}"
                logger.info(f"Adding column: {sql}")
                cursor.execute(sql)

        conn.commit()
        logger.info("✅ Migration 003 completed: Added flexible address fields")

    except Exception as e:
        logger.error(f"❌ Migration 003 failed: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

def downgrade(db_path: str = "pharmafinder.db"):
    """Remove flexible address fields (not supported in SQLite)"""
    logger.warning("⚠️  Downgrade not supported for SQLite - columns will remain in table")
    pass

if __name__ == "__main__":
    upgrade()