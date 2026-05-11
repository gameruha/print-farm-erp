-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: print_farm_erp
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `client_id` int(11) NOT NULL AUTO_INCREMENT,
  `client_type` enum('individual','business') NOT NULL DEFAULT 'individual',
  `client_name` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'individual','Test Client','+380931111111','client@example.com',NULL,'Lviv',NULL,'2026-04-21 08:40:29'),(2,'business','Demo Store','+380932222222','store@example.com',NULL,'Kyiv',NULL,'2026-04-21 08:40:29');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_types`
--

DROP TABLE IF EXISTS `expense_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_types` (
  `expense_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `expense_name` varchar(100) NOT NULL,
  PRIMARY KEY (`expense_type_id`),
  UNIQUE KEY `expense_name` (`expense_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_types`
--

LOCK TABLES `expense_types` WRITE;
/*!40000 ALTER TABLE `expense_types` DISABLE KEYS */;
INSERT INTO `expense_types` VALUES (5,'Advertising'),(6,'Delivery'),(1,'Electricity'),(3,'Nozzle replacement'),(7,'Other'),(4,'Packaging'),(2,'Printer maintenance');
/*!40000 ALTER TABLE `expense_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `expense_id` int(11) NOT NULL AUTO_INCREMENT,
  `expense_type_id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `printer_id` int(11) DEFAULT NULL,
  `expense_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description_text` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`expense_id`),
  KEY `fk_expenses_type` (`expense_type_id`),
  KEY `fk_expenses_supplier` (`supplier_id`),
  KEY `fk_expenses_printer` (`printer_id`),
  KEY `idx_expenses_date` (`expense_date`),
  CONSTRAINT `fk_expenses_printer` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`printer_id`),
  CONSTRAINT `fk_expenses_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`),
  CONSTRAINT `fk_expenses_type` FOREIGN KEY (`expense_type_id`) REFERENCES `expense_types` (`expense_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filament_spools`
--

DROP TABLE IF EXISTS `filament_spools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filament_spools` (
  `spool_id` int(11) NOT NULL AUTO_INCREMENT,
  `filament_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `batch_no` varchar(80) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tare_weight_g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `start_weight_g` decimal(10,2) NOT NULL DEFAULT 1000.00,
  `current_weight_g` decimal(10,2) NOT NULL DEFAULT 1000.00,
  `status` enum('in_stock','in_use','empty','archived') NOT NULL DEFAULT 'in_stock',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`spool_id`),
  KEY `fk_spools_filament` (`filament_id`),
  KEY `fk_spools_warehouse` (`warehouse_id`),
  KEY `idx_filament_spools_status` (`status`),
  CONSTRAINT `fk_spools_filament` FOREIGN KEY (`filament_id`) REFERENCES `filaments` (`filament_id`),
  CONSTRAINT `fk_spools_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filament_spools`
--

LOCK TABLES `filament_spools` WRITE;
/*!40000 ALTER TABLE `filament_spools` DISABLE KEYS */;
INSERT INTO `filament_spools` VALUES (1,1,1,'BATCH-PLA-WHT-01','2026-04-21',850.00,250.00,1000.00,1000.00,'in_stock',NULL),(2,2,1,'BATCH-PLA-BLK-01','2026-04-21',850.00,250.00,1000.00,1000.00,'in_stock',NULL),(3,3,1,'BATCH-PETG-GRY-01','2026-04-21',980.00,250.00,1000.00,1000.00,'in_stock',NULL);
/*!40000 ALTER TABLE `filament_spools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filaments`
--

DROP TABLE IF EXISTS `filaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filaments` (
  `filament_id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) DEFAULT NULL,
  `filament_code` varchar(50) NOT NULL,
  `brand` varchar(80) DEFAULT NULL,
  `material_type` varchar(40) NOT NULL,
  `color_name` varchar(50) NOT NULL,
  `diameter_mm` decimal(4,2) NOT NULL DEFAULT 1.75,
  `spool_nominal_g` decimal(10,2) NOT NULL DEFAULT 1000.00,
  `price_per_kg` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_stock_g` decimal(10,2) NOT NULL DEFAULT 100.00,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`filament_id`),
  UNIQUE KEY `filament_code` (`filament_code`),
  KEY `fk_filaments_supplier` (`supplier_id`),
  CONSTRAINT `fk_filaments_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filaments`
--

LOCK TABLES `filaments` WRITE;
/*!40000 ALTER TABLE `filaments` DISABLE KEYS */;
INSERT INTO `filaments` VALUES (1,1,'PLA-WHT-001','Bambu Lab','PLA','White',1.75,1000.00,850.00,150.00,NULL,1),(2,1,'PLA-BLK-001','Bambu Lab','PLA','Black',1.75,1000.00,850.00,150.00,NULL,1),(3,1,'PETG-GRY-001','Bambu Lab','PETG','Gray',1.75,1000.00,980.00,150.00,NULL,1);
/*!40000 ALTER TABLE `filaments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finished_goods_stock`
--

DROP TABLE IF EXISTS `finished_goods_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finished_goods_stock` (
  `stock_id` int(11) NOT NULL AUTO_INCREMENT,
  `variant_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `qty_on_hand` int(11) NOT NULL DEFAULT 0,
  `avg_unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `uq_fg_variant_wh` (`variant_id`,`warehouse_id`),
  KEY `fk_fg_warehouse` (`warehouse_id`),
  KEY `idx_stock_variant_wh` (`variant_id`,`warehouse_id`),
  CONSTRAINT `fk_fg_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`),
  CONSTRAINT `fk_fg_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finished_goods_stock`
--

LOCK TABLES `finished_goods_stock` WRITE;
/*!40000 ALTER TABLE `finished_goods_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `finished_goods_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_material_usage`
--

DROP TABLE IF EXISTS `job_material_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_material_usage` (
  `usage_id` int(11) NOT NULL AUTO_INCREMENT,
  `job_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `qty_used` decimal(10,3) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`usage_id`),
  KEY `fk_job_usage_job` (`job_id`),
  KEY `fk_job_usage_material` (`material_id`),
  CONSTRAINT `fk_job_usage_job` FOREIGN KEY (`job_id`) REFERENCES `print_jobs` (`job_id`),
  CONSTRAINT `fk_job_usage_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_material_usage`
--

LOCK TABLES `job_material_usage` WRITE;
/*!40000 ALTER TABLE `job_material_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_material_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_logs`
--

DROP TABLE IF EXISTS `maintenance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_logs` (
  `maintenance_id` int(11) NOT NULL AUTO_INCREMENT,
  `printer_id` int(11) NOT NULL,
  `component_name` varchar(100) DEFAULT NULL,
  `maintenance_type` enum('cleaning','repair','replacement','calibration','inspection') NOT NULL,
  `maintenance_date` date NOT NULL,
  `cost_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `downtime_hours` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description_text` text DEFAULT NULL,
  `performed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`maintenance_id`),
  KEY `fk_maint_printer` (`printer_id`),
  KEY `fk_maint_user` (`performed_by`),
  CONSTRAINT `fk_maint_printer` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`printer_id`),
  CONSTRAINT `fk_maint_user` FOREIGN KEY (`performed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_logs`
--

LOCK TABLES `maintenance_logs` WRITE;
/*!40000 ALTER TABLE `maintenance_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_categories`
--

DROP TABLE IF EXISTS `material_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_categories` (
  `material_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description_text` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`material_category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_categories`
--

LOCK TABLES `material_categories` WRITE;
/*!40000 ALTER TABLE `material_categories` DISABLE KEYS */;
INSERT INTO `material_categories` VALUES (1,'Packaging','Boxes, bags, labels'),(2,'Hardware','Magnets, screws, inserts'),(3,'Consumables','Glue, alcohol, tape');
/*!40000 ALTER TABLE `material_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `material_id` int(11) NOT NULL AUTO_INCREMENT,
  `material_category_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `material_code` varchar(50) NOT NULL,
  `material_name` varchar(150) NOT NULL,
  `unit_name` varchar(20) NOT NULL DEFAULT 'pcs',
  `default_purchase_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_stock_qty` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`material_id`),
  UNIQUE KEY `material_code` (`material_code`),
  KEY `fk_materials_category` (`material_category_id`),
  KEY `fk_materials_supplier` (`supplier_id`),
  CONSTRAINT `fk_materials_category` FOREIGN KEY (`material_category_id`) REFERENCES `material_categories` (`material_category_id`),
  CONSTRAINT `fk_materials_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,1,2,'BOX-S','Small cardboard box','pcs',8.00,20.00,NULL,1),(2,1,2,'LABEL-01','Brand label','pcs',1.50,50.00,NULL,1),(3,2,2,'MAGNET-10','Magnet 10x2 mm','pcs',3.20,30.00,NULL,1);
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `models`
--

DROP TABLE IF EXISTS `models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `models` (
  `model_id` int(11) NOT NULL AUTO_INCREMENT,
  `model_name` varchar(150) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `stl_file_path` varchar(255) DEFAULT NULL,
  `project_file_path` varchar(255) DEFAULT NULL,
  `preview_image_path` varchar(255) DEFAULT NULL,
  `version_label` varchar(50) DEFAULT NULL,
  `estimated_print_time_min` int(11) DEFAULT 0,
  `estimated_weight_g` decimal(10,2) DEFAULT 0.00,
  `support_weight_g` decimal(10,2) DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`model_id`),
  KEY `fk_models_category` (`category_id`),
  CONSTRAINT `fk_models_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `models`
--

LOCK TABLES `models` WRITE;
/*!40000 ALTER TABLE `models` DISABLE KEYS */;
INSERT INTO `models` VALUES (1,'Articulated Dragon',1,'models/dragon.stl','projects/dragon.3mf',NULL,'v1.0',360,180.00,20.00,1,'2026-04-21 08:40:58'),(2,'Phone Stand',2,'models/phone_stand.stl','projects/phone_stand.3mf',NULL,'v1.0',150,70.00,5.00,1,'2026-04-21 08:40:58');
/*!40000 ALTER TABLE `models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `variant_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `planned_unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `planned_unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `actual_unit_cost` decimal(10,2) DEFAULT NULL,
  `line_status` enum('planned','queued','printing','ready','delivered','cancelled') NOT NULL DEFAULT 'planned',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `fk_order_items_variant` (`variant_id`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,0.00,0.00,NULL,'planned',NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `order_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `source_name` varchar(60) DEFAULT NULL,
  `status` enum('new','approved','in_production','ready','shipped','completed','cancelled') NOT NULL DEFAULT 'new',
  `payment_status` enum('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
  `delivery_address` varchar(255) DEFAULT NULL,
  `shipping_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `comment_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_manager` (`manager_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_client` (`client_id`),
  CONSTRAINT `fk_orders_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`),
  CONSTRAINT `fk_orders_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,NULL,'2026-04-21',NULL,'website','new','unpaid',NULL,0.00,0.00,NULL,'2026-04-21 10:28:06');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','bank_transfer','other') NOT NULL DEFAULT 'card',
  `transaction_ref` varchar(100) DEFAULT NULL,
  `comment_text` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `idx_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `print_jobs`
--

DROP TABLE IF EXISTS `print_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `print_jobs` (
  `job_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `printer_id` int(11) NOT NULL,
  `spool_id` int(11) DEFAULT NULL,
  `operator_id` int(11) DEFAULT NULL,
  `bambu_job_code` varchar(80) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('queued','running','done','failed','cancelled') NOT NULL DEFAULT 'queued',
  `qty_planned` int(11) NOT NULL DEFAULT 1,
  `qty_good` int(11) NOT NULL DEFAULT 0,
  `qty_failed` int(11) NOT NULL DEFAULT 0,
  `filament_used_g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `support_used_g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `waste_g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `electricity_tariff` decimal(10,2) NOT NULL DEFAULT 4.32,
  `avg_power_w` decimal(10,2) NOT NULL DEFAULT 120.00,
  `filament_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `electricity_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `wear_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `other_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`job_id`),
  KEY `fk_jobs_spool` (`spool_id`),
  KEY `fk_jobs_operator` (`operator_id`),
  KEY `idx_print_jobs_printer` (`printer_id`),
  KEY `idx_print_jobs_item` (`item_id`),
  CONSTRAINT `fk_jobs_item` FOREIGN KEY (`item_id`) REFERENCES `order_items` (`item_id`),
  CONSTRAINT `fk_jobs_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_jobs_printer` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`printer_id`),
  CONSTRAINT `fk_jobs_spool` FOREIGN KEY (`spool_id`) REFERENCES `filament_spools` (`spool_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `print_jobs`
--

LOCK TABLES `print_jobs` WRITE;
/*!40000 ALTER TABLE `print_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `print_jobs` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_print_jobs_cost_before_insert
BEFORE INSERT ON print_jobs
FOR EACH ROW
SET NEW.total_cost =
    NEW.filament_cost +
    ((NEW.avg_power_w / 1000) *
     IF(NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL,
        TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time) / 60,
        0
     ) *
     NEW.electricity_tariff)
    +
    (
        IFNULL(
            (SELECT wear_per_hour FROM printers WHERE printer_id = NEW.printer_id),
            0
        ) *
        IF(NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL,
           TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time) / 60,
           0
        )
    )
    +
    NEW.other_cost */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_print_jobs_reduce_spool_after_insert
AFTER INSERT ON print_jobs
FOR EACH ROW
UPDATE filament_spools
SET current_weight_g = GREATEST(0, current_weight_g - (NEW.filament_used_g + NEW.support_used_g + NEW.waste_g)),
    status = IF(
        GREATEST(0, current_weight_g - (NEW.filament_used_g + NEW.support_used_g + NEW.waste_g)) = 0,
        'empty',
        status
    )
WHERE NEW.status IN ('done','failed')
  AND NEW.spool_id IS NOT NULL
  AND spool_id = NEW.spool_id */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_print_jobs_cost_before_update
BEFORE UPDATE ON print_jobs
FOR EACH ROW
SET NEW.total_cost =
    NEW.filament_cost +
    ((NEW.avg_power_w / 1000) *
     IF(NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL,
        TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time) / 60,
        0
     ) *
     NEW.electricity_tariff)
    +
    (
        IFNULL(
            (SELECT wear_per_hour FROM printers WHERE printer_id = NEW.printer_id),
            0
        ) *
        IF(NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL,
           TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time) / 60,
           0
        )
    )
    +
    NEW.other_cost */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `printer_components`
