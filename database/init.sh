#!/bin/bash

# Database initialization script for PharmaFinder
# This script sets up the PostgreSQL database with tables and sample data

set -e

echo "🚀 Initializing PharmaFinder Database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 -U pharma_user -d pharmafinder_db; then
    echo "❌ PostgreSQL is not ready. Please start the database first."
    exit 1
fi

echo "✅ PostgreSQL is ready"

# Create database if it doesn't exist
echo "📊 Creating database schema..."
psql -h localhost -p 5432 -U pharma_user -d pharmafinder_db -f models.sql

echo "📝 Inserting sample data..."
psql -h localhost -p 5432 -U pharma_user -d pharmafinder_db -f sample_data.sql

echo "✅ Database initialization completed successfully!"
echo ""
echo "📋 Database Information:"
echo "  - Host: localhost"
echo "  - Port: 5432"
echo "  - Database: pharmafinder_db"
echo "  - User: pharma_user"
echo ""
echo "🔗 Connection URL: postgresql://pharma_user:pharma_pass@localhost:5432/pharmafinder_db"