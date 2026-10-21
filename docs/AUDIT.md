# Audit Report: Luxury Vehicle Catalog & Booking System
**Date:** October 2026  
**Project:** Academic DBMS Mini Project (College)  
**Status:** Stage 1 Audit Complete (Pending User Confirmation for Stage 2 Repairs)  
**Audited Against:** `Luxury_Vehicle_Catalog_Booking_PRD.docx` (v1.0) & Project Instructions

---

## 1. Executive Summary

This codebase is an academic DBMS mini project developed using Node.js, Express.js, `mysql2`, HTML5, CSS3, and vanilla JavaScript. The core goal is to provide a database-backed catalog of luxury cars and iconic motorcycles inspired by GTA Base, complete with attribute search, multi-criteria filtering, sorting, vehicle detail views, and a server-validated booking request system with a local manager review dashboard.

### Key Strengths
- **No forbidden frameworks:** Zero traces of React, Vue, Angular, Python, FastAPI, Supabase, MongoDB, Prisma, or TypeScript. Dependencies are clean (`dotenv`, `express`, `mysql2`).
- **Genuinely DB-backed:** The catalog routes query MySQL directly via `mysql2/promise` with parameterized queries (`?`). No hardcoded vehicle arrays or static JSON stubs.
- **Server-authoritative pricing:** Total rental duration and estimated amount are strictly computed server-side using the database-stored `price_per_day`. Request body tampering is rejected.
- **Date convention alignment:** Both frontend and backend calculate rental duration as `(return_date - pickup_date) / DAY`, adhering to the checkout date convention (e.g., 25 Oct to 27 Oct = 2 days).
- **Clean UI & Responsive CSS:** Pure semantic HTML5, clean CSS tokens matching the PRD palette (Midnight Black `#111318`, Champagne Gold `#C8A96B`, Warm Ivory `#F5F3EE`), and vanilla JS.

### Critical Gaps Requiring Stage 2 Repair
1. **[BLOCKER] Seed Data Volume & Calculation Errors in `database/seed.sql`:** Only 9 vehicles are seeded (PRD §13 mandates 10–15). Two existing seed bookings contain arithmetic mismatches between vehicle rates and estimated totals.
2. **[IMPORTANT] Missing Categories in `database/schema.sql` and `database/seed.sql`:** Car categories `Sedan`, `SUV`, `Luxury MPV`, and `Coupe` are missing. Motorcycle category `Sport Bike` is mislabeled `Superbike`.
3. **[IMPORTANT] Missing Image Assets & Fallback Image:** `public/images/vehicles/fallback.jpg` does not exist (currently an inline SVG data URI in JS). `assets/IMAGE_MAPPING.md` is missing.
4. **[IMPORTANT] Manager Endpoints Not Isolated to Localhost:** Manager endpoints (`GET /api/bookings`, `PATCH /api/bookings/:id/status`) and `/manager.html` lack loopback IP validation.
5. **[COSMETIC] Manager Banner Wording:** The manager warning text in `public/manager.html` does not include the exact explicit banner required ("Demo only — no authentication").

---

## 2. Detailed Findings by Audit Category

### Finding 1: File Tree vs PRD §16 Structure
- **Reference:** PRD §16 (Suggested Project Structure)
- **Current Tree:**
  ```text
  c:\Luxury vehicle system\
  ├── assets/
  │   ├── bikes/ (4 images)
  │   └── cars/ (5 images)
  ├── config/
  │   └── database.js
  ├── database/
  │   ├── queries.sql
  │   ├── schema.sql
  │   └── seed.sql
  ├── docs/
  │   ├── AUDIT.md (this document)
  │   └── er-diagram.md (Mermaid ER source)
  ├── public/
  │   ├── about.html
  │   ├── booking.html
  │   ├── contact.html
  │   ├── index.html
  │   ├── manager.html
  │   ├── vehicle-details.html
  │   ├── vehicles.html
  │   ├── css/style.css
  │   ├── js/booking.js
  │   ├── js/main.js
  │   ├── js/manager.js
  │   ├── js/vehicles.js
  │   └── images/vehicles/ (9 vehicle images)
  ├── routes/
  │   ├── bookingRoutes.js
  │   └── vehicleRoutes.js
  ├── .env.example
  ├── .gitignore
  ├── Luxury_Vehicle_Catalog_Booking_PRD.docx
  ├── package.json
  ├── package-lock.json
  ├── README.md
  └── server.js
  ```
