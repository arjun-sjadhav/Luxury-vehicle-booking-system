-- Luxury Vehicle Catalog & Booking System — schema (MySQL 8 / MariaDB 10.5+)
CREATE DATABASE IF NOT EXISTS luxury_vehicles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE luxury_vehicles;

DROP TABLE IF EXISTS booking_requests;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS brands;

CREATE TABLE brands (
  brand_id    INT AUTO_INCREMENT PRIMARY KEY,
  brand_name  VARCHAR(60) NOT NULL UNIQUE,
  country_of_origin VARCHAR(60) NULL
);

CREATE TABLE categories (
  category_id   INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(60) NOT NULL UNIQUE,
  vehicle_type  VARCHAR(12) NOT NULL DEFAULT 'Car',
  description   VARCHAR(255) NULL,
  CONSTRAINT chk_vehicle_type CHECK (vehicle_type IN ('Car','Motorcycle'))
);

CREATE TABLE vehicles (
  vehicle_id       INT AUTO_INCREMENT PRIMARY KEY,
  brand_id         INT NOT NULL,
  category_id      INT NOT NULL,
  model            VARCHAR(80) NOT NULL,
  model_year       SMALLINT NOT NULL,
  price_per_day    DECIMAL(10,2) NOT NULL,          -- DEMO estimate (INR)
  fuel_type        VARCHAR(20) NOT NULL,
  transmission     VARCHAR(20) NOT NULL,
  drivetrain       VARCHAR(30) NULL,
  engine           VARCHAR(100) NULL,
  horsepower       SMALLINT NULL,
  seating_capacity TINYINT NULL,
  mileage          VARCHAR(40) NULL,
  description      TEXT NULL,
  image_path       VARCHAR(255) NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_vehicle_brand    FOREIGN KEY (brand_id)    REFERENCES brands(brand_id),
  CONSTRAINT fk_vehicle_category FOREIGN KEY (category_id) REFERENCES categories(category_id),
  CONSTRAINT chk_price  CHECK (price_per_day > 0),
  CONSTRAINT chk_year   CHECK (model_year BETWEEN 1990 AND 2100),
  CONSTRAINT chk_fuel   CHECK (fuel_type IN ('Petrol','Diesel','Hybrid','Electric')),
  CONSTRAINT chk_trans  CHECK (transmission IN ('Automatic','Manual')),
  CONSTRAINT uq_vehicle UNIQUE (brand_id, model, model_year)
);

CREATE TABLE booking_requests (
  booking_id       INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id       INT NOT NULL,
  customer_name    VARCHAR(100) NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  email            VARCHAR(120) NULL,
  pickup_date      DATE NOT NULL,
  return_date      DATE NOT NULL,
  total_days       INT NOT NULL,
  estimated_amount DECIMAL(12,2) NOT NULL,
  message          VARCHAR(500) NULL,
  status           VARCHAR(12) NOT NULL DEFAULT 'Pending',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
  CONSTRAINT chk_dates  CHECK (return_date > pickup_date),
  CONSTRAINT chk_days   CHECK (total_days >= 1),
  CONSTRAINT chk_status CHECK (status IN ('Pending','Confirmed','Rejected','Completed'))
);

CREATE INDEX idx_vehicles_brand    ON vehicles(brand_id);
CREATE INDEX idx_vehicles_category ON vehicles(category_id);
CREATE INDEX idx_bookings_status   ON booking_requests(status);
CREATE INDEX idx_bookings_vehicle  ON booking_requests(vehicle_id);
