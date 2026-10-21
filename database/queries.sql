USE luxury_vehicles;
-- JOIN: catalog listing
SELECT v.vehicle_id, b.brand_name, v.model, c.category_name, v.price_per_day
FROM vehicles v JOIN brands b ON b.brand_id=v.brand_id JOIN categories c ON c.category_id=v.category_id
WHERE v.is_active=1 ORDER BY v.price_per_day DESC;
-- Search + filter
SELECT b.brand_name, v.model FROM vehicles v JOIN brands b USING(brand_id)
WHERE (b.brand_name LIKE '%por%' OR v.model LIKE '%por%') AND v.fuel_type IN ('Petrol','Hybrid') AND v.price_per_day BETWEEN 5000 AND 100000;
-- ORDER BY year, then name
SELECT b.brand_name, v.model, v.model_year FROM vehicles v JOIN brands b USING(brand_id) ORDER BY v.model_year DESC, b.brand_name, v.model;
-- Aggregates + GROUP BY
SELECT c.category_name, COUNT(*) AS vehicles, ROUND(AVG(v.price_per_day),2) AS avg_price
FROM vehicles v JOIN categories c USING(category_id) GROUP BY c.category_name;
SELECT status, COUNT(*) AS requests, SUM(estimated_amount) AS total_estimated FROM booking_requests GROUP BY status;
-- JOIN: bookings with vehicle
SELECT r.booking_id, r.customer_name, CONCAT(b.brand_name,' ',v.model) AS vehicle, r.pickup_date, r.return_date, r.estimated_amount, r.status
FROM booking_requests r JOIN vehicles v USING(vehicle_id) JOIN brands b USING(brand_id) ORDER BY r.created_at DESC;
-- Subquery: priced above average
SELECT model, price_per_day FROM vehicles WHERE price_per_day > (SELECT AVG(price_per_day) FROM vehicles);
-- DML: update + safe delete of a test row
UPDATE booking_requests SET status='Confirmed' WHERE booking_id=1;
INSERT INTO booking_requests (vehicle_id,customer_name,phone,pickup_date,return_date,total_days,estimated_amount) VALUES (4,'TEST ROW','0000000000','2026-12-10','2026-12-11',1,4500);
DELETE FROM booking_requests WHERE customer_name='TEST ROW';
-- Constraint demo (each should FAIL):
-- INSERT INTO booking_requests (vehicle_id,customer_name,phone,pickup_date,return_date,total_days,estimated_amount) VALUES (1,'X','1','2026-12-05','2026-12-01',1,1);  -- CHECK return>pickup
-- INSERT INTO vehicles (brand_id,category_id,model,model_year,price_per_day,fuel_type,transmission) VALUES (99,1,'Z',2025,1,'Petrol','Manual');          -- FK
-- Index demo
EXPLAIN SELECT * FROM booking_requests WHERE status='Pending';