- **Analysis:**
  - **Misplaced/Nested folder:** Previously nested `luxury-vehicle-catalog/` and bash brace artifact `{public/` were identified and cleanly flattened to the workspace root during initial workspace triage.
  - **Missing docs:** `docs/er-diagram.png` and `docs/project-report.pdf` suggested in §16 are not yet compiled (`docs/er-diagram.md` exists with Mermaid source).
  - **Missing required documentation:** `assets/IMAGE_MAPPING.md` is missing.
  - **Missing image assets:** `public/images/vehicles/fallback.jpg` is missing.
- **Severity:** IMPORTANT
- **Concrete Fix:** Create `assets/IMAGE_MAPPING.md`, generate `public/images/vehicles/fallback.jpg`, and keep `docs/AUDIT.md`.

---

### Finding 2: Genuine Database-Backed Verification
- **Files Inspected:** `config/database.js`, `routes/vehicleRoutes.js`, `public/js/vehicles.js`, `public/vehicle-details.html`
- **Analysis:**
  - `config/database.js` configures a connection pool via `mysql2/promise` using environment variables.
  - `routes/vehicleRoutes.js` runs genuine `SELECT` statements with parameterized WHERE clauses (`b.brand_name LIKE ?`, `c.category_name = ?`, `v.fuel_type = ?`, `v.transmission = ?`, `v.price_per_day >= ?`, `v.price_per_day <= ?`).
  - Sort orders are strictly mapped against an explicit dictionary whitelist (`SORTS`), preventing SQL injection.
  - Detail endpoint `/api/vehicles/:id` runs a parameterized query and returns 404 if not found or inactive.
  - Frontend (`vehicles.js`) executes `fetch('/api/vehicles?' + qs)` dynamically. No hardcoded vehicle arrays or static JSON mock files exist in the frontend.
- **Severity:** PASS / NO DEFECT

---

### Finding 3: Database Schema vs PRD §12
- **File Inspected:** `database/schema.sql`
- **Analysis:**
  - **`brands` Table:** Has `brand_id` INT AUTO_INCREMENT PRIMARY KEY, `brand_name` VARCHAR(60) NOT NULL UNIQUE, `country_of_origin` VARCHAR(60) NULL. (Matches PRD §12.1).
  - **`categories` Table:** Has `category_id` INT AUTO_INCREMENT PRIMARY KEY, `category_name` VARCHAR(60) NOT NULL UNIQUE, `vehicle_type` VARCHAR(12) NOT NULL DEFAULT 'Car' with `CHECK (vehicle_type IN ('Car','Motorcycle'))`. (Matches PRD §12.1).
  - **`vehicles` Table:**
    - Primary and Foreign Keys: `vehicle_id` PK, `brand_id` FK to `brands`, `category_id` FK to `categories`.
    - Monetary columns: `price_per_day DECIMAL(10,2) NOT NULL`. Uses `DECIMAL`, strictly complying with the non-negotiable rule (no `FLOAT`).
    - Constraints: `chk_price CHECK (price_per_day > 0)`, `chk_year CHECK (model_year BETWEEN 1990 AND 2100)`, `chk_fuel CHECK (fuel_type IN ('Petrol','Diesel','Hybrid','Electric'))`, `chk_trans CHECK (transmission IN ('Automatic','Manual'))`, `uq_vehicle UNIQUE (brand_id, model, model_year)`.
    - Columns: `drivetrain`, `engine`, `horsepower`, `seating_capacity`, `mileage`, `description`, `image_path`, `is_active TINYINT(1) DEFAULT 1`.
  - **`booking_requests` Table:**
    - Primary and Foreign Keys: `booking_id` PK, `vehicle_id` FK to `vehicles`.
    - Monetary columns: `estimated_amount DECIMAL(12,2) NOT NULL`.
    - Constraints: `chk_dates CHECK (return_date > pickup_date)`, `chk_days CHECK (total_days >= 1)`, `chk_status CHECK (status IN ('Pending','Confirmed','Rejected','Completed'))`.
    - Status default: `DEFAULT 'Pending'`.
    - Note on ENUM vs VARCHAR: Schema uses `VARCHAR(12) DEFAULT 'Pending'` with `CHECK (status IN (...))`. In MySQL 8, native `ENUM('Pending','Confirmed','Rejected','Completed') DEFAULT 'Pending'` is also standard. Both satisfy PRD constraints.
  - **Indexes:** Frequent lookup fields are indexed: `idx_vehicles_brand`, `idx_vehicles_category`, `idx_bookings_status`, `idx_bookings_vehicle`.
  - **Optional Features:** `vehicle_features` and `vehicle_feature_map` are omitted (permitted as optional by PRD §12.1).
