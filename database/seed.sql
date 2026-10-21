-- Seed data. Prices (INR/day) are DEMO ESTIMATES, not real rental rates.
-- Model years and unspecified fields are demo placeholders: verify before presenting as fact.
USE luxury_vehicles;

INSERT INTO brands (brand_name, country_of_origin) VALUES
('Ducati','Italy'),('Indian Motorcycle','USA'),('Royal Enfield','India'),
('Lamborghini','Italy'),('Maserati','Italy'),('Porsche','Germany'),
('Rolls-Royce','United Kingdom'),('Tesla','USA');

INSERT INTO categories (category_name, vehicle_type, description) VALUES
('Superbike','Motorcycle','Track-focused sport motorcycles'),
('Cruiser','Motorcycle','Relaxed, low-slung touring and bobber motorcycles'),
('Cafe Racer','Motorcycle','Retro-styled sport roadsters'),
('Supercar','Car','High-performance exotic cars'),
('Sports Car','Car','Performance coupes for road and track'),
('Luxury Coupe','Car','Ultra-premium grand-touring coupes');

INSERT INTO vehicles
(brand_id, category_id, model, model_year, price_per_day, fuel_type, transmission, drivetrain, engine, horsepower, seating_capacity, mileage, description, image_path) VALUES
(1,1,'Panigale',2025,18000,'Petrol','Manual',NULL,NULL,NULL,NULL,NULL,'Italian superbike in Ducati Corse livery with carbon-style bodywork and Öhlins-style gold forks.','images/vehicles/ducati-panigale.jpg'),
(2,2,'Chief Bobber',2025,9000,'Petrol','Manual',NULL,'Thunderstroke 116 V-twin (1,890 cc)',NULL,1,NULL,'Classic American bobber with a matte olive finish, solo seat and wire-spoke wheels.','images/vehicles/indian-chief-bobber.jpg'),
(2,2,'Scout 101',2025,9500,'Petrol','Manual',NULL,'1,250 cc V-twin',NULL,1,NULL,'Sport-cruiser with a bar-end fairing, gold suspension and Brembo front brakes.','images/vehicles/indian-scout-101.jpg'),
(3,3,'Continental GT 650',2024,4500,'Petrol','Manual',NULL,'648 cc parallel twin',NULL,1,NULL,'Chrome-tanked cafe racer with a clipped seat and spoked wheels.','images/vehicles/royal-enfield-continental-gt.jpg'),
(4,4,'SVJ',2025,150000,'Hybrid','Automatic',NULL,NULL,NULL,2,NULL,'Aggressive Lamborghini supercar in white and black carbon with red accents and a fixed rear wing.','images/vehicles/lamborghini-svj.jpg'),
(5,4,'MCPura',2025,85000,'Petrol','Automatic',NULL,'3.0 L twin-turbo V6',NULL,2,NULL,'Mid-engined Maserati supercar finished in matte light blue.','images/vehicles/maserati-mcpura.jpg'),
(6,5,'911 Carrera GTS',2025,60000,'Hybrid','Automatic',NULL,NULL,NULL,4,NULL,'Iconic Porsche 911 in Guards Red with GTS styling and red brake calipers.','images/vehicles/porsche-911-carrera.jpg'),
(7,6,'Spectre',2025,120000,'Electric','Automatic',NULL,'Dual electric motors',577,4,NULL,'All-electric ultra-luxury coupe with the Pantheon grille and Spirit of Ecstasy.','images/vehicles/rolls-royce-spectre.jpg'),
(8,5,'Roadster',2025,70000,'Electric','Automatic',NULL,NULL,NULL,4,NULL,'Futuristic wedge-shaped electric sports car.','images/vehicles/tesla-roadster.jpg');

INSERT INTO booking_requests (vehicle_id, customer_name, phone, email, pickup_date, return_date, total_days, estimated_amount, message, status) VALUES
(1,'Demo Customer A','9000000001','a@example.com','2026-11-02','2026-11-04',2,36000,'Weekend ride','Pending'),
(6,'Demo Customer B','9000000002',NULL,'2026-11-10','2026-11-13',3,255000,NULL,'Confirmed'),
(8,'Demo Customer C','9000000003','c@example.com','2026-10-25','2026-10-27',2,240000,'Anniversary','Completed'),
(4,'Demo Customer D','9000000004',NULL,'2026-12-01','2026-12-02',1,4500,NULL,'Rejected');
