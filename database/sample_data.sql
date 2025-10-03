-- Sample Data for Development and Demo
-- This file contains realistic sample data for Lomé, Togo

-- Insert categories
INSERT INTO categories (id, name, slug, description) VALUES
(uuid_generate_v4(), 'Médicaments sur ordonnance', 'prescription-medicines', 'Médicaments nécessitant une ordonnance médicale'),
(uuid_generate_v4(), 'Médicaments en vente libre', 'otc-medicines', 'Médicaments disponibles sans ordonnance'),
(uuid_generate_v4(), 'Parapharmacie', 'parapharmacy', 'Produits de soin et hygiène'),
(uuid_generate_v4(), 'Matériel médical', 'medical-equipment', 'Matériel et dispositifs médicaux'),
(uuid_generate_v4(), 'Compléments alimentaires', 'supplements', 'Vitamines et compléments nutritionnels');

-- Insert sample users
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role) VALUES
-- Clients
(uuid_generate_v4(), 'kofi.asante@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLrR7t4/hnJ3jJK', 'Kofi', 'Asante', '+228 90 12 34 56', 'client'),
(uuid_generate_v4(), 'ama.kone@yahoo.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLrR7t4/hnJ3jJK', 'Ama', 'Kone', '+228 91 23 45 67', 'client'),
(uuid_generate_v4(), 'kwame.doe@hotmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLrR7t4/hnJ3jJK', 'Kwame', 'Doe', '+228 92 34 56 78', 'client'),
-- Pharmacists
(uuid_generate_v4(), 'dr.mensah@pharmacielome.tg', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLrR7t4/hnJ3jJK', 'Dr. Samuel', 'Mensah', '+228 22 61 12 34', 'pharmacist'),
(uuid_generate_v4(), 'pharma.centrale@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLrR7t4/hnJ3jJK', 'Dr. Fatima', 'Alassane', '+228 22 62 23 45', 'pharmacist'),
(uuid_generate_v4(), 'sante.plus@yahoo.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLrR7t4/hnJ3jJK', 'Dr. Pierre', 'Akakpo', '+228 22 63 34 56', 'pharmacist'),
-- Admin
(uuid_generate_v4(), 'admin@pharmafinder.tg', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLrR7t4/hnJ3jJK', 'Admin', 'PharmaFinder', '+228 90 00 00 00', 'admin');

-- Insert sample pharmacies (realistic locations in Lomé)
INSERT INTO pharmacies (id, name, license_number, owner_id, address, latitude, longitude, phone, email, opening_hours, is_verified) VALUES
(
    uuid_generate_v4(), 
    'Pharmacie Centrale de Lomé',
    'PH-LOME-001',
    (SELECT id FROM users WHERE email = 'dr.mensah@pharmacielome.tg'),
    'Avenue du 24 Janvier, Centre-ville, Lomé',
    6.1319, 1.2228,
    '+228 22 61 12 34',
    'contact@pharmaciecentrale.tg',
    '{"lundi": "08:00-19:00", "mardi": "08:00-19:00", "mercredi": "08:00-19:00", "jeudi": "08:00-19:00", "vendredi": "08:00-19:00", "samedi": "08:00-17:00", "dimanche": "09:00-13:00"}',
    true
),
(
    uuid_generate_v4(),
    'Pharmacie du Grand Marché',
    'PH-LOME-002', 
    (SELECT id FROM users WHERE email = 'pharma.centrale@gmail.com'),
    'Rue du Grand Marché, Lomé',
    6.1275, 1.2184,
    '+228 22 62 23 45',
    'grandmarche@pharmacies.tg',
    '{"lundi": "07:30-20:00", "mardi": "07:30-20:00", "mercredi": "07:30-20:00", "jeudi": "07:30-20:00", "vendredi": "07:30-20:00", "samedi": "07:30-18:00", "dimanche": "08:00-14:00"}',
    true
),
(
    uuid_generate_v4(),
    'Pharmacie Santé Plus',
    'PH-LOME-003',
    (SELECT id FROM users WHERE email = 'sante.plus@yahoo.fr'),
    'Boulevard du 13 Janvier, Hédzranawoé, Lomé', 
    6.1403, 1.2314,
    '+228 22 63 34 56',
    'info@santeplus.tg',
    '{"lundi": "08:00-18:00", "mardi": "08:00-18:00", "mercredi": "08:00-18:00", "jeudi": "08:00-18:00", "vendredi": "08:00-18:00", "samedi": "08:00-16:00", "dimanche": "fermé"}',
    true
),
(
    uuid_generate_v4(),
    'Pharmacie de la Paix',
    'PH-LOME-004',
    (SELECT id FROM users WHERE email = 'dr.mensah@pharmacielome.tg'),
    'Rue de la Paix, Tokoin, Lomé',
    6.1544, 1.2086,
    '+228 22 64 45 67',
    'paix@pharmacies.tg',
    '{"lundi": "08:00-19:00", "mardi": "08:00-19:00", "mercredi": "08:00-19:00", "jeudi": "08:00-19:00", "vendredi": "08:00-19:00", "samedi": "08:00-17:00", "dimanche": "09:00-13:00"}',
    true
);

-- Insert sample products (common medicines in Togo)
INSERT INTO products (id, name, generic_name, category_id, description, manufacturer, dosage, requires_prescription, active_ingredient) VALUES
-- Prescription medicines
(
    uuid_generate_v4(),
    'Amoxicilline 500mg',
    'Amoxicilline',
    (SELECT id FROM categories WHERE slug = 'prescription-medicines'),
    'Antibiotique à large spectre',
    'Sanofi',
    '500mg - Boîte de 12 gélules',
    true,
    'Amoxicilline trihydratée'
),
(
    uuid_generate_v4(), 
    'Paracétamol 1000mg',
    'Paracétamol',
    (SELECT id FROM categories WHERE slug = 'prescription-medicines'),
    'Antalgique et antipyrétique',
    'GSK',
    '1000mg - Boîte de 8 comprimés',
    true,
    'Paracétamol'
),
(
    uuid_generate_v4(),
    'Artémether + Luméfantrine',
    'Coartem',
    (SELECT id FROM categories WHERE slug = 'prescription-medicines'),
    'Traitement antipaludique',
    'Novartis',
    '20mg/120mg - Boîte de 24 comprimés',
    true,
    'Artémether + Luméfantrine'
),
-- OTC medicines
(
    uuid_generate_v4(),
    'Doliprane 500mg',
    'Paracétamol',
    (SELECT id FROM categories WHERE slug = 'otc-medicines'),
    'Antalgique et antipyrétique sans ordonnance',
    'Sanofi',
    '500mg - Boîte de 16 comprimés',
    false,
    'Paracétamol'
),
(
    uuid_generate_v4(),
    'Ibuprofène 200mg',
    'Ibuprofène',
    (SELECT id FROM categories WHERE slug = 'otc-medicines'),
    'Anti-inflammatoire non stéroïdien',
    'Advil',
    '200mg - Boîte de 20 comprimés',
    false,
    'Ibuprofène'
),
(
    uuid_generate_v4(),
    'Sérum Physiologique',
    'Chlorure de sodium',
    (SELECT id FROM categories WHERE slug = 'otc-medicines'),
    'Solution pour lavage nasal et oculaire',
    'Gilbert',
    '5ml x 20 unidoses',
    false,
    'Chlorure de sodium 0,9%'
),
-- Parapharmacy
(
    uuid_generate_v4(),
    'Crème Hydratante Nivea',
    'Crème corporelle',
    (SELECT id FROM categories WHERE slug = 'parapharmacy'),
    'Crème hydratante pour peaux sèches',
    'Nivea',
    'Tube 200ml',
    false,
    'Glycérine, Panthénol'
),
(
    uuid_generate_v4(),
    'Shampoing Johnson\'s Baby',
    'Shampoing bébé',
    (SELECT id FROM categories WHERE slug = 'parapharmacy'),
    'Shampoing doux pour bébés',
    'Johnson & Johnson',
    'Flacon 300ml',
    false,
    'Formule douce sans larmes'
),
-- Medical equipment
(
    uuid_generate_v4(),
    'Thermomètre Digital',
    'Thermomètre médical',
    (SELECT id FROM categories WHERE slug = 'medical-equipment'),
    'Thermomètre électronique de précision',
    'Omron',
    'Digital avec écran LCD',
    false,
    'Capteur de température numérique'
),
(
    uuid_generate_v4(),
    'Tensiomètre Automatique',
    'Appareil de mesure tension',
    (SELECT id FROM categories WHERE slug = 'medical-equipment'),
    'Tensiomètre automatique au bras',
    'Omron',
    'Brassard adulte standard',
    false,
    'Mesure oscillométrique'
);

-- Insert inventory for pharmacies (realistic stock levels)
DO $$
DECLARE
    pharmacy_record RECORD;
    product_record RECORD;
BEGIN
    -- For each pharmacy
    FOR pharmacy_record IN SELECT id FROM pharmacies LOOP
        -- For each product, add random inventory
        FOR product_record IN SELECT id FROM products LOOP
            INSERT INTO pharmacy_inventory (pharmacy_id, product_id, quantity, price, expiry_date, batch_number)
            VALUES (
                pharmacy_record.id,
                product_record.id,
                FLOOR(RANDOM() * 50 + 10)::INTEGER, -- Random quantity between 10-60
                CASE 
                    WHEN RANDOM() < 0.3 THEN FLOOR(RANDOM() * 5000 + 1000) -- 1000-6000 XOF for expensive items
                    WHEN RANDOM() < 0.7 THEN FLOOR(RANDOM() * 3000 + 500)  -- 500-3500 XOF for medium items  
                    ELSE FLOOR(RANDOM() * 1500 + 200) -- 200-1700 XOF for cheap items
                END,
                CURRENT_DATE + INTERVAL '6 months' + (RANDOM() * INTERVAL '2 years')::INTERVAL,
                'BATCH-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0')
            );
        END LOOP;
    END LOOP;
END $$;

-- Insert sample client addresses
INSERT INTO client_addresses (user_id, label, address, latitude, longitude, is_default) VALUES
(
    (SELECT id FROM users WHERE email = 'kofi.asante@gmail.com'),
    'Domicile',
    'Quartier Nyékonakpoé, Rue 15, Lomé',
    6.1682, 1.2318,
    true
),
(
    (SELECT id FROM users WHERE email = 'ama.kone@yahoo.fr'),
    'Domicile', 
    'Quartier Adidogomé, Carré 450, Lomé',
    6.1845, 1.1967,
    true
),
(
    (SELECT id FROM users WHERE email = 'kwame.doe@hotmail.com'),
    'Bureau',
    'Zone Administrative, Boulevard du Mono, Lomé',
    6.1372, 1.2125,
    true
);

-- Insert system configuration
INSERT INTO system_config (key, value, description) VALUES
('delivery_fee_per_km', '100', 'Frais de livraison par kilomètre en XOF'),
('max_delivery_distance', '15', 'Distance maximale de livraison en km'),
('pickup_code_expiry', '24', 'Durée de validité du code de retrait en heures'),
('min_order_amount', '1000', 'Montant minimum de commande en XOF'),
('platform_commission', '0.05', 'Commission de la plateforme (5%)'),
('supported_payment_methods', '["stripe", "paypal", "cash"]', 'Méthodes de paiement supportées'),
('emergency_pharmacies', '["PH-LOME-001", "PH-LOME-002"]', 'Pharmacies de garde'),
('app_maintenance_mode', 'false', 'Mode maintenance de l\'application');

-- Sample orders (for testing)
INSERT INTO orders (id, order_number, client_id, pharmacy_id, delivery_address_id, delivery_type, status, total_amount, pickup_code, notes) VALUES
(
    uuid_generate_v4(),
    'PF' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '001',
    (SELECT id FROM users WHERE email = 'kofi.asante@gmail.com'),
    (SELECT id FROM pharmacies WHERE name = 'Pharmacie Centrale de Lomé'),
    (SELECT id FROM client_addresses WHERE user_id = (SELECT id FROM users WHERE email = 'kofi.asante@gmail.com')),
    'pickup',
    'ready',
    2500,
    '123456',
    'Commande urgente - Paludisme'
),
(
    uuid_generate_v4(),
    'PF' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '002', 
    (SELECT id FROM users WHERE email = 'ama.kone@yahoo.fr'),
    (SELECT id FROM pharmacies WHERE name = 'Pharmacie du Grand Marché'),
    (SELECT id FROM client_addresses WHERE user_id = (SELECT id FROM users WHERE email = 'ama.kone@yahoo.fr')),
    'home_delivery',
    'confirmed',
    1800,
    NULL,
    'Livraison à domicile'
);