- **Defects in Seed Data (`database/seed.sql`):**
  - Only 9 vehicles are inserted (PRD §13 mandates 10–15).
  - In `seed.sql` line 32: Booking for vehicle 6 (Porsche 911 Carrera GTS, ₹60,000/day) for 3 days specifies `estimated_amount` ₹255,000 instead of ₹180,000 (3 × ₹85,000 was mistakenly calculated from Maserati MCPura).
  - In `seed.sql` line 33: Booking for vehicle 8 (Tesla Roadster, ₹70,000/day) for 2 days specifies `estimated_amount` ₹240,000 instead of ₹140,000 (2 × ₹120,000 was calculated from Rolls-Royce Spectre).
- **Severity:** BLOCKER (seed data discrepancies and insufficient vehicle count)
- **Concrete Fix:** Expand `database/seed.sql` to 12–14 vehicles across cars and motorcycles; correct the arithmetic in seed booking records.

---

### Finding 4: Vehicle Categories & Fleet Coverage
- **Files Inspected:** `database/schema.sql`, `database/seed.sql`, `public/vehicles.html`
- **Analysis:**
  - Prompt and PRD §8.2 specify car categories: `Sedan`, `SUV`, `Sports Car`, `Coupe`, `Luxury MPV`.
  - Prompt specifies motorcycle categories: `Sport Bike`, `Cruiser`, `Cafe Racer`.
  - Currently, `database/seed.sql` defines:
    - Motorcycles: `Superbike`, `Cruiser`, `Cafe Racer`. (`Superbike` is used instead of `Sport Bike`).
    - Cars: `Supercar`, `Sports Car`, `Luxury Coupe`.
  - **Gaps:**
    - Car categories missing: `Sedan`, `SUV`, `Luxury MPV`, `Coupe`.
    - Motorcycle category naming: `Sport Bike` is missing (labeled `Superbike`).
- **Severity:** IMPORTANT
- **Concrete Fix:** Update `database/seed.sql` to include `Sedan`, `SUV`, `Sports Car`, `Coupe`, `Luxury MPV` under `Car`, and `Sport Bike`, `Cruiser`, `Cafe Racer` under `Motorcycle`. Seed realistic models for each category.

---

### Finding 5: Booking Calculation & Server-Side Authority
- **Files Inspected:** `routes/bookingRoutes.js`, `public/js/booking.js`, `public/booking.html`
- **Analysis:**
  - In `public/booking.html`: The form inputs are `vehicle_id`, `customer_name`, `phone`, `email`, `pickup_date`, `return_date`, `message`. There is no hidden input for price or amount.
  - In `public/js/booking.js`: The client computes an on-screen preview (`d * price`) and explicitly tells the user: `"(estimate; final amount is calculated by the server)"`.
  - In `routes/bookingRoutes.js` (lines 34–41):
    ```javascript
    const [v] = await db.query('SELECT price_per_day FROM vehicles WHERE vehicle_id = ? AND is_active = 1', [vehicleId]);
    if (!v.length) return res.status(404).json({ errors: ['Vehicle not found or unavailable.'] });
    const days = Math.round((ret - pickup) / DAY);
    const amount = (Number(v[0].price_per_day) * days).toFixed(2);
    ```
  - The server ignores any `price_per_day` or `estimated_amount` that could be submitted in the HTTP POST body. It queries the active vehicle row from MySQL and computes the authoritative total.
