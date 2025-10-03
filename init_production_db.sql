-- ============================================
-- PharmaFinder - Script d'initialisation de la base de données
-- Version: 1.0.0
-- Date: 2025-10-03
-- ============================================
--
-- Ce script contient toutes les données de démo utilisées en développement local
-- Il crée la structure complète de la base de données avec :
-- - Utilisateurs de test (clients, pharmaciens, admin)
-- - Catégories de médicaments
-- - Produits et médicaments de démo
-- - Pharmacies de test
-- - Inventaire initial
--
-- UTILISATION:
-- Pour SQLite: sqlite3 pharmafinder.db < init_production_db.sql
-- Pour PostgreSQL: psql -U user -d pharmafinder < init_production_db.sql (après adaptation)
--
-- ============================================

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
	id VARCHAR(36) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	first_name VARCHAR(100) NOT NULL, 
	last_name VARCHAR(100) NOT NULL, 
	phone VARCHAR(20), 
	role VARCHAR(10) NOT NULL, 
	is_active BOOLEAN, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id)
);
INSERT INTO users VALUES('35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','pharmacie.centrale@gmail.com','$2b$12$lxm5eDIEtPYpoj/oKmrVUOre1RYcV2uBv3Wt.SRTP7dSG7kMgUAg2','Marie','Dupont','+228 22 45 67 89','PHARMACIST',1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO users VALUES('db0deea7-6c2b-4a43-b211-77a8469def4d','pharmacie.nord@gmail.com','$2b$12$Zg1ceWS23yFgrCZb2Xo5POgzeCtX0OTznzFv0MoWJwWbLjZoTPC36','Jean','Martin','+228 22 55 77 99','PHARMACIST',1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO users VALUES('f48ae86e-b298-4efb-bd8f-ae58133ccb19','pharmacie.sud@gmail.com','$2b$12$XLvFJkqRjxH9i1fKxp8/j.EgJfCYP7vsYBJ8FJOIsbDHqywowEc3q','Fatou','Kone','+228 22 33 44 55','PHARMACIST',1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO users VALUES('219e320f-c8ee-416f-b75a-6acfc2707e51','pharmacie.ouest@gmail.com','$2b$12$0/z5NjIZ4FHkWMwQGeLKTuTvWDmJFX6rPFj3/dUgMNRghIZK5jSua','Paul','Adjovi','+228 22 66 88 00','PHARMACIST',1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO users VALUES('060eb8ea-4746-4965-a455-43aca92abb3e','pharmacie.est@gmail.com','$2b$12$Wml8Za92EJyBjd/hl3uflurHBAKfvz5lIKMVVaYXf30do.OjeEKCa','Ama','Togo','+228 22 77 99 11','PHARMACIST',1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO users VALUES('50a203a2-ab95-4778-82bb-cf765802bbc4','kofi.asante@gmail.com','$2b$12$wmo/IJgrkBMMFS.fvpvkqOQ9l/YsybLUA26AUezAbqSDvjRGDcQ0a','Kofi','Asante','+228 90 12 34 56','CLIENT',1,'2025-09-22T11:41:31.093329','2025-09-22T11:41:31.093382');
INSERT INTO users VALUES('d0058da0-eced-4cfc-9db7-53c9f6077547','test@exemple.com','$2b$12$XNxPWoUGzWLmPwLIRHb6xeNeOrhcOfPpVEkx5KOijWkd4Az82kyc6','Test','User',NULL,'CLIENT',1,'2025-09-25T05:30:48.188703','2025-09-25T05:30:48.188703');
INSERT INTO users VALUES('a19f14e9-69ee-45b0-a4a5-b01821dc0624','testuser@example.com','$2b$12$PrywbKMywQn0gTdGv08ZmeciAn/M5feb2MZcj9FvAiHKQw0uNsEiu','Test','User',NULL,'CLIENT',1,'2025-10-01 16:57:48','2025-10-01 16:57:48');
INSERT INTO users VALUES('97399188-85da-47da-b370-4ce996f1efbf','yaya@gmail.com','$2b$12$TI2IZEyOyy69rvwSceq/a.4JEOGUgphJWgCaS8A7MfTKJTv2YEXcK','yaya','KAL','','PHARMACIST',1,'2025-10-03 12:29:33','2025-10-03 12:29:33');
INSERT INTO users VALUES('25a0871e-f867-46a3-8566-1c59f16d0013','kat@gmail.com','$2b$12$//xjfDqdxvNlfvzzUAzGD.cTjlefmhWMrJbVPdevf7u9BGCAA6V3W','Kat','Sio','','CLIENT',1,'2025-10-03 12:34:38','2025-10-03 12:34:38');
CREATE TABLE categories (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	slug VARCHAR(100) NOT NULL, 
	description TEXT, 
	parent_id VARCHAR(36), 
	is_active BOOLEAN, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (slug), 
	FOREIGN KEY(parent_id) REFERENCES categories (id) ON DELETE CASCADE
);
INSERT INTO categories VALUES('fc6518ed-10ec-4dcd-9ada-8c113c3a6423','Antibiotiques','antibiotiques','Médicaments contre les infections',NULL,1,'2025-09-19 23:31:47');
INSERT INTO categories VALUES('d47d3c50-c32c-4609-a64a-6616b4930d1b','Antalgiques','antalgiques','Médicaments contre la douleur',NULL,1,'2025-09-19 23:31:47');
INSERT INTO categories VALUES('18340592-7dc9-4ab3-bb1d-f24bd602a94d','Antifongiques','antifongiques','Traitement des mycoses',NULL,1,'2025-09-19 23:31:47');
INSERT INTO categories VALUES('7880591b-7825-4098-ab01-16bc5e21e748','Vitamines','vitamines','Compléments vitaminiques',NULL,1,'2025-09-19 23:31:47');
INSERT INTO categories VALUES('fb4604eb-b360-4131-a317-191bb3d57a5e','Digestifs','digestifs','Troubles digestifs',NULL,1,'2025-09-19 23:31:47');
INSERT INTO categories VALUES('ab91710b-4733-4169-b339-0ef7876b07d7','Cardiovasculaire','cardiovasculaire','Santé du cœur',NULL,1,'2025-09-19 23:31:47');
CREATE TABLE system_config (
	id VARCHAR(36) NOT NULL, 
	"key" VARCHAR(100) NOT NULL, 
	value JSON NOT NULL, 
	description TEXT, 
	updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE ("key")
);
CREATE TABLE pharmacies (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(200) NOT NULL, 
	license_number VARCHAR(50) NOT NULL, 
	owner_id VARCHAR(36), 
	address TEXT NOT NULL, 
	city VARCHAR(100) NOT NULL, 
	country VARCHAR(100) NOT NULL, 
	latitude NUMERIC(10, 8), 
	longitude NUMERIC(11, 8), 
	phone VARCHAR(20), 
	email VARCHAR(255), 
	opening_hours JSON, 
	is_active BOOLEAN, 
	is_verified BOOLEAN, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (license_number), 
	FOREIGN KEY(owner_id) REFERENCES users (id) ON DELETE CASCADE
);
INSERT INTO pharmacies VALUES('2f9cc224-2a87-4f84-89b5-872e007fdc05','Pharmacie Centrale','PH-001-LM','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','123 Avenue de la Paix, Lomé','Lomé','Togo',6.1318999999999999,1.2228000000000001,'+228 22 45 67 89',NULL,NULL,1,1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO pharmacies VALUES('514bbe24-7e6a-4aaa-b67a-8050776f8f17','Pharmacie du Nord','PH-002-LM','db0deea7-6c2b-4a43-b211-77a8469def4d','456 Rue de Tokoin, Lomé','Lomé','Togo',6.1628999999999996,1.23059999999999991,'+228 22 55 77 99',NULL,NULL,1,1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO pharmacies VALUES('8c8697ae-d251-48cf-a654-02c13d7c27b3','Pharmacie du Sud','PH-003-LM','f48ae86e-b298-4efb-bd8f-ae58133ccb19','789 Boulevard Nyékonakpoé, Lomé','Lomé','Togo',6.10829999999999984,1.21249999999999991,'+228 22 33 44 55',NULL,NULL,1,1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO pharmacies VALUES('e4e73de2-1c96-47b2-94ed-a35200ff7c17','Pharmacie de l''Ouest','PH-004-LM','219e320f-c8ee-416f-b75a-6acfc2707e51','321 Rue d''Amoutivé, Lomé','Lomé','Togo',6.14499999999999957,1.19779999999999997,'+228 22 66 88 00',NULL,NULL,1,0,'2025-09-19 23:31:50','2025-09-19 23:31:50');
INSERT INTO pharmacies VALUES('6acaeb73-f048-47f2-a874-b319a0540e01','Pharmacie de l''Est','PH-005-LM','060eb8ea-4746-4965-a455-43aca92abb3e','654 Avenue d''Adidogomé, Lomé','Lomé','Togo',6.16999999999999992,1.25,'+228 22 77 99 11',NULL,NULL,1,1,'2025-09-19 23:31:50','2025-09-19 23:31:50');
CREATE TABLE products (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(200) NOT NULL, 
	generic_name VARCHAR(200), 
	barcode VARCHAR(50), 
	category_id VARCHAR(36), 
	description TEXT, 
	manufacturer VARCHAR(200), 
	dosage VARCHAR(100), 
	requires_prescription BOOLEAN, 
	active_ingredient TEXT, 
	contraindications TEXT, 
	side_effects TEXT, 
	is_active BOOLEAN, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(category_id) REFERENCES categories (id) ON DELETE SET NULL
);
INSERT INTO products VALUES('0fd85c04-0a8e-4484-bdf3-539b3493ac73','Amoxicilline 500mg','Amoxicilline',NULL,'fc6518ed-10ec-4dcd-9ada-8c113c3a6423','Médicament de la catégorie Antibiotiques','Biogaran','500mg',1,'Amoxicilline','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('61c88757-f523-4cbb-b97b-dfbd59be9f4b','Azithromycine 250mg','Azithromycine',NULL,'fc6518ed-10ec-4dcd-9ada-8c113c3a6423','Médicament de la catégorie Antibiotiques','Sandoz','250mg',1,'Azithromycine','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','Cefixime 200mg','Cefixime',NULL,'fc6518ed-10ec-4dcd-9ada-8c113c3a6423','Médicament de la catégorie Antibiotiques','Teva','200mg',1,'Cefixime','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('a89e083f-9021-4856-9e7c-89c1bf48cb09','Paracétamol 1000mg','Paracétamol',NULL,'d47d3c50-c32c-4609-a64a-6616b4930d1b','Médicament de la catégorie Antalgiques','Doliprane','1000mg',0,'Paracétamol','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('8817b823-40e4-4536-b5b9-bd3240f54777','Ibuprofène 400mg','Ibuprofène',NULL,'d47d3c50-c32c-4609-a64a-6616b4930d1b','Médicament de la catégorie Antalgiques','Advil','400mg',0,'Ibuprofène','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('9a71cdad-66a8-470a-8fbf-b5048976a579','Aspirine 500mg','Acide acétylsalicylique',NULL,'d47d3c50-c32c-4609-a64a-6616b4930d1b','Médicament de la catégorie Antalgiques','Bayer','500mg',0,'Acide acétylsalicylique','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('d1be1968-a671-4650-8d8f-e3bb988f4470','Fluconazole 150mg','Fluconazole',NULL,'18340592-7dc9-4ab3-bb1d-f24bd602a94d','Médicament de la catégorie Antifongiques','Pfizer','150mg',1,'Fluconazole','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('fda09546-58d9-4c78-905f-039632964766','Econazole Crème','Econazole',NULL,'18340592-7dc9-4ab3-bb1d-f24bd602a94d','Médicament de la catégorie Antifongiques','Pevaryl','1%',0,'Econazole','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('4f0bc6a7-7247-41e7-8826-0c71b2ddb56e','Vitamine C 1000mg','Acide ascorbique',NULL,'7880591b-7825-4098-ab01-16bc5e21e748','Médicament de la catégorie Vitamines','Upsa','1000mg',0,'Acide ascorbique','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('d0aa6824-f8a8-4d90-9a51-619c58a97a5f','Complexe Vitamine B','Vitamines B',NULL,'7880591b-7825-4098-ab01-16bc5e21e748','Médicament de la catégorie Vitamines','Bayer','Multi',0,'Vitamines B','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('e8acc5bd-31ec-4102-afc8-573c45be5cea','Vitamine D3 2000UI','Cholécalciférol',NULL,'7880591b-7825-4098-ab01-16bc5e21e748','Médicament de la catégorie Vitamines','Zyma','2000UI',0,'Cholécalciférol','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('17a5ad06-bf30-4dd4-8353-1ea6fca4147a','Oméprazole 20mg','Oméprazole',NULL,'fb4604eb-b360-4131-a317-191bb3d57a5e','Médicament de la catégorie Digestifs','EG','20mg',1,'Oméprazole','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('7f237755-f3ab-40f8-8833-0173a99ff883','Charbon activé','Charbon activé',NULL,'fb4604eb-b360-4131-a317-191bb3d57a5e','Médicament de la catégorie Digestifs','Arkogélules','200mg',0,'Charbon activé','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('ef11d549-c4ca-4c2a-88e9-99fd857f1d6b','Diosmectite','Diosmectite',NULL,'fb4604eb-b360-4131-a317-191bb3d57a5e','Médicament de la catégorie Digestifs','Smecta','3g',0,'Diosmectite','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('9b7f8f3a-f773-4f23-854f-72ce2b1c7538','Amlodipine 5mg','Amlodipine',NULL,'ab91710b-4733-4169-b339-0ef7876b07d7','Médicament de la catégorie Cardiovasculaire','Pfizer','5mg',1,'Amlodipine','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('90ef68e3-5261-46e4-81ba-67e93a7fb80c','Atorvastatine 20mg','Atorvastatine',NULL,'ab91710b-4733-4169-b339-0ef7876b07d7','Médicament de la catégorie Cardiovasculaire','Lipitor','20mg',1,'Atorvastatine','Voir notice','Voir notice',1,'2025-09-19 23:31:51','2025-09-19 23:31:51');
INSERT INTO products VALUES('9da4256f-5698-40e4-a2a0-a437bffea03c','Paracétamol 500mg','Paracétamol',NULL,'d47d3c50-c32c-4609-a64a-6616b4930d1b','Médicament de la catégorie Antalgiques','Dafalgan','500mg',0,'Paracétamol','Voir notice','Voir notice',1,'2025-09-20 00:32:46','2025-09-20 00:32:46');
INSERT INTO products VALUES('ab4d47ac-d50c-4388-9a4a-0be65467b438','Paracétamol Effervescent 1000mg','Paracétamol',NULL,'d47d3c50-c32c-4609-a64a-6616b4930d1b','Médicament de la catégorie Antalgiques','Efferalgan','1000mg',0,'Paracétamol','Voir notice','Voir notice',1,'2025-09-20 00:32:46','2025-09-20 00:32:46');
INSERT INTO products VALUES('6856d9af-db3c-4f64-903a-517c2d4cdb1f','Paracétamol Pédiatrique 120mg','Paracétamol',NULL,'d47d3c50-c32c-4609-a64a-6616b4930d1b','Médicament de la catégorie Antalgiques','Doliprane','120mg',0,'Paracétamol','Voir notice','Voir notice',1,'2025-09-20 00:32:46','2025-09-20 00:32:46');
CREATE TABLE client_addresses (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	label VARCHAR(50), 
	address TEXT NOT NULL, 
	city VARCHAR(100) NOT NULL, 
	latitude NUMERIC(10, 8), 
	longitude NUMERIC(11, 8), 
	is_default BOOLEAN, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), address_type VARCHAR(20) DEFAULT 'modern', street_address TEXT, neighborhood VARCHAR(100), landmark_description TEXT, delivery_phone VARCHAR(20), delivery_instructions TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);
INSERT INTO client_addresses VALUES('c00efb08-3743-441e-be6d-0c1514673b11','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8931101, 1.9130038 - Abidjan','Abidjan',47.8931101000000012,1.91300380000000003,0,'2025-10-01 22:49:25','gps','','','','+228787744512','');
INSERT INTO client_addresses VALUES('94dc9f87-a40c-4e61-979a-f1c5ae62f0bb','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8969856, 1.9103744 - Abidjan','Abidjan',47.8969856000000007,1.91037440000000002,0,'2025-10-01 23:38:44','gps','','','','+22872022355','');
INSERT INTO client_addresses VALUES('37879ebb-3e99-4bc7-aa43-6fc4acb31fbd','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8930853, 1.9130065 - Abidjan','Abidjan',47.8930853000000027,1.91300650000000005,0,'2025-10-02 07:49:11','gps','','','','+22870846523','');
INSERT INTO client_addresses VALUES('e1e563e8-db8b-4038-a35e-9d260777f7c2','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','hotêl plateau, Abidjan','Abidjan',NULL,NULL,0,'2025-10-02 07:50:48','description','','','hotêl plateau','+22870253324','');
INSERT INTO client_addresses VALUES('ef3b6710-8e19-4b48-a851-f9554ab3c5ac','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','bar la douceur, Abidjan','Abidjan',NULL,NULL,0,'2025-10-02 07:52:36','description','','','bar la douceur','+22892547465','');
INSERT INTO client_addresses VALUES('21aea001-f2aa-49ca-8a02-4a3513f97a07','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8924749, 1.9132985 - Abidjan','Abidjan',47.8924749000000034,1.91329850000000001,0,'2025-10-02 08:10:35','gps','','','','+22598789951','');
INSERT INTO client_addresses VALUES('fc97c62a-7c90-41c2-86bc-dc39a69af005','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8927434, 1.913028 - Abidjan','Abidjan',47.8927434000000005,1.91302799999999995,0,'2025-10-02 09:08:57','gps','','','','22855588','');
INSERT INTO client_addresses VALUES('fa1d536e-00b7-4cac-9d18-7821c044b22a','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8928605, 1.9129697 - Abidjan','Abidjan',47.8928604999999976,1.9129697000000001,0,'2025-10-02 09:15:23','gps','','','','225456698245','');
INSERT INTO client_addresses VALUES('c37b756f-03d5-4315-9b6c-56ad73da1c4e','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8927956, 1.9129522 - Abidjan','Abidjan',47.8927955999999994,1.9129522000000001,0,'2025-10-02 09:22:32','gps','','','','22892456855','');
INSERT INTO client_addresses VALUES('c448786d-6033-47c3-9c2c-9acb68cea9a4','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8928732, 1.9129485 - Abidjan','Abidjan',47.8928731999999968,1.91294849999999994,0,'2025-10-02 09:57:26','gps','','','','22878995634','');
INSERT INTO client_addresses VALUES('ed224009-846d-4e0d-9fdc-1c45417785b5','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8930718, 1.9129939 - Abidjan','Abidjan',47.8930718000000012,1.91299390000000002,0,'2025-10-02 10:41:59','gps','','','','22898774524','');
INSERT INTO client_addresses VALUES('5726450e-f90d-49a3-8b98-65e77fdeecae','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.0810624, 2.3986176 - Abidjan','Abidjan',47.0810624000000004,2.39861760000000012,0,'2025-10-03 07:52:59','gps','','','','22587899966','');
INSERT INTO client_addresses VALUES('767abaf6-2e58-42c9-a1ea-1a81219fb9bb','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8930302, 1.9130087 - Abidjan','Abidjan',47.8930301999999983,1.9130087,0,'2025-10-03 11:31:02','gps','','','','+22255558945','');
INSERT INTO client_addresses VALUES('cab07cbe-b0e0-420f-8acb-f71e00befbe5','d0058da0-eced-4cfc-9db7-53c9f6077547','Nouvelle adresse','Position GPS: 47.8930885, 1.913045 - Abidjan','Abidjan',47.8930884999999975,1.9130450000000001,0,'2025-10-03 11:44:56','gps','','','','225878445568','');
CREATE TABLE notifications (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	type VARCHAR(50) NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	message TEXT NOT NULL, 
	is_read BOOLEAN, 
	meta_data JSON, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);
INSERT INTO notifications VALUES('bdf9afea-d1c8-408f-bf86-75ee05391fd3','219e320f-c8ee-416f-b75a-6acfc2707e51','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "dcec0d5d-17aa-4f95-89b8-4c4481e9fbf2", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 15:21:55');
INSERT INTO notifications VALUES('e5d5acbd-3d0a-4df9-be41-5458e2abf556','219e320f-c8ee-416f-b75a-6acfc2707e51','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "18fa6c9e-6c56-4230-abd6-248d0b9fb93e", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 15:22:22');
INSERT INTO notifications VALUES('1eee265b-b9de-4ea2-be10-bce7ff5fe3f2','060eb8ea-4746-4965-a455-43aca92abb3e','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "bfd958f3-ec7b-45f5-b02b-0a67ef3bfa98", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 15:23:11');
INSERT INTO notifications VALUES('866e0b82-9fc5-476b-b8a0-517659120080','060eb8ea-4746-4965-a455-43aca92abb3e','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "69580056-7cb4-4413-8ad6-394dd5d4f99b", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 15:23:17');
INSERT INTO notifications VALUES('44be4039-ccc4-455d-a097-2e46dc0488bf','060eb8ea-4746-4965-a455-43aca92abb3e','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "d9ba8387-4426-4cea-8b96-e6c21783799b", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 15:31:28');
INSERT INTO notifications VALUES('27c16385-7100-4970-ad21-21edda0dbb0a','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "27b050b5-ddc8-4286-a222-546adcb1c0d1", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 15:31:47');
INSERT INTO notifications VALUES('98909e97-7cbb-4874-b8b5-f800110bbf2d','219e320f-c8ee-416f-b75a-6acfc2707e51','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "7138d363-db14-4848-a69f-89a3e723e149", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 15:32:43');
INSERT INTO notifications VALUES('12661807-2dc3-4ecc-87a2-957292e9648f','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "8492eac6-27b8-4d0d-82df-15b7c085a5eb", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 20:56:36');
INSERT INTO notifications VALUES('d4aa2a4b-5de0-4258-b0b7-e56fa4c3ceb0','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "3a6a644f-2707-421f-b838-979d451bf1ce", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-25 21:10:31');
INSERT INTO notifications VALUES('1833c979-62b5-4ce1-96fa-8314d151c866','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Cefixime 200mg" a expiré. La pharmacie Pharmacie Centrale n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "8492eac6-27b8-4d0d-82df-15b7c085a5eb", "pharmacy_name": "Pharmacie Centrale", "product_name": "Cefixime 200mg", "action": "expired"}','2025-09-25 21:11:57.379209');
INSERT INTO notifications VALUES('1a30b2d0-194d-422d-ab69-8df0fd35fb8d','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Cefixime 200mg" a expiré. La pharmacie Pharmacie Centrale n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "3a6a644f-2707-421f-b838-979d451bf1ce", "pharmacy_name": "Pharmacie Centrale", "product_name": "Cefixime 200mg", "action": "expired"}','2025-09-25 21:25:57.609078');
INSERT INTO notifications VALUES('4aa89c84-7272-4cef-9354-1b02fbbacbff','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "16afac94-d099-468a-a8db-7d0838f21201", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-26 03:21:32');
INSERT INTO notifications VALUES('25df9066-3bd2-4df1-baa1-dd69eaf18c14','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Cefixime 200mg" a expiré. La pharmacie Pharmacie Centrale n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "16afac94-d099-468a-a8db-7d0838f21201", "pharmacy_name": "Pharmacie Centrale", "product_name": "Cefixime 200mg", "action": "expired"}','2025-09-26 03:36:35.252228');
INSERT INTO notifications VALUES('dfe2cbc4-8914-46bc-9981-d6aa87300163','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "caea50be-5c2f-49db-b3ff-18e16755da74", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-26 03:50:14');
INSERT INTO notifications VALUES('47631549-4155-4435-b71a-c28638d5c340','db0deea7-6c2b-4a43-b211-77a8469def4d','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "0863abb7-a09a-4ba7-8bbc-77e56b32aab0", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-26 03:51:25');
INSERT INTO notifications VALUES('47819169-c832-4b4d-b6c0-b457d5b1a7ff','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Cefixime 200mg" a expiré. La pharmacie Pharmacie Centrale n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "caea50be-5c2f-49db-b3ff-18e16755da74", "pharmacy_name": "Pharmacie Centrale", "product_name": "Cefixime 200mg", "action": "expired"}','2025-09-26 04:00:41.675855');
INSERT INTO notifications VALUES('ed5caa34-417e-4299-bb89-9ea186902133','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Cefixime 200mg" a expiré. La pharmacie Pharmacie du Nord n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "0863abb7-a09a-4ba7-8bbc-77e56b32aab0", "pharmacy_name": "Pharmacie du Nord", "product_name": "Cefixime 200mg", "action": "expired"}','2025-09-26 04:01:41.696932');
INSERT INTO notifications VALUES('11ca5265-7115-43cd-8ab0-802f3101e96e','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline 500mg" a expiré. La pharmacie Pharmacie Centrale n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',0,'{"prescription_request_id": "8ee02272-c2c2-49f5-981b-b827ecd1c1ba", "pharmacy_name": "Pharmacie Centrale", "product_name": "Amoxicilline 500mg", "action": "expired"}','2025-09-26 04:06:04.187407');
INSERT INTO notifications VALUES('5cabf279-0d05-466f-a27d-26ea725e83fd','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline 500mg" a expiré. La pharmacie Pharmacie Centrale n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',0,'{"prescription_request_id": "34bc59be-f137-4f42-a361-1144d6ad1d0d", "pharmacy_name": "Pharmacie Centrale", "product_name": "Amoxicilline 500mg", "action": "expired"}','2025-09-26 04:07:30.438222');
INSERT INTO notifications VALUES('5829567b-c9a4-4154-a549-5df9c797157a','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 04:08:16.519455');
INSERT INTO notifications VALUES('a8ff5ab2-fb8b-4f8c-a829-ff8ea59bfe61','060eb8ea-4746-4965-a455-43aca92abb3e','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "1c967833-9602-4ba1-941b-a4c8941836be", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-26 04:11:11');
INSERT INTO notifications VALUES('a2e8aa4f-3731-4a44-8553-3cd430da6bc1','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Cefixime 200mg" a expiré. La pharmacie Pharmacie de l''Est n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "1c967833-9602-4ba1-941b-a4c8941836be", "pharmacy_name": "Pharmacie de l''Est", "product_name": "Cefixime 200mg", "action": "expired"}','2025-09-26 04:21:30.596208');
INSERT INTO notifications VALUES('bb57a578-56e6-4768-9a8d-ccd6428b845e','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 08:54:45.047264');
INSERT INTO notifications VALUES('f4bbc510-f14e-487d-9957-6ff0258ddc18','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 09:27:54.031663');
INSERT INTO notifications VALUES('36099ec8-175b-4568-ace0-35739a2530fd','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 11:11:10.660504');
INSERT INTO notifications VALUES('53e3401b-66b7-4ced-8713-0b8153bc7521','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 11:23:34.296326');
INSERT INTO notifications VALUES('529dbcfd-7388-402c-9e70-b9e969f04514','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 11:27:11.007260');
INSERT INTO notifications VALUES('877169a2-34fd-4d96-9b59-8aa8716b7781','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 12:01:11.314407');
INSERT INTO notifications VALUES('a1866cda-9454-4d91-8fc4-da4d530bc0bd','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 14:00:15.911639');
INSERT INTO notifications VALUES('cb6ef259-e5a0-4ba8-a192-5dc1c6756112','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 14:12:54.400203');
INSERT INTO notifications VALUES('d0f4aa50-fb8b-47aa-89f6-b161b120814e','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline Test" a expiré. La pharmacie Pharmacie Test n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "test-prescription-id", "pharmacy_name": "Pharmacie Test", "product_name": "Amoxicilline Test", "action": "expired"}','2025-09-26 14:19:03.276518');
INSERT INTO notifications VALUES('106c96dc-87bc-4391-919d-ccd614b5428a','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Cefixime 200mg nécessite votre validation',0,'{"prescription_request_id": "2a5225c4-9061-49dd-8c2d-c10b60fef179", "product_id": "4afe4379-d25b-4dcc-a54a-b69a7fa20c8c", "client_name": "Test User"}','2025-09-26 14:29:31');
INSERT INTO notifications VALUES('8116eedc-255c-444b-89af-1d1494dc9e34','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Cefixime 200mg" a expiré. La pharmacie Pharmacie Centrale n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "2a5225c4-9061-49dd-8c2d-c10b60fef179", "pharmacy_name": "Pharmacie Centrale", "product_name": "Cefixime 200mg", "action": "expired"}','2025-09-26 14:39:44.191395');
INSERT INTO notifications VALUES('73edf927-e8c7-4cf2-b123-86f455e1f1eb','219e320f-c8ee-416f-b75a-6acfc2707e51','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Amoxicilline 500mg nécessite votre validation',0,'{"prescription_request_id": "79cd77ed-96c6-4b8c-bada-06c58404d2fe", "product_id": "0fd85c04-0a8e-4484-bdf3-539b3493ac73", "client_name": "Test User"}','2025-10-01 21:25:47');
INSERT INTO notifications VALUES('73e2594d-4c9f-4878-94ac-4cc9565ed7ae','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline 500mg" a expiré. La pharmacie Pharmacie de l''Ouest n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "79cd77ed-96c6-4b8c-bada-06c58404d2fe", "pharmacy_name": "Pharmacie de l''Ouest", "product_name": "Amoxicilline 500mg", "action": "expired"}','2025-10-01 21:35:49.497048');
INSERT INTO notifications VALUES('73165e29-25bd-47be-a276-3c7c8c0d545e','d0058da0-eced-4cfc-9db7-53c9f6077547','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amoxicilline 500mg" a expiré. La pharmacie Pharmacie de l''Est n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',1,'{"prescription_request_id": "d89eb2c2-3938-4250-bd1d-7a2e275fdf2b", "pharmacy_name": "Pharmacie de l''Est", "product_name": "Amoxicilline 500mg", "action": "expired"}','2025-10-01 21:46:45.572179');
INSERT INTO notifications VALUES('417702b0-28d8-40da-8048-09a3058918f2','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','prescription_request','Nouvelle demande de prescription','Une nouvelle prescription pour Amlodipine 5mg nécessite votre validation',0,'{"prescription_request_id": "63294e1d-424c-4eef-8ba8-d0e20712ef80", "product_id": "9b7f8f3a-f773-4f23-854f-72ce2b1c7538", "client_name": "Kat Sio"}','2025-10-03 12:35:50');
INSERT INTO notifications VALUES('97a07b86-2f3f-45b2-a6eb-be7950d9724e','25a0871e-f867-46a3-8566-1c59f16d0013','prescription_expired','Prescription expirée','⏰ Votre demande de prescription pour "Amlodipine 5mg" a expiré. La pharmacie Pharmacie Centrale n''a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.',0,'{"prescription_request_id": "63294e1d-424c-4eef-8ba8-d0e20712ef80", "pharmacy_name": "Pharmacie Centrale", "product_name": "Amlodipine 5mg", "action": "expired"}','2025-10-03 12:46:05.974553');
CREATE TABLE pharmacy_inventory (
	id VARCHAR(36) NOT NULL, 
	pharmacy_id VARCHAR(36), 
	product_id VARCHAR(36), 
	quantity INTEGER NOT NULL, 
	price NUMERIC(10, 2) NOT NULL, 
	expiry_date DATE, 
	batch_number VARCHAR(50), 
	is_sponsored BOOLEAN, 
	sponsor_rank INTEGER, 
	sponsor_expires_at DATETIME, 
	last_updated DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(pharmacy_id) REFERENCES pharmacies (id) ON DELETE CASCADE, 
	FOREIGN KEY(product_id) REFERENCES products (id) ON DELETE CASCADE
);
INSERT INTO pharmacy_inventory VALUES('7522e4ce-ee28-4d92-b272-6230dbbf40a3','2f9cc224-2a87-4f84-89b5-872e007fdc05','90ef68e3-5261-46e4-81ba-67e93a7fb80c',25,1906.80999999999994,'2026-06-03','LOT00000',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('7cd135bb-69c7-4a07-b453-cfc184e53d99','2f9cc224-2a87-4f84-89b5-872e007fdc05','0fd85c04-0a8e-4484-bdf3-539b3493ac73',28,3405.17999999999983,'2026-09-18','LOT00001',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('a9ff9bfe-37b4-4475-b250-c56bf3dccdac','2f9cc224-2a87-4f84-89b5-872e007fdc05','fda09546-58d9-4c78-905f-039632964766',5,1137.17000000000007,'2026-04-22','LOT00002',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('25e81aba-a689-4b91-a9cc-b54ac9c81f76','2f9cc224-2a87-4f84-89b5-872e007fdc05','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c',14,913.120000000000004,'2026-02-03','LOT00003',1,4,'2025-10-19 23:31:51.020160','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('4989a06f-9b8e-4807-b751-7affd9c8c3a6','2f9cc224-2a87-4f84-89b5-872e007fdc05','e8acc5bd-31ec-4102-afc8-573c45be5cea',17,3311.23000000000001,'2026-04-27','LOT00004',1,8,'2025-10-19 23:31:51.020362','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('f3e6f9f8-60c3-4ee5-8091-803d8aec0b26','2f9cc224-2a87-4f84-89b5-872e007fdc05','17a5ad06-bf30-4dd4-8353-1ea6fca4147a',38,1388.5999999999999,'2026-04-15','LOT00005',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('65f66cc5-946a-4356-bb02-258627d89b00','2f9cc224-2a87-4f84-89b5-872e007fdc05','d1be1968-a671-4650-8d8f-e3bb988f4470',11,4779.1899999999996,'2026-04-11','LOT00006',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('bc78153e-77b9-4100-8723-46fbf869760b','2f9cc224-2a87-4f84-89b5-872e007fdc05','7f237755-f3ab-40f8-8833-0173a99ff883',49,3803.01000000000021,'2026-03-27','LOT00007',1,8,'2025-10-19 23:31:51.020809','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('02208f6e-52df-4b3a-944c-453c92c07ea5','514bbe24-7e6a-4aaa-b67a-8050776f8f17','d0aa6824-f8a8-4d90-9a51-619c58a97a5f',22,4581.85999999999967,'2026-02-22','LOT01000',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('1a87a99b-3965-4f54-8705-1eff78268a51','514bbe24-7e6a-4aaa-b67a-8050776f8f17','e8acc5bd-31ec-4102-afc8-573c45be5cea',43,1732.16000000000008,'2026-03-03','LOT01001',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('19950b12-73b0-45da-8dec-f6781e82761a','514bbe24-7e6a-4aaa-b67a-8050776f8f17','4f0bc6a7-7247-41e7-8826-0c71b2ddb56e',19,733.590000000000031,'2026-06-30','LOT01002',1,4,'2025-10-19 23:31:51.021362','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('6f9ad8ae-c490-487d-8db5-89e5d017381c','514bbe24-7e6a-4aaa-b67a-8050776f8f17','8817b823-40e4-4536-b5b9-bd3240f54777',36,735.5,'2025-12-10','LOT01003',1,10,'2025-10-19 23:31:51.021529','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('47e8baf7-64b9-4c59-84ea-4399ed5228b7','514bbe24-7e6a-4aaa-b67a-8050776f8f17','9b7f8f3a-f773-4f23-854f-72ce2b1c7538',49,4198.92000000000007,'2026-03-29','LOT01004',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('337dcfab-a4ab-4fed-ab35-b777c67166b6','514bbe24-7e6a-4aaa-b67a-8050776f8f17','7f237755-f3ab-40f8-8833-0173a99ff883',43,1207.5,'2026-02-02','LOT01005',1,8,'2025-10-19 23:31:51.021827','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('ad3403b4-a014-4de5-80cb-b0fbf1221bad','514bbe24-7e6a-4aaa-b67a-8050776f8f17','61c88757-f523-4cbb-b97b-dfbd59be9f4b',30,2377.59000000000014,'2025-12-09','LOT01006',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('ce8534e5-bb1e-40b3-8bff-5eb58f2e9836','514bbe24-7e6a-4aaa-b67a-8050776f8f17','90ef68e3-5261-46e4-81ba-67e93a7fb80c',44,1621.23000000000001,'2025-11-21','LOT01007',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('c5b73bd9-efb4-4d0a-86be-a396e74b9792','514bbe24-7e6a-4aaa-b67a-8050776f8f17','17a5ad06-bf30-4dd4-8353-1ea6fca4147a',21,4266.77000000000043,'2026-01-25','LOT01008',1,8,'2025-10-19 23:31:51.022256','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('363030d3-b98a-4219-97f5-b208cbcc8ec2','514bbe24-7e6a-4aaa-b67a-8050776f8f17','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c',45,2978.78999999999996,'2026-08-04','LOT01009',1,4,'2025-10-19 23:31:51.022461','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('815587c2-9eff-40c1-9511-5fdf349fe993','514bbe24-7e6a-4aaa-b67a-8050776f8f17','9a71cdad-66a8-470a-8fbf-b5048976a579',8,698.950000000000045,'2026-07-26','LOT01010',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('3b54392a-a79b-469d-b664-c424be42b0ac','514bbe24-7e6a-4aaa-b67a-8050776f8f17','ef11d549-c4ca-4c2a-88e9-99fd857f1d6b',46,3182.61000000000012,'2026-03-27','LOT01011',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('88811b97-6598-49aa-bfc4-ad46fcd4e1dc','8c8697ae-d251-48cf-a654-02c13d7c27b3','d1be1968-a671-4650-8d8f-e3bb988f4470',26,1307.6300000000001,'2026-03-29','LOT02000',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('e30d6725-5072-48b2-9f4c-a8deb6c21e82','8c8697ae-d251-48cf-a654-02c13d7c27b3','9a71cdad-66a8-470a-8fbf-b5048976a579',16,909.08000000000004,'2026-07-11','LOT02001',1,8,'2025-10-19 23:31:51.023056','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('216f802e-65ff-4228-999d-03134565f293','8c8697ae-d251-48cf-a654-02c13d7c27b3','61c88757-f523-4cbb-b97b-dfbd59be9f4b',29,4605.21000000000003,'2026-03-05','LOT02002',1,2,'2025-10-19 23:31:51.023255','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('de2da207-d181-4908-878a-dd0da1e4b6f1','8c8697ae-d251-48cf-a654-02c13d7c27b3','9b7f8f3a-f773-4f23-854f-72ce2b1c7538',16,4200.34000000000014,'2025-10-24','LOT02003',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('bdaaef7f-95fb-4850-b068-5450e1c0c553','8c8697ae-d251-48cf-a654-02c13d7c27b3','ef11d549-c4ca-4c2a-88e9-99fd857f1d6b',35,975.58000000000004,'2026-03-08','LOT02004',1,6,'2025-10-19 23:31:51.023612','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('a7184d20-8098-4ce6-8836-8d907a0cef5f','8c8697ae-d251-48cf-a654-02c13d7c27b3','90ef68e3-5261-46e4-81ba-67e93a7fb80c',45,1102.42000000000007,'2026-03-21','LOT02005',1,10,'2025-10-19 23:31:51.023777','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('c8ff7583-3b4a-43d2-bf5d-f130f15092be','8c8697ae-d251-48cf-a654-02c13d7c27b3','e8acc5bd-31ec-4102-afc8-573c45be5cea',26,4518.72999999999956,'2026-08-15','LOT02006',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('4006765e-b64b-42d4-a133-f9958bdcc555','8c8697ae-d251-48cf-a654-02c13d7c27b3','a89e083f-9021-4856-9e7c-89c1bf48cb09',48,1713.03999999999996,'2026-06-19','LOT02007',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('5e8b7715-cae2-4d65-9985-2da31f479735','8c8697ae-d251-48cf-a654-02c13d7c27b3','17a5ad06-bf30-4dd4-8353-1ea6fca4147a',37,3937.36999999999989,'2026-02-26','LOT02008',1,8,'2025-10-19 23:31:51.024227','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('10ecd993-5188-43f3-bad5-d22d6d0d74e9','e4e73de2-1c96-47b2-94ed-a35200ff7c17','d1be1968-a671-4650-8d8f-e3bb988f4470',35,3370.5999999999999,'2026-08-14','LOT03000',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('4ca3e83d-73c1-4929-8789-787a629afa13','e4e73de2-1c96-47b2-94ed-a35200ff7c17','9a71cdad-66a8-470a-8fbf-b5048976a579',34,4381.3100000000004,'2026-05-28','LOT03001',1,6,'2025-10-19 23:31:51.024606','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('38a4229c-f33a-4387-b335-6c38b63e8f63','e4e73de2-1c96-47b2-94ed-a35200ff7c17','a89e083f-9021-4856-9e7c-89c1bf48cb09',41,4480.22000000000025,'2026-06-06','LOT03002',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('fba5391e-77aa-497b-96e5-28e98bd42716','e4e73de2-1c96-47b2-94ed-a35200ff7c17','61c88757-f523-4cbb-b97b-dfbd59be9f4b',37,1873.16000000000008,'2026-03-31','LOT03003',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('98f31dbe-4f1e-4cc4-8d8d-b7de9d8a21be','e4e73de2-1c96-47b2-94ed-a35200ff7c17','ef11d549-c4ca-4c2a-88e9-99fd857f1d6b',21,4894.28999999999996,'2026-02-25','LOT03004',1,6,'2025-10-19 23:31:51.025045','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('8762eefc-d8df-4183-810c-f011f65228a0','e4e73de2-1c96-47b2-94ed-a35200ff7c17','17a5ad06-bf30-4dd4-8353-1ea6fca4147a',9,3755.94999999999981,'2025-12-24','LOT03005',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('cce32a1f-d22e-4ec9-a19a-1a4c5f426445','e4e73de2-1c96-47b2-94ed-a35200ff7c17','0fd85c04-0a8e-4484-bdf3-539b3493ac73',18,636.200000000000045,'2026-06-22','LOT03006',1,4,'2025-10-19 23:31:51.025360','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('b05ee892-5e01-4f6a-8558-44903307ecb8','e4e73de2-1c96-47b2-94ed-a35200ff7c17','7f237755-f3ab-40f8-8833-0173a99ff883',30,1591.3800000000001,'2025-12-06','LOT03007',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('357f287b-c802-473c-880d-2d1f2ae5257e','e4e73de2-1c96-47b2-94ed-a35200ff7c17','e8acc5bd-31ec-4102-afc8-573c45be5cea',35,4837.01000000000021,'2026-06-23','LOT03008',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('aed57020-424a-43b7-a6bb-98c6b24295fe','e4e73de2-1c96-47b2-94ed-a35200ff7c17','4f0bc6a7-7247-41e7-8826-0c71b2ddb56e',41,1171.5999999999999,'2026-07-06','LOT03009',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('1a068c92-b750-4c00-b833-3c6d9ec88568','6acaeb73-f048-47f2-a874-b319a0540e01','a89e083f-9021-4856-9e7c-89c1bf48cb09',49,2203.6300000000001,'2026-02-27','LOT04000',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('bcc8b573-1354-4875-81fa-6982d9982627','6acaeb73-f048-47f2-a874-b319a0540e01','e8acc5bd-31ec-4102-afc8-573c45be5cea',22,2882.26000000000021,'2026-07-19','LOT04001',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('e065bc80-195b-4058-ab17-6ee500ebd0ef','6acaeb73-f048-47f2-a874-b319a0540e01','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c',22,4329.67000000000007,'2026-07-18','LOT04002',1,8,'2025-10-19 23:31:51.026500','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('6ceface0-0ed0-4b81-a921-63ff27f3d537','6acaeb73-f048-47f2-a874-b319a0540e01','90ef68e3-5261-46e4-81ba-67e93a7fb80c',44,731.899999999999977,'2026-05-28','LOT04003',1,10,'2025-10-19 23:31:51.026660','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('b1212faa-4e88-4d80-bb73-a4e600db1e55','6acaeb73-f048-47f2-a874-b319a0540e01','0fd85c04-0a8e-4484-bdf3-539b3493ac73',28,3298.90999999999985,'2026-07-07','LOT04004',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('28847638-2cd4-4eda-b5f1-5714d972518d','6acaeb73-f048-47f2-a874-b319a0540e01','17a5ad06-bf30-4dd4-8353-1ea6fca4147a',11,3408.3800000000001,'2026-02-13','LOT04005',1,6,'2025-10-19 23:31:51.026968','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('4c00dbb2-dc64-415e-bbf1-fc97b957c219','6acaeb73-f048-47f2-a874-b319a0540e01','d0aa6824-f8a8-4d90-9a51-619c58a97a5f',50,4031.80999999999994,'2026-07-12','LOT04006',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('5dee52e9-c2cf-4094-bd0b-3bc3d9e3a3d7','6acaeb73-f048-47f2-a874-b319a0540e01','4f0bc6a7-7247-41e7-8826-0c71b2ddb56e',28,2170.21000000000003,'2026-02-01','LOT04007',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('67df7c5c-2286-43b1-952a-369bc880f920','6acaeb73-f048-47f2-a874-b319a0540e01','ef11d549-c4ca-4c2a-88e9-99fd857f1d6b',32,2697.65999999999985,'2025-11-12','LOT04008',0,0,NULL,'2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('c2b903a1-5b2c-4eb4-ac9d-e7d0e05f789a','6acaeb73-f048-47f2-a874-b319a0540e01','d1be1968-a671-4650-8d8f-e3bb988f4470',8,2984.59000000000014,'2026-06-05','LOT04009',1,6,'2025-10-19 23:31:51.027473','2025-09-19 23:31:51');
INSERT INTO pharmacy_inventory VALUES('5a5a8b26-c63e-4d61-903d-8ae7915d381b','2f9cc224-2a87-4f84-89b5-872e007fdc05','6856d9af-db3c-4f64-903a-517c2d4cdb1f',36,2286.8800000000001,'2025-12-05','LOT00000',1,10,'2025-10-20 00:32:46.210334','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('7a4d0ff5-0151-493c-af4b-f621440cdf0d','2f9cc224-2a87-4f84-89b5-872e007fdc05','ab4d47ac-d50c-4388-9a4a-0be65467b438',9,4281.75,'2026-06-21','LOT00001',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('4efedcea-750d-4b60-8805-a9afd943d9ce','2f9cc224-2a87-4f84-89b5-872e007fdc05','d0aa6824-f8a8-4d90-9a51-619c58a97a5f',26,3525.01000000000021,'2026-04-22','LOT00006',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('fadc80b7-a409-4936-892d-c33be1b2f3ba','2f9cc224-2a87-4f84-89b5-872e007fdc05','8817b823-40e4-4536-b5b9-bd3240f54777',14,1490.61999999999989,'2026-04-22','LOT00007',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('7cc663c1-1b15-4ba1-b6fa-ed5a25b83845','2f9cc224-2a87-4f84-89b5-872e007fdc05','61c88757-f523-4cbb-b97b-dfbd59be9f4b',13,4596.6300000000001,'2026-09-08','LOT00010',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('a2b264ce-9201-4b9e-b621-9f74d87a4f7d','2f9cc224-2a87-4f84-89b5-872e007fdc05','9b7f8f3a-f773-4f23-854f-72ce2b1c7538',25,1117.93000000000006,'2026-05-29','LOT00011',1,10,'2025-10-20 00:32:46.317252','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('fa1b45d5-aea1-42b2-bc4e-aba4af925dbb','2f9cc224-2a87-4f84-89b5-872e007fdc05','a89e083f-9021-4856-9e7c-89c1bf48cb09',7,4865.32999999999992,'2026-03-31','LOT00012',1,2,'2025-10-20 00:32:46.327213','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('ebb5075d-5281-49b7-8736-971ec9c34082','514bbe24-7e6a-4aaa-b67a-8050776f8f17','ab4d47ac-d50c-4388-9a4a-0be65467b438',28,3402.8800000000001,'2026-08-08','LOT01000',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('d15a445a-f0c3-405b-a7e1-915804cd7f79','514bbe24-7e6a-4aaa-b67a-8050776f8f17','9da4256f-5698-40e4-a2a0-a437bffea03c',42,4515.28999999999996,'2026-06-09','LOT01001',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('42a9b8a6-a19e-4cb7-b832-908b24d7b239','514bbe24-7e6a-4aaa-b67a-8050776f8f17','6856d9af-db3c-4f64-903a-517c2d4cdb1f',49,2649.42999999999983,'2025-11-30','LOT01004',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('77af9d00-2a17-486c-bbd3-3b2f48e69d32','514bbe24-7e6a-4aaa-b67a-8050776f8f17','0fd85c04-0a8e-4484-bdf3-539b3493ac73',10,1277.29999999999995,'2026-05-09','LOT01007',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('928b52c8-2a15-4094-a1d3-ffe1fae47809','8c8697ae-d251-48cf-a654-02c13d7c27b3','9da4256f-5698-40e4-a2a0-a437bffea03c',41,1483.74,'2026-02-18','LOT02000',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('9719336b-f986-46d3-91f3-94166679105f','8c8697ae-d251-48cf-a654-02c13d7c27b3','fda09546-58d9-4c78-905f-039632964766',7,4796.44999999999981,'2026-02-21','LOT02002',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('50b757a5-d35f-4f03-b828-4998f009ed4a','8c8697ae-d251-48cf-a654-02c13d7c27b3','4f0bc6a7-7247-41e7-8826-0c71b2ddb56e',50,1090.26999999999998,'2026-05-15','LOT02003',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('e0003d5a-eed2-40d0-b02f-d03780431c8c','8c8697ae-d251-48cf-a654-02c13d7c27b3','ab4d47ac-d50c-4388-9a4a-0be65467b438',28,739.25,'2026-09-13','LOT02004',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('1c6a819a-3f8d-44ae-af51-91c868348bba','8c8697ae-d251-48cf-a654-02c13d7c27b3','d0aa6824-f8a8-4d90-9a51-619c58a97a5f',28,1501.02999999999997,'2026-07-07','LOT02005',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('3fa203af-66fa-42f7-ad81-de0fcc0b2908','8c8697ae-d251-48cf-a654-02c13d7c27b3','8817b823-40e4-4536-b5b9-bd3240f54777',30,3828.82000000000016,'2026-05-26','LOT02007',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('13763141-f5f2-4bb8-b846-1e36297da99f','8c8697ae-d251-48cf-a654-02c13d7c27b3','0fd85c04-0a8e-4484-bdf3-539b3493ac73',8,4607.19999999999981,'2026-06-25','LOT02008',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('8226770b-f113-493f-bf9a-32210c0deae8','8c8697ae-d251-48cf-a654-02c13d7c27b3','6856d9af-db3c-4f64-903a-517c2d4cdb1f',17,2870.65000000000009,'2026-09-18','LOT02009',1,10,'2025-10-20 00:32:46.588247','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('d1f3a1cd-989c-4cba-93a8-9cf52d112c2e','8c8697ae-d251-48cf-a654-02c13d7c27b3','7f237755-f3ab-40f8-8833-0173a99ff883',45,2407.73999999999978,'2026-04-08','LOT02012',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('04e7501f-d0ed-4168-943e-b93d5c2a1b94','e4e73de2-1c96-47b2-94ed-a35200ff7c17','9da4256f-5698-40e4-a2a0-a437bffea03c',42,2806.78999999999996,'2026-07-04','LOT03000',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('ae24ebb5-ae91-416e-8418-562ad8e6d5be','e4e73de2-1c96-47b2-94ed-a35200ff7c17','ab4d47ac-d50c-4388-9a4a-0be65467b438',37,1140.55999999999994,'2026-06-20','LOT03001',1,2,'2025-10-20 00:32:46.628061','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('19c3507a-e11a-49a9-b2d6-93d2de5c2953','e4e73de2-1c96-47b2-94ed-a35200ff7c17','fda09546-58d9-4c78-905f-039632964766',38,3750.57000000000016,'2026-09-17','LOT03002',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('0c2f0b21-c1b2-4077-9044-ee1f44b7d70c','e4e73de2-1c96-47b2-94ed-a35200ff7c17','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c',34,2312.03999999999996,'2026-02-08','LOT03005',1,8,'2025-10-20 00:32:46.710639','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('807c4a09-04be-49f4-ad08-b04a149354da','e4e73de2-1c96-47b2-94ed-a35200ff7c17','9b7f8f3a-f773-4f23-854f-72ce2b1c7538',24,1481.15000000000009,'2026-08-25','LOT03007',1,2,'2025-10-20 00:32:46.753661','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('47249d82-3131-4a40-bc6c-4f6433db800c','e4e73de2-1c96-47b2-94ed-a35200ff7c17','90ef68e3-5261-46e4-81ba-67e93a7fb80c',28,4661.80000000000018,'2025-10-20','LOT03008',1,2,'2025-10-20 00:32:46.786995','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('6d4dbf06-1572-4fd3-b169-aadb561b533d','e4e73de2-1c96-47b2-94ed-a35200ff7c17','6856d9af-db3c-4f64-903a-517c2d4cdb1f',10,2788.23999999999978,'2025-12-22','LOT03012',0,0,NULL,'2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('97528a11-ab09-4672-8a6f-5f36bbfc1c40','6acaeb73-f048-47f2-a874-b319a0540e01','ab4d47ac-d50c-4388-9a4a-0be65467b438',21,4737.96000000000003,'2025-12-18','LOT04001',1,10,'2025-10-20 00:32:46.897831','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('6703872d-4866-4a47-883c-65f7be1462b6','6acaeb73-f048-47f2-a874-b319a0540e01','8817b823-40e4-4536-b5b9-bd3240f54777',41,3341.21999999999979,'2026-08-26','LOT04005',1,2,'2025-10-20 00:32:46.977680','2025-09-20 00:32:46');
INSERT INTO pharmacy_inventory VALUES('6c960151-6756-4bbd-82b6-0b422bf4652b','6acaeb73-f048-47f2-a874-b319a0540e01','7f237755-f3ab-40f8-8833-0173a99ff883',13,1335.97000000000002,'2026-06-12','LOT04010',1,10,'2025-10-20 00:32:47.070373','2025-09-20 00:32:47');
INSERT INTO pharmacy_inventory VALUES('2677cb17-400a-476c-86a0-71c93ec088b4','6acaeb73-f048-47f2-a874-b319a0540e01','6856d9af-db3c-4f64-903a-517c2d4cdb1f',40,3429.5,'2026-07-11','LOT04011',0,0,NULL,'2025-09-20 00:32:47');
INSERT INTO pharmacy_inventory VALUES('9903cd14-2291-47ec-9506-8fc043c0995a','6acaeb73-f048-47f2-a874-b319a0540e01','61c88757-f523-4cbb-b97b-dfbd59be9f4b',20,2981.38999999999987,'2026-01-14','LOT04013',0,0,NULL,'2025-09-20 00:32:47');
INSERT INTO pharmacy_inventory VALUES('70b46b10-dced-4746-8ba9-dfac82d12457','2f9cc224-2a87-4f84-89b5-872e007fdc05','9da4256f-5698-40e4-a2a0-a437bffea03c',21,2238.67999999999983,'2026-07-01','LOT00008',1,4,'2025-10-20 00:33:11.071317','2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('6565313a-7e17-415e-be02-b7e821cc7cb8','2f9cc224-2a87-4f84-89b5-872e007fdc05','9a71cdad-66a8-470a-8fbf-b5048976a579',26,4414.98999999999978,'2026-03-20','LOT00009',0,0,NULL,'2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('2743cb1a-5cec-46b9-a9b2-c9c680bb275d','2f9cc224-2a87-4f84-89b5-872e007fdc05','4f0bc6a7-7247-41e7-8826-0c71b2ddb56e',12,1153.3599999999999,'2025-12-12','LOT00010',1,6,'2025-10-20 00:33:11.131268','2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('79f8f0b0-203b-4ad3-bb0f-fcd2e125a908','2f9cc224-2a87-4f84-89b5-872e007fdc05','ef11d549-c4ca-4c2a-88e9-99fd857f1d6b',38,1300.23000000000001,'2026-08-02','LOT00014',1,6,'2025-10-20 00:33:11.212602','2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('fb5bb767-9d78-4e82-bfe8-c02cc3f095df','514bbe24-7e6a-4aaa-b67a-8050776f8f17','a89e083f-9021-4856-9e7c-89c1bf48cb09',20,1601.21000000000003,'2026-03-28','LOT01003',0,0,NULL,'2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('c0075072-fb4f-4722-b00d-7121137d1651','514bbe24-7e6a-4aaa-b67a-8050776f8f17','fda09546-58d9-4c78-905f-039632964766',36,3726.26999999999998,'2026-04-03','LOT01006',1,6,'2025-10-20 00:33:11.268973','2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('3d5356e1-45a8-42e7-a7e9-3485dc2e1155','514bbe24-7e6a-4aaa-b67a-8050776f8f17','d1be1968-a671-4650-8d8f-e3bb988f4470',11,1121.45000000000004,'2026-01-22','LOT01015',1,4,'2025-10-20 00:33:11.321921','2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('adb93eed-57e6-4b5e-b49e-f92dcf3e6c80','e4e73de2-1c96-47b2-94ed-a35200ff7c17','d0aa6824-f8a8-4d90-9a51-619c58a97a5f',32,2865.42000000000007,'2025-11-12','LOT03004',1,10,'2025-10-20 00:33:11.416283','2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('1a4f9f89-a961-42d6-8837-a22af5aba0c2','e4e73de2-1c96-47b2-94ed-a35200ff7c17','8817b823-40e4-4536-b5b9-bd3240f54777',10,1671.21000000000003,'2026-02-11','LOT03014',1,10,'2025-10-20 00:33:11.469308','2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('f5f87ce9-be58-46c8-bdcf-cca5daf41f98','6acaeb73-f048-47f2-a874-b319a0540e01','9da4256f-5698-40e4-a2a0-a437bffea03c',34,1591.49,'2026-01-24','LOT04000',0,0,NULL,'2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('96e202d7-5235-40a6-a369-c71600472df7','6acaeb73-f048-47f2-a874-b319a0540e01','9b7f8f3a-f773-4f23-854f-72ce2b1c7538',29,2069.90000000000009,'2026-05-28','LOT04009',0,0,NULL,'2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('1ff2bd96-4290-4bd2-a879-76416ce63156','6acaeb73-f048-47f2-a874-b319a0540e01','9a71cdad-66a8-470a-8fbf-b5048976a579',41,4011.67000000000007,'2026-09-16','LOT04010',0,0,NULL,'2025-09-20 00:33:11');
INSERT INTO pharmacy_inventory VALUES('b73ce497-8f66-441e-acd8-903a2761f424','8c8697ae-d251-48cf-a654-02c13d7c27b3','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c',9,4217.5,'2026-01-01','LOT02003',0,0,NULL,'2025-09-20 00:40:47');
INSERT INTO pharmacy_inventory VALUES('7966633c-f572-4e2c-980e-6274f8a65ae1','6acaeb73-f048-47f2-a874-b319a0540e01','fda09546-58d9-4c78-905f-039632964766',39,1816.74,'2026-08-25','LOT04006',0,0,NULL,'2025-09-20 00:40:47');
CREATE TABLE orders (
	id VARCHAR(36) NOT NULL, 
	order_number VARCHAR(20) NOT NULL, 
	client_id VARCHAR(36), 
	pharmacy_id VARCHAR(36), 
	delivery_address_id VARCHAR(36), 
	delivery_type VARCHAR(13) NOT NULL, 
	status VARCHAR(11), 
	total_amount NUMERIC(10, 2) NOT NULL, 
	delivery_fee NUMERIC(10, 2), 
	pickup_code VARCHAR(6), 
	prescription_image_url TEXT, 
	prescription_validated BOOLEAN, 
	notes TEXT, 
	estimated_pickup_time DATETIME, 
	estimated_delivery_time DATETIME, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(client_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(pharmacy_id) REFERENCES pharmacies (id) ON DELETE SET NULL, 
	FOREIGN KEY(delivery_address_id) REFERENCES client_addresses (id) ON DELETE SET NULL
);
CREATE TABLE order_items (
	id VARCHAR(36) NOT NULL, 
	order_id VARCHAR(36), 
	product_id VARCHAR(36), 
	quantity INTEGER NOT NULL, 
	unit_price NUMERIC(10, 2) NOT NULL, 
	total_price NUMERIC(10, 2) NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE, 
	FOREIGN KEY(product_id) REFERENCES products (id) ON DELETE CASCADE
);
CREATE TABLE payments (
	id VARCHAR(36) NOT NULL, 
	order_id VARCHAR(36), 
	payment_method VARCHAR(6) NOT NULL, 
	payment_status VARCHAR(9), 
	amount NUMERIC(10, 2) NOT NULL, 
	currency VARCHAR(3), 
	stripe_payment_id VARCHAR(100), 
	paypal_payment_id VARCHAR(100), 
	transaction_reference VARCHAR(100), 
	paid_at DATETIME, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE
);
CREATE TABLE deliveries (
	id VARCHAR(36) NOT NULL, 
	order_id VARCHAR(36), 
	delivery_partner VARCHAR(100), 
	delivery_tracking_id VARCHAR(100), 
	delivery_person_name VARCHAR(100), 
	delivery_person_phone VARCHAR(20), 
	pickup_time DATETIME, 
	delivery_time DATETIME, 
	delivery_notes TEXT, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE
);
CREATE TABLE reviews (
	id VARCHAR(36) NOT NULL, 
	order_id VARCHAR(36), 
	client_id VARCHAR(36), 
	pharmacy_id VARCHAR(36), 
	rating INTEGER NOT NULL, 
	comment TEXT, 
	is_public BOOLEAN, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE, 
	FOREIGN KEY(client_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(pharmacy_id) REFERENCES pharmacies (id) ON DELETE CASCADE
);
CREATE TABLE cart_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    pharmacy_id VARCHAR(36) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, prescription_request_id VARCHAR(36), requires_prescription_validation BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies (id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id, pharmacy_id)
);
INSERT INTO cart_items VALUES('93dab3a3-46a7-4260-8cb7-bf3ac4899d98','50a203a2-ab95-4778-82bb-cf765802bbc4','6856d9af-db3c-4f64-903a-517c2d4cdb1f','8c8697ae-d251-48cf-a654-02c13d7c27b3',1,'2025-09-25 02:12:11','2025-09-25 02:12:11',NULL,0);
INSERT INTO cart_items VALUES('a0a46818-4e0b-4383-aec5-e870320ec45c','50a203a2-ab95-4778-82bb-cf765802bbc4','90ef68e3-5261-46e4-81ba-67e93a7fb80c','8c8697ae-d251-48cf-a654-02c13d7c27b3',1,'2025-09-25 02:12:11','2025-09-25 02:12:11',NULL,0);
INSERT INTO cart_items VALUES('c19da842-c7c8-442f-ad12-a80a0c8c4773','50a203a2-ab95-4778-82bb-cf765802bbc4','90ef68e3-5261-46e4-81ba-67e93a7fb80c','6acaeb73-f048-47f2-a874-b319a0540e01',1,'2025-09-25 02:16:07','2025-09-25 02:16:07',NULL,0);
INSERT INTO cart_items VALUES('fef9ff08-e6ae-448b-9c9d-49e07df22cc3','50a203a2-ab95-4778-82bb-cf765802bbc4','d0aa6824-f8a8-4d90-9a51-619c58a97a5f','e4e73de2-1c96-47b2-94ed-a35200ff7c17',1,'2025-09-25 03:04:43','2025-09-25 03:04:43',NULL,0);
INSERT INTO cart_items VALUES('d54532a2-fc04-4c62-b357-770524fd7523','25a0871e-f867-46a3-8566-1c59f16d0013','6856d9af-db3c-4f64-903a-517c2d4cdb1f','2f9cc224-2a87-4f84-89b5-872e007fdc05',1,'2025-10-03 12:35:26','2025-10-03 12:35:26',NULL,0);
CREATE TABLE prescription_requests (
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, validation_timeout_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
                FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
            );
INSERT INTO prescription_requests VALUES('dcec0d5d-17aa-4f95-89b8-4c4481e9fbf2','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','e4e73de2-1c96-47b2-94ed-a35200ff7c17','/uploads/prescriptions/b0c9c1f5-732d-40d4-95a6-bd67b34822c2.png','Capture d’écran du 2025-09-22 03-48-37.png',51931,'image/png','EXPIRED',1,NULL,'2025-09-25 15:37:13.174060','La pharmacie "Pharmacie de l''Ouest" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 15:21:55.584887','2025-09-25 15:21:55','2025-09-25 15:37:13','2025-09-25 15:36:55.584900');
INSERT INTO prescription_requests VALUES('18fa6c9e-6c56-4230-abd6-248d0b9fb93e','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','e4e73de2-1c96-47b2-94ed-a35200ff7c17','/uploads/prescriptions/f9438ec4-2413-401c-8a4b-bbfcc9ee6e4e.png','Capture d’écran du 2025-09-22 03-48-37.png',51931,'image/png','EXPIRED',1,NULL,'2025-09-25 15:37:43.200642','La pharmacie "Pharmacie de l''Ouest" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 15:22:22.541928','2025-09-25 15:22:22','2025-09-25 15:37:43','2025-09-25 15:37:22.541940');
INSERT INTO prescription_requests VALUES('bfd958f3-ec7b-45f5-b02b-0a67ef3bfa98','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','6acaeb73-f048-47f2-a874-b319a0540e01','/uploads/prescriptions/d9d53497-0e7e-4661-a09f-7903a339a9f4.png','Capture d’écran du 2025-08-13 10-46-55.png',133842,'image/png','EXPIRED',1,NULL,'2025-09-25 15:38:13.221374','La pharmacie "Pharmacie de l''Est" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 15:23:11.600362','2025-09-25 15:23:11','2025-09-25 15:38:13','2025-09-25 15:38:11.600371');
INSERT INTO prescription_requests VALUES('69580056-7cb4-4413-8ad6-394dd5d4f99b','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','6acaeb73-f048-47f2-a874-b319a0540e01','/uploads/prescriptions/9bceea0f-058a-4772-b888-55f82a0e63de.png','Capture d’écran du 2025-08-13 10-46-55.png',133842,'image/png','EXPIRED',1,NULL,'2025-09-25 15:38:43.230809','La pharmacie "Pharmacie de l''Est" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 15:23:17.553320','2025-09-25 15:23:17','2025-09-25 15:38:43','2025-09-25 15:38:17.553328');
INSERT INTO prescription_requests VALUES('d9ba8387-4426-4cea-8b96-e6c21783799b','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','6acaeb73-f048-47f2-a874-b319a0540e01','/uploads/prescriptions/f793e4bb-2462-4e5d-8697-3192b164aada.png','Capture d’écran du 2025-08-13 10-46-55.png',133842,'image/png','EXPIRED',1,NULL,'2025-09-25 15:46:43.312821','La pharmacie "Pharmacie de l''Est" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 15:31:28.085920','2025-09-25 15:31:28','2025-09-25 15:46:43','2025-09-25 15:46:28.085935');
INSERT INTO prescription_requests VALUES('27b050b5-ddc8-4286-a222-546adcb1c0d1','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','2f9cc224-2a87-4f84-89b5-872e007fdc05','/uploads/prescriptions/f1e23813-dcf5-4b81-a313-8f3f0c4be5d6.png','Capture d’écran du 2025-09-22 03-48-37.png',51931,'image/png','EXPIRED',1,NULL,'2025-09-25 15:47:13.330464','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 15:31:47.305677','2025-09-25 15:31:47','2025-09-25 15:47:13','2025-09-25 15:46:47.305699');
INSERT INTO prescription_requests VALUES('7138d363-db14-4848-a69f-89a3e723e149','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','e4e73de2-1c96-47b2-94ed-a35200ff7c17','/uploads/prescriptions/d5da3255-e1eb-462c-8c5b-e644f45404b0.pdf','Déclaration Juin 2025.pdf',159129,'application/pdf','EXPIRED',1,NULL,'2025-09-25 15:48:13.352220','La pharmacie "Pharmacie de l''Ouest" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 15:32:43.680541','2025-09-25 15:32:43','2025-09-25 15:48:13','2025-09-25 15:47:43.680557');
INSERT INTO prescription_requests VALUES('8492eac6-27b8-4d0d-82df-15b7c085a5eb','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','2f9cc224-2a87-4f84-89b5-872e007fdc05','/uploads/prescriptions/be36f14b-bf33-4bbb-839b-ecbabdcee361.png','AGENTIC.png',148185,'image/png','EXPIRED',1,NULL,'2025-09-25 21:11:57.370042','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 20:56:36.119252','2025-09-25 20:56:36','2025-09-25 21:11:57','2025-09-25 21:11:36.119283');
INSERT INTO prescription_requests VALUES('3a6a644f-2707-421f-b838-979d451bf1ce','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','2f9cc224-2a87-4f84-89b5-872e007fdc05','/uploads/prescriptions/52f9cfd8-f7b7-4212-b072-161fa0a55a9d.png','AGENTIC.png',148185,'image/png','EXPIRED',1,NULL,'2025-09-25 21:25:57.607521','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-25 21:10:31.768279','2025-09-25 21:10:31','2025-09-25 21:25:57','2025-09-25 21:25:31.768315');
INSERT INTO prescription_requests VALUES('16afac94-d099-468a-a8db-7d0838f21201','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','2f9cc224-2a87-4f84-89b5-872e007fdc05','/uploads/prescriptions/cc4863bb-3941-4401-866d-38163c4ce01f.png','AGENTIC.png',148185,'image/png','EXPIRED',1,NULL,'2025-09-26 03:36:35.245038','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-26 03:21:32.460672','2025-09-26 03:21:32','2025-09-26 03:36:35','2025-09-26 03:36:32.460682');
INSERT INTO prescription_requests VALUES('caea50be-5c2f-49db-b3ff-18e16755da74','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','2f9cc224-2a87-4f84-89b5-872e007fdc05','/uploads/prescriptions/7deecba4-02eb-485c-9999-31e5eb636d08.png','AGENTIC.png',148185,'image/png','EXPIRED',1,NULL,'2025-09-26 04:00:41.672955','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-26 03:50:14.299149','2025-09-26 03:50:14','2025-09-26 04:00:41','2025-09-26 04:00:14.299157');
INSERT INTO prescription_requests VALUES('0863abb7-a09a-4ba7-8bbc-77e56b32aab0','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','514bbe24-7e6a-4aaa-b67a-8050776f8f17','/uploads/prescriptions/7d3f75d2-fcc6-4059-b682-0a34746b269f.png','AGENTIC.png',148185,'image/png','EXPIRED',1,NULL,'2025-09-26 04:01:41.695726','La pharmacie "Pharmacie du Nord" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-26 03:51:25.893313','2025-09-26 03:51:25','2025-09-26 04:01:41','2025-09-26 04:01:25.893346');
INSERT INTO prescription_requests VALUES('8ee02272-c2c2-49f5-981b-b827ecd1c1ba','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','0fd85c04-0a8e-4484-bdf3-539b3493ac73','2f9cc224-2a87-4f84-89b5-872e007fdc05','/test/fake_prescription.jpg','test_prescription.jpg',1024,'image/jpeg','EXPIRED',1,NULL,'2025-09-26 04:06:04.185597','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-26 04:05:53.217480','2025-09-26 04:05:53','2025-09-26 04:06:04','2025-09-26 04:06:03.217501');
INSERT INTO prescription_requests VALUES('34bc59be-f137-4f42-a361-1144d6ad1d0d','35ac1d3a-4a21-4580-8ef8-07ba0ddd3c88','0fd85c04-0a8e-4484-bdf3-539b3493ac73','2f9cc224-2a87-4f84-89b5-872e007fdc05','/test/fake_prescription.jpg','test_prescription.jpg',1024,'image/jpeg','EXPIRED',1,NULL,'2025-09-26 04:07:30.436350','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-26 04:07:14.537193','2025-09-26 04:07:14','2025-09-26 04:07:30','2025-09-26 04:07:24.537213');
INSERT INTO prescription_requests VALUES('1c967833-9602-4ba1-941b-a4c8941836be','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','6acaeb73-f048-47f2-a874-b319a0540e01','/uploads/prescriptions/7b44df80-4be0-4808-bde8-7f3a3075f6a9.png','Thynk.png',48659,'image/png','EXPIRED',1,NULL,'2025-09-26 04:21:30.594611','La pharmacie "Pharmacie de l''Est" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-26 04:11:11.419110','2025-09-26 04:11:11','2025-09-26 04:21:30','2025-09-26 04:21:11.419125');
INSERT INTO prescription_requests VALUES('2a5225c4-9061-49dd-8c2d-c10b60fef179','d0058da0-eced-4cfc-9db7-53c9f6077547','4afe4379-d25b-4dcc-a54a-b69a7fa20c8c','2f9cc224-2a87-4f84-89b5-872e007fdc05','/uploads/prescriptions/309045f7-9043-43df-80bf-d85615b26bea.png','AGENTIC.png',148185,'image/png','EXPIRED',1,NULL,'2025-09-26 14:39:44.189895','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-26 14:29:31.608608','2025-09-26 14:29:31','2025-09-26 14:39:44','2025-09-26 14:39:31.608623');
INSERT INTO prescription_requests VALUES('79cd77ed-96c6-4b8c-bada-06c58404d2fe','d0058da0-eced-4cfc-9db7-53c9f6077547','0fd85c04-0a8e-4484-bdf3-539b3493ac73','e4e73de2-1c96-47b2-94ed-a35200ff7c17','/uploads/prescriptions/499693f7-8d8d-4f0d-af8d-a5cb1508dfe8.png','parabiogaran.png',69730,'image/png','EXPIRED',1,NULL,'2025-10-01 21:35:49.471159','La pharmacie "Pharmacie de l''Ouest" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-31 21:25:47.906776','2025-10-01 21:25:47','2025-10-01 21:35:49','2025-10-01 21:35:47.906785');
INSERT INTO prescription_requests VALUES('d89eb2c2-3938-4250-bd1d-7a2e275fdf2b','d0058da0-eced-4cfc-9db7-53c9f6077547','0fd85c04-0a8e-4484-bdf3-539b3493ac73','6acaeb73-f048-47f2-a874-b319a0540e01','/uploads/prescriptions/1c460d6c-bafe-46da-892c-2261670b2a90.png','parabiogaran.png',69730,'image/png','EXPIRED',1,NULL,'2025-10-01 21:46:45.567273','La pharmacie "Pharmacie de l''Est" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-10-31 21:36:26.373440','2025-10-01 21:36:26','2025-10-01 21:46:45','2025-10-01 21:46:26.373456');
INSERT INTO prescription_requests VALUES('63294e1d-424c-4eef-8ba8-d0e20712ef80','25a0871e-f867-46a3-8566-1c59f16d0013','9b7f8f3a-f773-4f23-854f-72ce2b1c7538','2f9cc224-2a87-4f84-89b5-872e007fdc05','/uploads/prescriptions/3c2d60af-c4f8-40c2-9712-943f483e4ce0.png','parabiogaran.png',69730,'image/png','EXPIRED',1,NULL,'2025-10-03 12:46:05.970353','La pharmacie "Pharmacie Centrale" n''a malheureusement pas pris en charge votre demande dans le délai imparti (15 minutes). Veuillez essayer avec une autre pharmacie.',NULL,'2025-11-02 12:35:50.974569','2025-10-03 12:35:50','2025-10-03 12:46:05','2025-10-03 12:45:50.974580');
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_products_requires_prescription ON products (requires_prescription);
CREATE INDEX ix_products_name ON products (name);
CREATE INDEX ix_pharmacy_inventory_pharmacy_id ON pharmacy_inventory (pharmacy_id);
CREATE INDEX ix_pharmacy_inventory_product_id ON pharmacy_inventory (product_id);
CREATE INDEX ix_pharmacy_inventory_is_sponsored ON pharmacy_inventory (is_sponsored);
CREATE INDEX ix_orders_status ON orders (status);
CREATE INDEX ix_orders_client_id ON orders (client_id);
CREATE UNIQUE INDEX ix_orders_order_number ON orders (order_number);
CREATE INDEX ix_orders_created_at ON orders (created_at);
COMMIT;

COMMIT;
PRAGMA foreign_keys=ON;