--

DROP TABLE IF EXISTS `printer_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `printer_components` (
  `printer_component_id` int(11) NOT NULL AUTO_INCREMENT,
  `printer_id` int(11) NOT NULL,
  `component_name` varchar(100) NOT NULL,
  `install_date` date DEFAULT NULL,
  `replacement_interval_hours` decimal(10,2) DEFAULT NULL,
  `replacement_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `current_hours_used` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`printer_component_id`),
  KEY `fk_components_printer` (`printer_id`),
  CONSTRAINT `fk_components_printer` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`printer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `printer_components`
--

LOCK TABLES `printer_components` WRITE;
/*!40000 ALTER TABLE `printer_components` DISABLE KEYS */;
/*!40000 ALTER TABLE `printer_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `printers`
--

DROP TABLE IF EXISTS `printers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `printers` (
  `printer_id` int(11) NOT NULL AUTO_INCREMENT,
  `printer_name` varchar(100) NOT NULL,
  `brand` varchar(60) DEFAULT NULL,
  `model` varchar(80) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `resource_hours` decimal(10,2) NOT NULL DEFAULT 5000.00,
  `wear_per_hour` decimal(10,4) NOT NULL DEFAULT 0.0000,
  `nozzle_diameter_mm` decimal(4,2) DEFAULT 0.40,
  `average_power_w` decimal(10,2) NOT NULL DEFAULT 120.00,
  `status` enum('active','maintenance','offline','retired') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`printer_id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `fk_printers_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_printers_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `printers`
--

LOCK TABLES `printers` WRITE;
/*!40000 ALTER TABLE `printers` DISABLE KEYS */;
INSERT INTO `printers` VALUES (1,'Bambu P1S #1','Bambu Lab','P1S','P1S-001',1,'2025-01-10',32000.00,5000.00,6.4000,0.40,120.00,'active',NULL),(2,'Bambu A1 #1','Bambu Lab','A1','A1-001',1,'2025-02-01',24000.00,5000.00,4.8000,0.40,110.00,'active',NULL);
/*!40000 ALTER TABLE `printers` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_printers_set_wear_before_insert
BEFORE INSERT ON printers
FOR EACH ROW
SET NEW.wear_per_hour = 
    IF(NEW.resource_hours > 0, 
       NEW.purchase_cost / NEW.resource_hours, 
       0) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_printers_set_wear_before_update
BEFORE UPDATE ON printers
FOR EACH ROW
SET NEW.wear_per_hour = 
    IF(NEW.resource_hours > 0, 
       NEW.purchase_cost / NEW.resource_hours, 
       0) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description_text` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Figures','Decorative figures and statues'),(2,'Functional parts','Brackets, holders, technical parts'),(3,'Home decor','Interior items and organizers');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_filaments`