- **Severity:** PASS / NO DEFECT

---

### Finding 6: Date Convention Consistency
- **Files Inspected:** `routes/bookingRoutes.js`, `public/js/booking.js`, `public/booking.html`, `database/schema.sql`
- **Analysis:**
  - Requirement: Pickup 25 Oct + Return 27 Oct = 2 rental days (return date is treated as checkout date).
  - Frontend (`public/js/booking.js` line 5):
    `Math.round((new Date(b) - new Date(a)) / DAY)`
    For '2026-10-25' to '2026-10-27', difference is 172,800,000 ms / 86,400,000 ms = 2 days.
  - Backend (`routes/bookingRoutes.js` lines 8, 36):
    `parseDate(s)` parses UTC midnight (`new Date(s + 'T00:00:00Z')`).
    `Math.round((ret - pickup) / DAY)` = 2 days.
  - Database schema: `CONSTRAINT chk_dates CHECK (return_date > pickup_date)`.
  - User copy: `public/booking.html` explicitly notes: `"Return date counts as checkout date (25→27 Oct = 2 days)."`.
- **Severity:** PASS / NO DEFECT

---

### Finding 7: Vehicle Images, Public Assets, Fallback & Mapping
- **Files Inspected:** `assets/`, `public/images/vehicles/`, `public/js/main.js`
- **Analysis:**
  - **Asset storage:** Original images exist in `assets/bikes/` (4 files) and `assets/cars/` (5 files).
  - **Public images:** All 9 images have been copied into `public/images/vehicles/` with normalized lowercase hyphenated filenames:
    - `ducati-panigale.jpg`
    - `indian-chief-bobber.jpg`
    - `indian-scout-101.jpg`
    - `lamborghini-svj.jpg`
    - `maserati-mcpura.jpg`
    - `porsche-911-carrera.jpg`
    - `rolls-royce-spectre.jpg`
    - `royal-enfield-continental-gt.jpg`
    - `tesla-roadster.jpg`
  - **Fallback image:** `public/images/vehicles/fallback.jpg` does NOT exist on disk. Currently `main.js` uses an inline SVG data URI as fallback.
  - **Image mapping documentation:** `assets/IMAGE_MAPPING.md` does NOT exist.
  - **Orphaned assets:** Currently 0 orphaned assets (all 9 source files map to public images and seed rows). However, when adding vehicles for the 10–15 seed requirement, unphotographed vehicles must reference `fallback.jpg`.
- **Severity:** IMPORTANT
- **Concrete Fix:** Create `public/images/vehicles/fallback.jpg` (a neutral, styled automotive placeholder image), update `public/js/main.js` to reference `images/vehicles/fallback.jpg`, and author `assets/IMAGE_MAPPING.md`.

---

### Finding 8: Vehicle Specifications & Invented Specs
- **Files Inspected:** `database/seed.sql`, `public/vehicle-details.html`, PRD §8.3
- **Analysis:**
  - PRD §8.3 Rule: "Only display attributes that exist and have reliable values. Do not invent performance figures or present estimates as manufacturer specifications. If a specification is unknown, omit it or display 'Not available'."
  - Audit of `database/seed.sql`:
    - `horsepower`: Set to `NULL` for 8 of 9 vehicles. Only set for Rolls-Royce Spectre (`577`), which is the genuine official manufacturer rating.
    - `mileage`: Set to `NULL` for all 9 vehicles.
    - `drivetrain`: Set to `NULL` for all 9 vehicles.
    - `engine`: Specified where known (`Thunderstroke 116 V-twin`, `1,250 cc V-twin`, `648 cc parallel twin`, `3.0 L twin-turbo V6`, `Dual electric motors`), `NULL` for others.
  - Audit of `public/vehicle-details.html`:
    - Line 6 defines: `const row=(k,v)=>v===null||v===undefined||v===""?"":'<dt>'+k+'</dt><dd>'+esc(v)+'</dd>';`
    - Missing/NULL attributes are omitted cleanly.
    - Line 13 explicitly displays: `"Only specifications stored for this vehicle are shown. Prices are demo estimates."`
