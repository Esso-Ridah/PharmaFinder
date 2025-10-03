#!/usr/bin/env python3
"""
Script pour ajouter les catégories et produits parapharmacie
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal
from app.models import Category, Product
import uuid


async def add_parapharmacie_data():
    """Ajouter les données parapharmacie"""
    
    print("Ajout des catégories et produits parapharmacie...")
    
    async with AsyncSessionLocal() as db:
        # Créer les nouvelles catégories parapharmacie
        parapharmacie_categories = [
            Category(
                id=str(uuid.uuid4()),
                name="Cosmétiques Naturels",
                slug="cosmetiques-naturels",
                description="Produits de beauté à base d'ingrédients naturels africains",
                is_active=True
            ),
            Category(
                id=str(uuid.uuid4()),
                name="Beurres de Karité",
                slug="beurres-karite",
                description="Beurre de karité pur et produits dérivés du karité",
                is_active=True
            ),
            Category(
                id=str(uuid.uuid4()),
                name="Savons Traditionnels",
                slug="savons-traditionnels", 
                description="Savons artisanaux et traditionnels africains",
                is_active=True
            ),
            Category(
                id=str(uuid.uuid4()),
                name="Huiles Essentielles",
                slug="huiles-essentielles",
                description="Huiles essentielles et extraits de plantes africaines",
                is_active=True
            ),
            Category(
                id=str(uuid.uuid4()),
                name="Produits d'Hygiène Naturels",
                slug="hygiene-naturels",
                description="Produits d'hygiène à base d'ingrédients naturels",
                is_active=True
            )
        ]
        
        for category in parapharmacie_categories:
            db.add(category)
        
        await db.flush()  # Pour obtenir les IDs des catégories
        
        # Créer des produits parapharmacie
        parapharmacie_products = [
            Product(
                id=str(uuid.uuid4()),
                name="Beurre de Karité Pur Bio",
                generic_name="Beurre de Karité",
                barcode="3456789012400",
                category_id=parapharmacie_categories[1].id,  # Beurres de Karité
                description="Beurre de karité 100% pur, non raffiné, issu du commerce équitable. Hydrate et nourrit la peau en profondeur.",
                manufacturer="Coopérative Féminine de Kara",
                dosage="100g",
                requires_prescription=False,
                active_ingredient="Beurre de Vitellaria paradoxa",
                contraindications="Allergie aux noix",
                side_effects="Très rare: réactions allergiques cutanées",
                is_active=True
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Savon Noir Africain Authentique",
                generic_name="Savon Noir",
                barcode="3456789012401",
                category_id=parapharmacie_categories[2].id,  # Savons Traditionnels
                description="Savon noir traditionnel à base d'huile de palme et de cendres de plantain. Nettoie et purifie la peau.",
                manufacturer="Artisans du Sahel",
                dosage="150g",
                requires_prescription=False,
                active_ingredient="Huile de palme, cendres de plantain",
                contraindications="Peau très sensible",
                side_effects="Possible sécheresse si usage excessif",
                is_active=True
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Huile de Baobab Pressée à Froid",
                generic_name="Huile de Baobab",
                barcode="3456789012402",
                category_id=parapharmacie_categories[3].id,  # Huiles Essentielles
                description="Huile de baobab pure, pressée à froid, riche en vitamines A, D, E et F. Anti-âge naturel.",
                manufacturer="Bio Togo",
                dosage="50ml",
                requires_prescription=False,
                active_ingredient="Huile d'Adansonia digitata",
                contraindications="Allergie aux fruits à coque",
                side_effects="Aucun effet secondaire connu",
                is_active=True
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Crème Hydratante au Beurre de Karité",
                generic_name="Crème Hydratante",
                barcode="3456789012403",
                category_id=parapharmacie_categories[0].id,  # Cosmétiques Naturels
                description="Crème hydratante formulée avec du beurre de karité et des huiles végétales africaines.",
                manufacturer="NaturAfrica",
                dosage="200ml",
                requires_prescription=False,
                active_ingredient="Beurre de karité, huile de coco, huile d'argan",
                contraindications="Allergie aux composants",
                side_effects="Très rare: irritations cutanées",
                is_active=True
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Dentifrice aux Extraits de Néré",
                generic_name="Dentifrice Naturel",
                barcode="3456789012404",
                category_id=parapharmacie_categories[4].id,  # Produits d'Hygiène
                description="Dentifrice naturel aux extraits de néré, antiseptique et rafraîchissant.",
                manufacturer="Santé Naturelle Afrique",
                dosage="75ml",
                requires_prescription=False,
                active_ingredient="Extraits de Parkia biglobosa, argile blanche",
                contraindications="Enfants de moins de 3 ans",
                side_effects="Aucun effet secondaire connu",
                is_active=True
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Huile Capillaire aux 7 Huiles",
                generic_name="Huile Capillaire",
                barcode="3456789012405",
                category_id=parapharmacie_categories[0].id,  # Cosmétiques Naturels
                description="Mélange de 7 huiles africaines pour nourrir et fortifier les cheveux crépus et frisés.",
                manufacturer="Cheveux d'Afrique",
                dosage="100ml",
                requires_prescription=False,
                active_ingredient="Huiles de ricin, karité, coco, argan, baobab, moringa, avocat",
                contraindications="Cuir chevelu irrité",
                side_effects="Possible effet gras si utilisation excessive",
                is_active=True
            )
        ]
        
        for product in parapharmacie_products:
            db.add(product)
        
        await db.commit()
    
    print("✅ Catégories et produits parapharmacie ajoutés avec succès!")
    print("\n🛍️ Nouvelles catégories:")
    print("   - Cosmétiques Naturels")
    print("   - Beurres de Karité") 
    print("   - Savons Traditionnels")
    print("   - Huiles Essentielles")
    print("   - Produits d'Hygiène Naturels")
    print("\n🌿 6 produits exemple ajoutés:")
    print("   - Beurre de Karité Pur Bio")
    print("   - Savon Noir Africain Authentique")
    print("   - Huile de Baobab Pressée à Froid")
    print("   - Crème Hydratante au Beurre de Karité")
    print("   - Dentifrice aux Extraits de Néré")
    print("   - Huile Capillaire aux 7 Huiles")


if __name__ == "__main__":
    print("🌿 Ajout des données parapharmacie...")
    asyncio.run(add_parapharmacie_data())
    print("🎉 Parapharmacie configurée!")