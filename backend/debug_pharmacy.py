#!/usr/bin/env python3
"""
Script to debug pharmacy issue
"""

import asyncio
import sys
import os

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import Pharmacy, PharmacyInventory, Product
from app.database import AsyncSessionLocal
from sqlalchemy import select

async def debug_pharmacy():
    """Debug pharmacy issue"""
    async with AsyncSessionLocal() as db:
        try:
            # First, get all pharmacies
            result = await db.execute(select(Pharmacy))
            pharmacies = result.scalars().all()

            print(f"Found {len(pharmacies)} pharmacies:")
            for pharmacy in pharmacies:
                print(f"  ID: {pharmacy.id}")
                print(f"  Name: {pharmacy.name}")
                print(f"  Address: {pharmacy.address}")
                print("---")

            # Test if specific pharmacy exists
            pharmacy_id = "2f9cc224-2a87-4f84-89b5-872e007fdc05"
            result = await db.execute(
                select(Pharmacy).where(Pharmacy.id == pharmacy_id)
            )
            pharmacy = result.scalar_one_or_none()

            print(f"\nLooking for pharmacy {pharmacy_id}:")
            if pharmacy:
                print(f"✅ Found: {pharmacy.name}")

                # Now check inventory
                inventory_result = await db.execute(
                    select(PharmacyInventory).where(PharmacyInventory.pharmacy_id == pharmacy_id)
                )
                inventory_items = inventory_result.scalars().all()
                print(f"  Inventory items: {len(inventory_items)}")

                for item in inventory_items[:5]:  # Show first 5
                    print(f"    Product ID: {item.product_id}, Quantity: {item.quantity}")

            else:
                print("❌ NOT FOUND")

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    print("🔍 Debugging pharmacy issue...")
    asyncio.run(debug_pharmacy())