- **Severity:** PASS / COMPLIANT

---

### Finding 9: Manager Dashboard & Status Update Workflow
- **Files Inspected:** `public/manager.html`, `public/js/manager.js`, `routes/bookingRoutes.js`
- **Analysis:**
  - **Presence:** `public/manager.html` and `public/js/manager.js` are present.
  - **API vs Fake Data:** Real API calls are used:
    - `GET /api/bookings` returns database records and aggregate status counts.
    - `PATCH /api/bookings/:id/status` sends `{ status }` and executes `UPDATE booking_requests SET status = ? WHERE booking_id = ?`.
  - **Warning Banner:**
    - Current banner text: `"Local demo only. This page has no login and must not be exposed publicly."`
    - Prompt requires a visible `"Demo only — no authentication"` warning.
- **Severity:** COSMETIC
- **Concrete Fix:** Update `public/manager.html` banner text to prominently display `"Demo only — no authentication. Local demo only; must not be exposed publicly."`.

---

### Finding 10: Security, Environment & Network Configuration
- **Files Inspected:** `server.js`, `routes/bookingRoutes.js`, `routes/vehicleRoutes.js`, `.env.example`, `.gitignore`
- **Analysis:**
  - `.env.example` is present and documents `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`.
  - `.gitignore` correctly ignores `.env` and `node_modules/`.
  - Parameterized queries are used for all dynamic inputs.
  - No database credentials exist in client-side code.
  - **Manager Isolation Defect:**
    - Neither `server.js` nor `routes/bookingRoutes.js` verifies client IP address for manager endpoints (`GET /api/bookings`, `PATCH /api/bookings/:id/status`) or the `/manager.html` page.
    - If hosted on a LAN or port-forwarded, anyone on the network could view booking customer details or update request statuses.
