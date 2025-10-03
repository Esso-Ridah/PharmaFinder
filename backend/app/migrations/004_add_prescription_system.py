#!/usr/bin/env python3
"""
Migration 004: Add prescription validation system
"""
import sqlite3
import logging

logger = logging.getLogger(__name__)

def upgrade(db_path: str = "pharmafinder.db"):
    """Add prescription validation system tables"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Create prescription_requests table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prescription_requests (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                product_id VARCHAR(36) NOT NULL,
                pharmacy_id VARCHAR(36) NOT NULL,
                prescription_image_url VARCHAR(500) NOT NULL,
                original_filename VARCHAR(255),
                file_size INTEGER,
                mime_type VARCHAR(100),
                status VARCHAR(20) DEFAULT 'pending',
                quantity_requested INTEGER NOT NULL DEFAULT 1,
                validated_by VARCHAR(36),
                validated_at TIMESTAMP,
                rejection_reason TEXT,
                pharmacist_notes TEXT,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
                FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
            )
        """)

        # Add prescription fields to cart_items
        cursor.execute("PRAGMA table_info(cart_items)")
        existing_columns = [column[1] for column in cursor.fetchall()]

        new_cart_columns = [
            ("prescription_request_id", "VARCHAR(36)"),
            ("requires_prescription_validation", "BOOLEAN DEFAULT 0")
        ]

        for column_name, column_definition in new_cart_columns:
            if column_name not in existing_columns:
                sql = f"ALTER TABLE cart_items ADD COLUMN {column_name} {column_definition}"
                logger.info(f"Adding column: {sql}")
                cursor.execute(sql)

        # Add foreign key constraint (Note: SQLite doesn't support adding FK constraints after table creation)
        # This would need to be handled in the application logic

        conn.commit()
        logger.info("✅ Migration 004 completed: Added prescription validation system")

    except Exception as e:
        logger.error(f"❌ Migration 004 failed: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

def downgrade(db_path: str = "pharmafinder.db"):
    """Remove prescription validation system (not supported in SQLite)"""
    logger.warning("⚠️  Downgrade not supported for SQLite - tables will remain")
    pass

if __name__ == "__main__":
    upgrade()