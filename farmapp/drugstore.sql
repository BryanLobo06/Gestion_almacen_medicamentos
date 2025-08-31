-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: drugstore
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `deliverys`
--

DROP TABLE IF EXISTS `deliverys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliverys` (
  `id_delivery` int NOT NULL AUTO_INCREMENT,
  `delivery_date` varchar(255) DEFAULT NULL,
  `id_product` int DEFAULT NULL,
  `id_supplier` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `id_employee` int DEFAULT NULL,
  `delivery` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_delivery`),
  KEY `id_product` (`id_product`),
  KEY `id_supplier` (`id_supplier`),
  KEY `id_employee` (`id_employee`),
  CONSTRAINT `deliverys_ibfk_1` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`),
  CONSTRAINT `deliverys_ibfk_2` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers` (`id_supplier`),
  CONSTRAINT `deliverys_ibfk_3` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id_employee`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliverys`
--

LOCK TABLES `deliverys` WRITE;
/*!40000 ALTER TABLE `deliverys` DISABLE KEYS */;
INSERT INTO `deliverys` VALUES (1,'2025-08-01',1,1,100,1,'Entrega completa'),(2,'2025-08-03',2,2,80,2,'Entrega parcial'),(3,'2025-08-05',3,3,50,1,'Entrega completa'),(4,'2025-08-07',4,4,70,2,'Entrega completa'),(5,'2025-08-10',5,5,120,1,'Entrega parcial');
/*!40000 ALTER TABLE `deliverys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id_employee` int NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(255) DEFAULT NULL,
  `working_day` varchar(255) DEFAULT NULL,
  `employee_email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `charge` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_employee`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'Ana López','Lunes a Viernes','ana.lopez@farmacia.com','555-1234','Av. Central 123','administrador'),(2,'Carlos Pérez','Lunes a Sábado','carlos.perez@farmacia.com','555-5678','Calle Norte 456','empleado'),(3,'Ana López','Lunes a Viernes','ana.lopez@farmacia.com','555-1234','Av. Central 123','administrador'),(4,'Carlos Pérez','Lunes a Sábado','carlos.perez@farmacia.com','555-5678','Calle Norte 456','empleado');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id_product` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `price` int DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_product`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Paracetamol 500mg','Analgésico y antipirético',100,25,'Genfar'),(2,'Ibuprofeno 400mg','Antiinflamatorio no esteroideo',80,35,'MK'),(3,'Amoxicilina 500mg','Antibiótico de amplio espectro',50,60,'Sandoz'),(4,'Omeprazol 20mg','Inhibidor de bomba de protones',70,40,'Pfizer'),(5,'Loratadina 10mg','Antihistamínico',120,20,'Genfar');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `id_request` int NOT NULL AUTO_INCREMENT,
  `id_employee` int DEFAULT NULL,
  `id_product` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `request_date` varchar(255) DEFAULT NULL,
  `response_date` varchar(255) DEFAULT NULL,
  `request_state` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_request`),
  KEY `id_employee` (`id_employee`),
  KEY `id_product` (`id_product`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id_employee`),
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (1,2,1,20,'2025-08-12','2025-08-13','Aprobado'),(2,2,2,15,'2025-08-14','2025-08-15','Pendiente'),(3,2,5,10,'2025-08-16','2025-08-17','Rechazado'),(4,2,3,5,'2025-08-17','2025-08-18','Aprobado'),(5,2,4,8,'2025-08-18','2025-08-19','Pendiente');
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id_supplier` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) DEFAULT NULL,
  `supplier_email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `id_product` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_supplier`),
  KEY `id_product` (`id_product`),
  CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Distribuidora SaludPlus','contacto@saludplus.com','321-1111','Zona Industrial 12',1,500,'Genfar'),(2,'Farmedex S.A.','ventas@farmedex.com','322-2222','Av. de la Salud 34',2,300,'MK'),(3,'Medicent S.A.','info@medicent.com','323-3333','Calle Farma 78',3,200,'Sandoz'),(4,'BioPharma','soporte@biopharma.com','324-4444','Carrera 10 #5-30',4,250,'Pfizer'),(5,'AlfaMedic','logistica@alfamedic.com','325-5555','Diagonal 15 #23',5,400,'Genfar');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) DEFAULT NULL,
  `password_user` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'administrador','administrador');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-28 22:17:06