- **Severity:** IMPORTANT
- **Concrete Fix:** Add a lightweight localhost-check middleware for manager endpoints and `/manager.html`, verifying that `req.ip` is a loopback address (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`).

---

### Finding 11: PRD §17 Acceptance Criteria Verification
- **Reference:** PRD §17 (Functional Acceptance Criteria)
- **Status Matrix:**

| Test / Acceptance Criterion | Code Readiness | Integration Verification Status |
| :--- | :--- | :--- |
| **Open catalog** (loads rows from MySQL via Express) | Implemented (`/api/vehicles`) | **UNTESTED** (MySQL offline) |
| **Search/filter/sort** (dynamic query execution) | Implemented (`vehicleRoutes.js`) | **UNTESTED** (MySQL offline) |
| **Open a vehicle** (detail page + specifications) | Implemented (`vehicle-details.html`) | **UNTESTED** (MySQL offline) |
| **Submit valid request** (saves in DB with Pending ID) | Implemented (`POST /api/bookings`) | **UNTESTED** (MySQL offline) |
| **Submit invalid dates / required fields** (server 400 rejection) | Implemented (`bookingRoutes.js`) | **UNTESTED** (MySQL offline) |
| **Change request status** (PATCH updates DB & dashboard) | Implemented (`manager.js`) | **UNTESTED** (MySQL offline) |
| **Restart server** (data persists in MySQL) | Implemented (relational tables) | **UNTESTED** (MySQL offline) |
| **Responsive check** (usable on mobile and desktop) | Implemented (CSS grid/media queries) | **UNTESTED** (needs browser test) |
| **SQL demonstration** (queries file covers DBMS concepts) | Implemented (`database/queries.sql`) | **UNTESTED** (MySQL offline) |

*Note: In the current audit environment, port 3306 is closed and the `mysql` CLI is not in PATH. Real integration tests cannot be faked and are marked UNTESTED per Stage 1/3 rules.*

---

### Finding 12: Directory Hygiene & Extraneous Files
- **Analysis:**
  - Workspace root is `c:\Luxury vehicle system\`.
  - Nested folder `c:\Luxury vehicle system\luxury-vehicle-catalog\` and brace-expansion artifact `{public/` were cleaned up during initial triage.
  - Recursive search confirmed:
    - No `__MACOSX/` directories.
    - No `.DS_Store` files.
    - No duplicate lockfiles.
    - Only valid `package.json` and `package-lock.json` are present.
- **Severity:** PASS / RESOLVED

---

## 3. Findings Log (Prioritized by Severity)

| ID | File Path | Severity | Finding Description | Proposed Fix |
| :--- | :--- | :--- | :--- | :--- |
| **F-01** | `database/seed.sql` | **BLOCKER** | Insufficient seed volume: Only 9 vehicles seeded; PRD §13 mandates 10–15. | Expand `seed.sql` to 12–14 realistic vehicles. |
| **F-02** | `database/seed.sql` | **BLOCKER** | Seed calculation bugs: Booking #2 has ₹255,000 instead of ₹180,000; Booking #3 has ₹240,000 for vehicle 8 instead of ₹140,000. | Fix vehicle IDs and recalculate exact totals (`days × price_per_day`). |
| **F-03** | `database/schema.sql`<br>`database/seed.sql` | **IMPORTANT** | Missing categories: Missing `Sedan`, `SUV`, `Luxury MPV`, `Coupe`. Motorcycle `Sport Bike` labeled `Superbike`. | Add missing categories with descriptions and vehicle type mapping. |
| **F-04** | `public/images/vehicles/` | **IMPORTANT** | Missing fallback image: `public/images/vehicles/fallback.jpg` does not exist on disk. | Create a clean, styled `fallback.jpg` and reference it in `main.js`. |
| **F-05** | `assets/` | **IMPORTANT** | Missing image mapping doc: `assets/IMAGE_MAPPING.md` does not exist. | Create `assets/IMAGE_MAPPING.md` documenting original → public → seed entity. |
| **F-06** | `server.js`<br>`routes/bookingRoutes.js` | **IMPORTANT** | Manager endpoints not restricted to localhost: Anyone on LAN can view/update bookings. | Add loopback IP verification middleware (`127.0.0.1`, `::1`). |
| **F-07** | `public/manager.html` | **COSMETIC** | Warning banner does not include exact required text: "Demo only — no authentication". | Update warning banner to display exact required phrasing. |
| **F-08** | `public/vehicles.html`<br>`public/js/vehicles.js` | **COSMETIC** | Category filter dropdown shows all categories regardless of Car/Motorcycle vehicle type selection. | Filter category dropdown dynamically based on selected vehicle type. |

---

## 4. Proposed Stage 2 Repair Plan

Upon receiving user confirmation, the repairs will be executed in priority order:

1. **Stage 2.1 (Blockers):**
   - Correct the arithmetic errors in `database/seed.sql`.
   - Add new vehicle records across required categories to bring sample count to 12–14 vehicles.
2. **Stage 2.2 (Important):**
   - Update `database/schema.sql` and `database/seed.sql` with full categories:
     - Cars: `Sedan`, `SUV`, `Sports Car`, `Coupe`, `Luxury MPV`
     - Motorcycles: `Sport Bike`, `Cruiser`, `Cafe Racer`
   - Generate `public/images/vehicles/fallback.jpg`.
   - Update `public/js/main.js` to reference `images/vehicles/fallback.jpg` on image load error.
   - Author `assets/IMAGE_MAPPING.md` detailing every image's provenance, semantic filename, and database vehicle link.
   - Add localhost protection middleware in `routes/bookingRoutes.js` and `server.js` for `/manager.html` and `/api/bookings`.
3. **Stage 2.3 (Cosmetics):**
   - Update `public/manager.html` banner text with `"Demo only — no authentication"`.
   - Enhance `public/js/vehicles.js` so selecting "Car" or "Motorcycle" filters the category options accordingly.
4. **Stage 2.4 (Verification & Runbook):**
   - Run `npm install` to install production dependencies.
   - Provide explicit, turnkey MySQL setup instructions for the user to initialize database and test endpoints.
