#!/usr/bin/env python3
"""
Script pour créer des données de démo pour PharmaFinder
avec pharmacies, produits et sponsoring
"""

import asyncio
import sys
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

sys.path.append('.')

from app.database import AsyncSessionLocal, async_engine
from app.models import (
    Base, User, Pharmacy, Product, Category, PharmacyInventory, 
    UserRole
)
from sqlalchemy import select


async def create_demo_data():
    """Créer les données de démo"""
    async with AsyncSessionLocal() as db:
        print("🏗️  Création des données de démo...")
        
        # 1. Créer des catégories (vérifier si elles existent déjà)
        categories_data = [
            {"name": "Antibiotiques", "slug": "antibiotiques", "description": "Médicaments contre les infections"},
            {"name": "Antalgiques", "slug": "antalgiques", "description": "Médicaments contre la douleur"},
            {"name": "Antifongiques", "slug": "antifongiques", "description": "Traitement des mycoses"},
            {"name": "Vitamines", "slug": "vitamines", "description": "Compléments vitaminiques"},
            {"name": "Digestifs", "slug": "digestifs", "description": "Troubles digestifs"},
            {"name": "Cardiovasculaire", "slug": "cardiovasculaire", "description": "Santé du cœur"},
        ]
        
        categories = []
        categories_created = 0
        for cat_data in categories_data:
            # Vérifier si la catégorie existe déjà
            result = await db.execute(select(Category).where(Category.slug == cat_data["slug"]))
            existing_category = result.scalar_one_or_none()
            
            if existing_category:
                categories.append(existing_category)
                print(f"📂 Catégorie '{cat_data['name']}' existe déjà")
            else:
                category = Category(**cat_data)
                db.add(category)
                categories.append(category)
                categories_created += 1
        
        if categories_created > 0:
            await db.commit()
            print(f"✅ {categories_created} nouvelles catégories créées")
        else:
            print("✅ Toutes les catégories existent déjà")
        
        # 2. Créer des utilisateurs pharmaciens (vérifier s'ils existent déjà)
        pharmacists_data = [
            {"email": "pharmacie.centrale@gmail.com", "first_name": "Marie", "last_name": "Dupont", "phone": "+228 22 45 67 89"},
            {"email": "pharmacie.nord@gmail.com", "first_name": "Jean", "last_name": "Martin", "phone": "+228 22 55 77 99"},
            {"email": "pharmacie.sud@gmail.com", "first_name": "Fatou", "last_name": "Kone", "phone": "+228 22 33 44 55"},
            {"email": "pharmacie.ouest@gmail.com", "first_name": "Paul", "last_name": "Adjovi", "phone": "+228 22 66 88 00"},
            {"email": "pharmacie.est@gmail.com", "first_name": "Ama", "last_name": "Togo", "phone": "+228 22 77 99 11"},
        ]
        
        pharmacists = []
        pharmacists_created = 0
        for ph_data in pharmacists_data:
            # Vérifier si l'utilisateur existe déjà
            result = await db.execute(select(User).where(User.email == ph_data["email"]))
            existing_pharmacist = result.scalar_one_or_none()
            
            if existing_pharmacist:
                pharmacists.append(existing_pharmacist)
                print(f"👤 Pharmacien '{ph_data['email']}' existe déjà")
            else:
                from app.auth import get_password_hash
                pharmacist = User(
                    email=ph_data["email"],
                    password_hash=get_password_hash("password123"),
                    first_name=ph_data["first_name"],
                    last_name=ph_data["last_name"],
                    phone=ph_data["phone"],
                    role=UserRole.PHARMACIST
                )
                db.add(pharmacist)
                pharmacists.append(pharmacist)
                pharmacists_created += 1
        
        if pharmacists_created > 0:
            await db.commit()
            print(f"✅ {pharmacists_created} nouveaux pharmaciens créés")
        else:
            print("✅ Tous les pharmaciens existent déjà")
        
        # 3. Créer des pharmacies (vérifier si elles existent déjà)
        pharmacies_data = [
            {
                "name": "Pharmacie Centrale", 
                "license_number": "PH-001-LM", 
                "address": "123 Avenue de la Paix, Lomé", 
                "city": "Lomé",
                "latitude": Decimal("6.1319"), 
                "longitude": Decimal("1.2228"),
                "phone": "+228 22 45 67 89",
                "is_verified": True
            },
            {
                "name": "Pharmacie du Nord", 
                "license_number": "PH-002-LM", 
                "address": "456 Rue de Tokoin, Lomé", 
                "city": "Lomé",
                "latitude": Decimal("6.1629"), 
                "longitude": Decimal("1.2306"),
                "phone": "+228 22 55 77 99",
                "is_verified": True
            },
            {
                "name": "Pharmacie du Sud", 
                "license_number": "PH-003-LM", 
                "address": "789 Boulevard Nyékonakpoé, Lomé", 
                "city": "Lomé",
                "latitude": Decimal("6.1083"), 
                "longitude": Decimal("1.2125"),
                "phone": "+228 22 33 44 55",
                "is_verified": True
            },
            {
                "name": "Pharmacie de l'Ouest", 
                "license_number": "PH-004-LM", 
                "address": "321 Rue d'Amoutivé, Lomé", 
                "city": "Lomé",
                "latitude": Decimal("6.1450"), 
                "longitude": Decimal("1.1978"),
                "phone": "+228 22 66 88 00",
                "is_verified": False
            },
            {
                "name": "Pharmacie de l'Est", 
                "license_number": "PH-005-LM", 
                "address": "654 Avenue d'Adidogomé, Lomé", 
                "city": "Lomé",
                "latitude": Decimal("6.1700"), 
                "longitude": Decimal("1.2500"),
                "phone": "+228 22 77 99 11",
                "is_verified": True
            },
        ]
        
        pharmacies = []
        pharmacies_created = 0
        for i, ph_data in enumerate(pharmacies_data):
            # Vérifier si la pharmacie existe déjà
            result = await db.execute(select(Pharmacy).where(Pharmacy.license_number == ph_data["license_number"]))
            existing_pharmacy = result.scalar_one_or_none()
            
            if existing_pharmacy:
                pharmacies.append(existing_pharmacy)
                print(f"🏥 Pharmacie '{ph_data['name']}' existe déjà")
            else:
                pharmacy = Pharmacy(
                    **ph_data,
                    owner_id=pharmacists[i].id
                )
                db.add(pharmacy)
                pharmacies.append(pharmacy)
                pharmacies_created += 1
        
        if pharmacies_created > 0:
            await db.commit()
            print(f"✅ {pharmacies_created} nouvelles pharmacies créées")
        else:
            print("✅ Toutes les pharmacies existent déjà")
        
        # 4. Créer des produits (vérifier s'ils existent déjà)
        products_data = [
            # Antibiotiques
            {"name": "Amoxicilline 500mg", "generic_name": "Amoxicilline", "manufacturer": "Biogaran", "dosage": "500mg", "requires_prescription": True, "category_idx": 0},
            {"name": "Azithromycine 250mg", "generic_name": "Azithromycine", "manufacturer": "Sandoz", "dosage": "250mg", "requires_prescription": True, "category_idx": 0},
            {"name": "Cefixime 200mg", "generic_name": "Cefixime", "manufacturer": "Teva", "dosage": "200mg", "requires_prescription": True, "category_idx": 0},
            
            # Antalgiques (avec plusieurs variantes de Paracétamol)
            {"name": "Paracétamol 1000mg", "generic_name": "Paracétamol", "manufacturer": "Doliprane", "dosage": "1000mg", "requires_prescription": False, "category_idx": 1},
            {"name": "Paracétamol 500mg", "generic_name": "Paracétamol", "manufacturer": "Dafalgan", "dosage": "500mg", "requires_prescription": False, "category_idx": 1},
            {"name": "Paracétamol Effervescent 1000mg", "generic_name": "Paracétamol", "manufacturer": "Efferalgan", "dosage": "1000mg", "requires_prescription": False, "category_idx": 1},
            {"name": "Paracétamol Pédiatrique 120mg", "generic_name": "Paracétamol", "manufacturer": "Doliprane", "dosage": "120mg", "requires_prescription": False, "category_idx": 1},
            {"name": "Ibuprofène 400mg", "generic_name": "Ibuprofène", "manufacturer": "Advil", "dosage": "400mg", "requires_prescription": False, "category_idx": 1},
            {"name": "Aspirine 500mg", "generic_name": "Acide acétylsalicylique", "manufacturer": "Bayer", "dosage": "500mg", "requires_prescription": False, "category_idx": 1},
            
            # Antifongiques
            {"name": "Fluconazole 150mg", "generic_name": "Fluconazole", "manufacturer": "Pfizer", "dosage": "150mg", "requires_prescription": True, "category_idx": 2},
            {"name": "Econazole Crème", "generic_name": "Econazole", "manufacturer": "Pevaryl", "dosage": "1%", "requires_prescription": False, "category_idx": 2},
            
            # Vitamines
            {"name": "Vitamine C 1000mg", "generic_name": "Acide ascorbique", "manufacturer": "Upsa", "dosage": "1000mg", "requires_prescription": False, "category_idx": 3},
            {"name": "Complexe Vitamine B", "generic_name": "Vitamines B", "manufacturer": "Bayer", "dosage": "Multi", "requires_prescription": False, "category_idx": 3},
            {"name": "Vitamine D3 2000UI", "generic_name": "Cholécalciférol", "manufacturer": "Zyma", "dosage": "2000UI", "requires_prescription": False, "category_idx": 3},
            
            # Digestifs
            {"name": "Oméprazole 20mg", "generic_name": "Oméprazole", "manufacturer": "EG", "dosage": "20mg", "requires_prescription": True, "category_idx": 4},
            {"name": "Charbon activé", "generic_name": "Charbon activé", "manufacturer": "Arkogélules", "dosage": "200mg", "requires_prescription": False, "category_idx": 4},
            {"name": "Diosmectite", "generic_name": "Diosmectite", "manufacturer": "Smecta", "dosage": "3g", "requires_prescription": False, "category_idx": 4},
            
            # Cardiovasculaire
            {"name": "Amlodipine 5mg", "generic_name": "Amlodipine", "manufacturer": "Pfizer", "dosage": "5mg", "requires_prescription": True, "category_idx": 5},
            {"name": "Atorvastatine 20mg", "generic_name": "Atorvastatine", "manufacturer": "Lipitor", "dosage": "20mg", "requires_prescription": True, "category_idx": 5},
        ]
        
        products = []
        products_created = 0
        for prod_data in products_data:
            category_idx = prod_data.pop("category_idx")
            
            # Vérifier si le produit existe déjà
            result = await db.execute(
                select(Product).where(
                    (Product.name == prod_data["name"]) & 
                    (Product.manufacturer == prod_data["manufacturer"])
                )
            )
            existing_product = result.scalar_one_or_none()
            
            if existing_product:
                products.append(existing_product)
                print(f"💊 Produit '{prod_data['name']}' existe déjà")
            else:
                product = Product(
                    **prod_data,
                    category_id=categories[category_idx].id,
                    active_ingredient=prod_data.get("generic_name", ""),
                    description=f"Médicament de la catégorie {categories[category_idx].name}",
                    contraindications="Voir notice",
                    side_effects="Voir notice"
                )
                db.add(product)
                products.append(product)
                products_created += 1
        
        if products_created > 0:
            await db.commit()
            print(f"✅ {products_created} nouveaux produits créés")
        else:
            print("✅ Tous les produits existent déjà")
        
        # 5. Créer l'inventaire avec sponsoring (vérifier s'il existe déjà)
        import random
        
        inventory_items = []
        inventory_created = 0
        sponsor_ranks = [10, 8, 6, 4, 2]  # Rangs de sponsoring
        
        # Assurer que tous les produits Paracétamol sont bien représentés dans l'inventaire
        paracetamol_products = [p for p in products if "paracétamol" in p.name.lower() or "paracétamol" in p.generic_name.lower()]
        
        # Chaque pharmacie a quelques produits en stock
        for pharmacy_idx, pharmacy in enumerate(pharmacies):
            # Chaque pharmacie a entre 12 et 16 produits (plus que before pour assurer la diversité)
            num_products = random.randint(12, 16)
            
            # Toujours inclure au moins 2 produits Paracétamol dans chaque pharmacie
            selected_products = []
            if paracetamol_products:
                # Sélectionner 2 produits Paracétamol aléatoirement
                paracetamol_selection = random.sample(paracetamol_products, min(2, len(paracetamol_products)))
                selected_products.extend(paracetamol_selection)
            
            # Compléter avec d'autres produits aléatoires
            remaining_products = [p for p in products if p not in selected_products]
            remaining_needed = max(0, num_products - len(selected_products))
            if remaining_needed > 0 and remaining_products:
                additional_products = random.sample(remaining_products, min(remaining_needed, len(remaining_products)))
                selected_products.extend(additional_products)
            
            for product_idx, product in enumerate(selected_products):
                # Vérifier si cet inventaire existe déjà
                result = await db.execute(
                    select(PharmacyInventory).where(
                        (PharmacyInventory.pharmacy_id == pharmacy.id) &
                        (PharmacyInventory.product_id == product.id)
                    )
                )
                existing_inventory = result.scalar_one_or_none()
                
                if existing_inventory:
                    inventory_items.append(existing_inventory)
                    print(f"📦 Inventaire '{product.name}' existe déjà pour {pharmacy.name}")
                    continue
                
                # Prix aléatoire entre 500 et 5000 FCFA
                base_price = random.uniform(500, 5000)
                price = Decimal(str(round(base_price, 2)))
                
                # Quantité aléatoire garantie > 0 (entre 5 et 50)
                quantity = random.randint(5, 50)
                
                # Sponsoring : 40% de chance d'être sponsorisé (augmenté pour plus de variété)
                is_sponsored = random.random() < 0.4
                sponsor_rank = random.choice(sponsor_ranks) if is_sponsored else 0
                sponsor_expires_at = datetime.utcnow() + timedelta(days=30) if is_sponsored else None
                
                inventory = PharmacyInventory(
                    pharmacy_id=pharmacy.id,
                    product_id=product.id,
                    quantity=quantity,
                    price=price,
                    expiry_date=datetime.utcnow().date() + timedelta(days=random.randint(30, 365)),
                    batch_number=f"LOT{pharmacy_idx:02d}{product_idx:03d}",
                    is_sponsored=is_sponsored,
                    sponsor_rank=sponsor_rank,
                    sponsor_expires_at=sponsor_expires_at
                )
                db.add(inventory)
                inventory_items.append(inventory)
                inventory_created += 1
        
        if inventory_created > 0:
            await db.commit()
            print(f"✅ {inventory_created} nouveaux éléments d'inventaire créés avec sponsoring")
        else:
            print("✅ Tous les éléments d'inventaire existent déjà")
        
        # Statistiques finales
        sponsored_items = sum(1 for item in inventory_items if item.is_sponsored)
        print(f"📊 Statistiques:")
        print(f"   - {sponsored_items}/{len(inventory_items)} produits sponsorisés ({sponsored_items/len(inventory_items)*100:.1f}%)")
        print(f"   - {len([p for p in pharmacies if p.is_verified])}/{len(pharmacies)} pharmacies vérifiées")
        print(f"   - {len([p for p in products if p.requires_prescription])}/{len(products)} produits sur ordonnance")
        
        print("\n🎉 Données de démo créées avec succès!")
        print("\n📋 Comptes de test:")
        for pharmacist in pharmacists:
            print(f"   - {pharmacist.email} / password123")


async def main():
    """Fonction principale"""
    try:
        # Créer les tables si nécessaire
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        await create_demo_data()
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des données: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())