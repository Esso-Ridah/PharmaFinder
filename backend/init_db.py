#!/usr/bin/env python3
"""
Database initialization script for PharmaFinder
Creates tables and populates with test data
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import async_engine, AsyncSessionLocal
from app.models import Base, User, UserRole, Pharmacy, Category, Product
from app.auth import get_password_hash
import uuid


async def init_database():
    """Initialize database with tables and test data"""
    
    print("Creating database tables...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully!")
    
    print("Inserting test data...")
    
    async with AsyncSessionLocal() as db:
        # Create test users
        test_users = [
            User(
                id=str(str(uuid.uuid4())),
                email="kofi.asante@gmail.com",
                password_hash=get_password_hash("password123"),
                first_name="Kofi",
                last_name="Asante",
                phone="+228 70 12 34 56",
                role=UserRole.CLIENT,
                is_active=True
            ),
            User(
                id=str(uuid.uuid4()),
                email="amara.diallo@gmail.com", 
                password_hash=get_password_hash("password123"),
                first_name="Amara",
                last_name="Diallo",
                phone="+228 90 87 65 43",
                role=UserRole.PHARMACIST,
                is_active=True
            ),
            User(
                id=str(uuid.uuid4()),
                email="admin@pharmafinder.tg",
                password_hash=get_password_hash("admin123"),
                first_name="Admin",
                last_name="PharmaFinder",
                role=UserRole.ADMIN,
                is_active=True
            )
        ]
        
        for user in test_users:
            db.add(user)
        
        # Create test categories
        categories = [
            Category(
                id=str(uuid.uuid4()),
                name="Médicaments sur ordonnance",
                slug="prescription-drugs",
                description="Médicaments nécessitant une ordonnance médicale",
                is_active=True
            ),
            Category(
                id=str(uuid.uuid4()),
                name="Médicaments sans ordonnance",
                slug="over-counter-drugs", 
                description="Médicaments disponibles sans ordonnance",
                is_active=True
            ),
            Category(
                id=str(uuid.uuid4()),
                name="Vitamines et suppléments",
                slug="vitamins-supplements",
                description="Vitamines et compléments alimentaires",
                is_active=True
            )
        ]
        
        for category in categories:
            db.add(category)
        
        # Create test pharmacy
        pharmacy = Pharmacy(
            id=str(uuid.uuid4()),
            name="Pharmacie Centrale de Lomé",
            license_number="PH-LOME-2024-001",
            owner_id=test_users[1].id,  # Amara Diallo (pharmacist)
            address="Avenue du 24 Janvier, Lomé",
            city="Lomé",
            country="Togo",
            latitude=6.1319,
            longitude=1.2228,
            phone="+228 22 21 23 45",
            email="contact@pharmacie-centrale-lome.tg",
            opening_hours={
                "monday": "08:00-18:00",
                "tuesday": "08:00-18:00", 
                "wednesday": "08:00-18:00",
                "thursday": "08:00-18:00",
                "friday": "08:00-18:00",
                "saturday": "08:00-13:00",
                "sunday": "Fermé"
            },
            is_active=True,
            is_verified=True
        )
        db.add(pharmacy)
        
        # Create test products
        products = [
            Product(
                id=str(uuid.uuid4()),
                name="Paracétamol 500mg",
                generic_name="Paracétamol",
                barcode="3456789012345",
                category_id=categories[1].id,  # Over counter
                description="Antalgique et antipyrétique",
                manufacturer="Laboratoire Central",
                dosage="500mg",
                requires_prescription=False,
                active_ingredient="Paracétamol",
                contraindications="Allergie au paracétamol, insuffisance hépatique sévère",
                side_effects="Rares: éruptions cutanées, troubles hépatiques en cas de surdosage",
                is_active=True
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Amoxicilline 500mg",
                generic_name="Amoxicilline",
                barcode="3456789012346",
                category_id=categories[0].id,  # Prescription
                description="Antibiotique à large spectre",
                manufacturer="PharmaTogo",
                dosage="500mg",
                requires_prescription=True,
                active_ingredient="Amoxicilline",
                contraindications="Allergie aux pénicillines",
                side_effects="Troubles digestifs, réactions allergiques possibles",
                is_active=True
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Vitamine C 1000mg",
                generic_name="Acide ascorbique",
                barcode="3456789012347",
                category_id=categories[2].id,  # Vitamins
                description="Complément vitaminique",
                manufacturer="VitaTogo",
                dosage="1000mg",
                requires_prescription=False,
                active_ingredient="Acide ascorbique",
                contraindications="Hypersensibilité à la vitamine C",
                side_effects="Troubles digestifs en cas de surdosage",
                is_active=True
            )
        ]
        
        for product in products:
            db.add(product)
        
        await db.commit()
    
    print("✅ Test data inserted successfully!")
    print("\n🚀 Database initialized! You can now:")
    print("   - Login with: kofi.asante@gmail.com / password123 (Client)")
    print("   - Login with: amara.diallo@gmail.com / password123 (Pharmacist)")
    print("   - Login with: admin@pharmafinder.tg / admin123 (Admin)")


if __name__ == "__main__":
    print("🏥 Initializing PharmaFinder Database...")
    asyncio.run(init_database())
    print("🎉 Database initialization complete!")