--

DROP TABLE IF EXISTS `product_filaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_filaments` (
  `product_filament_id` int(11) NOT NULL AUTO_INCREMENT,
  `variant_id` int(11) NOT NULL,
  `filament_id` int(11) NOT NULL,
  `qty_g_per_unit` decimal(10,2) NOT NULL,
  `waste_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`product_filament_id`),
  UNIQUE KEY `uq_variant_filament` (`variant_id`,`filament_id`),
  KEY `fk_prod_fil_filament` (`filament_id`),
  CONSTRAINT `fk_prod_fil_filament` FOREIGN KEY (`filament_id`) REFERENCES `filaments` (`filament_id`),
  CONSTRAINT `fk_prod_fil_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_filaments`
--

LOCK TABLES `product_filaments` WRITE;
/*!40000 ALTER TABLE `product_filaments` DISABLE KEYS */;
INSERT INTO `product_filaments` VALUES (1,1,1,180.00,8.00),(2,2,2,180.00,8.00),(3,3,3,70.00,5.00);
/*!40000 ALTER TABLE `product_filaments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_materials`
--

DROP TABLE IF EXISTS `product_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_materials` (
  `product_material_id` int(11) NOT NULL AUTO_INCREMENT,
  `variant_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `qty_per_unit` decimal(10,3) NOT NULL,
  `waste_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`product_material_id`),
  UNIQUE KEY `uq_variant_material` (`variant_id`,`material_id`),
  KEY `fk_prod_material_material` (`material_id`),
  CONSTRAINT `fk_prod_material_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`material_id`),
  CONSTRAINT `fk_prod_material_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_materials`
--

LOCK TABLES `product_materials` WRITE;
/*!40000 ALTER TABLE `product_materials` DISABLE KEYS */;
INSERT INTO `product_materials` VALUES (1,1,1,1.000,0.00),(2,1,2,1.000,0.00),(3,3,1,1.000,0.00);
/*!40000 ALTER TABLE `product_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `variant_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `variant_code` varchar(60) NOT NULL,
  `color_name` varchar(50) DEFAULT NULL,
  `material_name` varchar(50) DEFAULT NULL,
  `size_name` varchar(50) DEFAULT NULL,
  `weight_g` decimal(10,2) DEFAULT 0.00,
  `print_time_min` int(11) DEFAULT 0,
  `recommended_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`variant_id`),
  UNIQUE KEY `variant_code` (`variant_code`),
  KEY `fk_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'DRAGON-WHITE-M','White','PLA','Medium',180.00,360,650.00,NULL,1),(2,1,'DRAGON-BLACK-M','Black','PLA','Medium',180.00,360,650.00,NULL,1),(3,2,'STAND-GRAY-M','Gray','PETG','Standard',70.00,150,250.00,NULL,1);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `model_id` int(11) DEFAULT NULL,
  `sku` varchar(50) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `unit_name` varchar(30) NOT NULL DEFAULT 'pcs',
  `description_text` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_stock_qty` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_printed_on_demand` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `fk_products_category` (`category_id`),
  KEY `fk_products_model` (`model_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`category_id`),
  CONSTRAINT `fk_products_model` FOREIGN KEY (`model_id`) REFERENCES `models` (`model_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,1,'FIG-DRAGON-001','Articulated Dragon','pcs','Decorative articulated dragon',650.00,2.00,1,1,'2026-04-21 08:41:05'),(2,2,2,'FUNC-STAND-001','Phone Stand','pcs','Functional stand for smartphone',250.00,5.00,1,1,'2026-04-21 08:41:05'),(3,1,1,'p1','P1','pcs','P1 item',200.00,3.00,1,1,'2026-04-21 10:02:16');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `movement_id` int(11) NOT NULL AUTO_INCREMENT,
  `movement_date` datetime NOT NULL DEFAULT current_timestamp(),
  `movement_type` enum('production_in','sale_out','manual_in','manual_out','return_in','writeoff') NOT NULL,
  `variant_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `qty_change` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `related_order_id` int(11) DEFAULT NULL,
  `related_job_id` int(11) DEFAULT NULL,
  `comment_text` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`movement_id`),
  KEY `fk_moves_variant` (`variant_id`),
  KEY `fk_moves_warehouse` (`warehouse_id`),
  KEY `fk_moves_order` (`related_order_id`),
  KEY `fk_moves_job` (`related_job_id`),
  CONSTRAINT `fk_moves_job` FOREIGN KEY (`related_job_id`) REFERENCES `print_jobs` (`job_id`),
  CONSTRAINT `fk_moves_order` FOREIGN KEY (`related_order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_moves_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`),
  CONSTRAINT `fk_moves_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_stock_movements_apply_after_insert
AFTER INSERT ON stock_movements
FOR EACH ROW
INSERT INTO finished_goods_stock (variant_id, warehouse_id, qty_on_hand, avg_unit_cost)
VALUES (NEW.variant_id, NEW.warehouse_id, NEW.qty_change, NEW.unit_cost)
ON DUPLICATE KEY UPDATE
    qty_on_hand = qty_on_hand + NEW.qty_change,
    avg_unit_cost = IF(
        qty_on_hand + NEW.qty_change <= 0,
        avg_unit_cost,
        IF(
            NEW.qty_change > 0,
            ((qty_on_hand * avg_unit_cost) + (NEW.qty_change * NEW.unit_cost)) / (qty_on_hand + NEW.qty_change),
            avg_unit_cost
        )
    ) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Bambu Supplier','+380111111111','sales@bambu-supplier.local',NULL,NULL,'2026-04-21 08:40:20'),(2,'Packaging Supplier','+380222222222','pack@supplier.local',NULL,NULL,'2026-04-21 08:40:20');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(120) NOT NULL,
  `role` enum('admin','manager','operator','accountant','warehouse') NOT NULL DEFAULT 'operator',
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrator','admin','+380000000001','admin@printfarm.local',1,'2026-04-21 08:40:16'),(2,'Production Manager','manager','+380000000002','manager@printfarm.local',1,'2026-04-21 08:40:16'),(3,'Operator 1','operator','+380000000003','operator1@printfarm.local',1,'2026-04-21 08:40:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_finished_goods_stock`
--

DROP TABLE IF EXISTS `v_finished_goods_stock`;
/*!50001 DROP VIEW IF EXISTS `v_finished_goods_stock`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_finished_goods_stock` AS SELECT 
 1 AS `stock_id`,
 1 AS `product_name`,
 1 AS `variant_code`,
 1 AS `color_name`,
 1 AS `material_name`,
 1 AS `size_name`,
 1 AS `warehouse_name`,
 1 AS `qty_on_hand`,
 1 AS `avg_unit_cost`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_low_filament_stock`
--

DROP TABLE IF EXISTS `v_low_filament_stock`;
/*!50001 DROP VIEW IF EXISTS `v_low_filament_stock`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_low_filament_stock` AS SELECT 
 1 AS `spool_id`,
 1 AS `filament_code`,
 1 AS `brand`,
 1 AS `material_type`,
 1 AS `color_name`,
 1 AS `current_weight_g`,
 1 AS `min_stock_g`,
 1 AS `warehouse_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_order_finance`
--

DROP TABLE IF EXISTS `v_order_finance`;
/*!50001 DROP VIEW IF EXISTS `v_order_finance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_order_finance` AS SELECT 
 1 AS `order_id`,
 1 AS `client_name`,
 1 AS `order_date`,
 1 AS `status`,
 1 AS `payment_status`,
 1 AS `planned_revenue`,
 1 AS `planned_or_actual_cost`,
 1 AS `paid_amount`,
 1 AS `estimated_profit`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_printer_utilization`
--

DROP TABLE IF EXISTS `v_printer_utilization`;
/*!50001 DROP VIEW IF EXISTS `v_printer_utilization`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_printer_utilization` AS SELECT 
 1 AS `printer_id`,
 1 AS `printer_name`,
 1 AS `total_jobs`,
 1 AS `worked_hours`,
 1 AS `accumulated_cost`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouses` (
  `warehouse_id` int(11) NOT NULL AUTO_INCREMENT,
  `warehouse_name` varchar(120) NOT NULL,
  `location_name` varchar(120) DEFAULT NULL,
  `warehouse_type` enum('materials','finished_goods','mixed') NOT NULL DEFAULT 'mixed',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`warehouse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,'Main Warehouse','Workshop','mixed',1),(2,'Finished Goods','Office','finished_goods',1);
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'print_farm_erp'
--

--
-- Final view structure for view `v_finished_goods_stock`
--

/*!50001 DROP VIEW IF EXISTS `v_finished_goods_stock`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_finished_goods_stock` AS select `fgs`.`stock_id` AS `stock_id`,`p`.`product_name` AS `product_name`,`pv`.`variant_code` AS `variant_code`,`pv`.`color_name` AS `color_name`,`pv`.`material_name` AS `material_name`,`pv`.`size_name` AS `size_name`,`w`.`warehouse_name` AS `warehouse_name`,`fgs`.`qty_on_hand` AS `qty_on_hand`,`fgs`.`avg_unit_cost` AS `avg_unit_cost` from (((`finished_goods_stock` `fgs` join `product_variants` `pv` on(`pv`.`variant_id` = `fgs`.`variant_id`)) join `products` `p` on(`p`.`product_id` = `pv`.`product_id`)) join `warehouses` `w` on(`w`.`warehouse_id` = `fgs`.`warehouse_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_low_filament_stock`
--

/*!50001 DROP VIEW IF EXISTS `v_low_filament_stock`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_low_filament_stock` AS select `fs`.`spool_id` AS `spool_id`,`f`.`filament_code` AS `filament_code`,`f`.`brand` AS `brand`,`f`.`material_type` AS `material_type`,`f`.`color_name` AS `color_name`,`fs`.`current_weight_g` AS `current_weight_g`,`f`.`min_stock_g` AS `min_stock_g`,`w`.`warehouse_name` AS `warehouse_name` from ((`filament_spools` `fs` join `filaments` `f` on(`f`.`filament_id` = `fs`.`filament_id`)) join `warehouses` `w` on(`w`.`warehouse_id` = `fs`.`warehouse_id`)) where `fs`.`current_weight_g` <= `f`.`min_stock_g` and `fs`.`status` in ('in_stock','in_use') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_order_finance`
--

/*!50001 DROP VIEW IF EXISTS `v_order_finance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_order_finance` AS select `o`.`order_id` AS `order_id`,`c`.`client_name` AS `client_name`,`o`.`order_date` AS `order_date`,`o`.`status` AS `status`,`o`.`payment_status` AS `payment_status`,coalesce(sum(`oi`.`quantity` * `oi`.`planned_unit_price`),0) AS `planned_revenue`,coalesce(sum(`oi`.`quantity` * coalesce(`oi`.`actual_unit_cost`,`oi`.`planned_unit_cost`)),0) AS `planned_or_actual_cost`,coalesce((select sum(`p`.`amount`) from `payments` `p` where `p`.`order_id` = `o`.`order_id`),0) AS `paid_amount`,coalesce(sum(`oi`.`quantity` * `oi`.`planned_unit_price`),0) - coalesce(sum(`oi`.`quantity` * coalesce(`oi`.`actual_unit_cost`,`oi`.`planned_unit_cost`)),0) AS `estimated_profit` from ((`orders` `o` join `clients` `c` on(`c`.`client_id` = `o`.`client_id`)) left join `order_items` `oi` on(`oi`.`order_id` = `o`.`order_id`)) group by `o`.`order_id`,`c`.`client_name`,`o`.`order_date`,`o`.`status`,`o`.`payment_status` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_printer_utilization`
--

/*!50001 DROP VIEW IF EXISTS `v_printer_utilization`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_printer_utilization` AS select `pr`.`printer_id` AS `printer_id`,`pr`.`printer_name` AS `printer_name`,count(`pj`.`job_id`) AS `total_jobs`,coalesce(sum(timestampdiff(MINUTE,`pj`.`start_time`,`pj`.`end_time`)) / 60,0) AS `worked_hours`,coalesce(sum(`pj`.`total_cost`),0) AS `accumulated_cost` from (`printers` `pr` left join `print_jobs` `pj` on(`pj`.`printer_id` = `pr`.`printer_id`)) group by `pr`.`printer_id`,`pr`.`printer_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 14:03:43
