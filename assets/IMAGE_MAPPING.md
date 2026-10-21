# Vehicle Image Asset Mapping & Provenance

This document records the provenance, source files, web optimization paths, and database seed mappings for fleet imagery utilized in the **Luxury Vehicle Catalog & Booking System**, in accordance with PRD §16.

> **Academic Notice:** All vehicle imagery is utilized strictly under fair-use educational demonstration purposes for an academic college DBMS mini-project.

---

## Fleet Image Mapping Table

| Vehicle ID | Brand | Model | Category | Original Source File | Web Asset Path (`public/`) | Resolution / Format |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Ducati | Panigale | Superbike | `assets/bikes/ducati panigale .jpeg` | `public/images/vehicles/ducati-panigale.jpg` | 640×400 / Web-optimized JPEG |
| **2** | Indian Motorcycle | Chief Bobber | Cruiser | `assets/bikes/indian chief bobber .jpeg` | `public/images/vehicles/indian-chief-bobber.jpg` | 640×400 / Web-optimized JPEG |
| **3** | Indian Motorcycle | Scout 101 | Cruiser | `assets/bikes/indian scout 101.jpeg` | `public/images/vehicles/indian-scout-101.jpg` | 640×400 / Web-optimized JPEG |
| **4** | Royal Enfield | Continental GT 650 | Cafe Racer | `assets/bikes/royalenfield continental gt.jpeg` | `public/images/vehicles/royal-enfield-continental-gt.jpg` | 640×400 / Web-optimized JPEG |
| **5** | Lamborghini | SVJ | Supercar | `assets/cars/lamborghini svj .jpeg` | `public/images/vehicles/lamborghini-svj.jpg` | 640×400 / Web-optimized JPEG |
| **6** | Maserati | MCPura | Supercar | `assets/cars/maserati mcpura.jpeg` | `public/images/vehicles/maserati-mcpura.jpg` | 640×400 / Web-optimized JPEG |
| **7** | Porsche | 911 Carrera GTS | Sports Car | `assets/cars/porsche 911 carrera gt4.jpeg` | `public/images/vehicles/porsche-911-carrera.jpg` | 640×400 / Web-optimized JPEG |
| **8** | Rolls-Royce | Spectre | Luxury Coupe | `assets/cars/rollsroyce spectre.jpeg` | `public/images/vehicles/rolls-royce-spectre.jpg` | 640×400 / Web-optimized JPEG |
| **9** | Tesla | Roadster | Sports Car | `assets/cars/tesla roadster.jpeg` | `public/images/vehicles/tesla-roadster.jpg` | 640×400 / Web-optimized JPEG |
| **—** | *Fallback* | *Fleet Placeholder* | *General* | *Generated SVG / PIL canvas* | `public/images/vehicles/fallback.jpg` | 640×400 / Web-optimized JPEG |

---

## Directory Organization
- **`assets/bikes/`**: Uncompressed original photographic assets for motorcycles.
- **`assets/cars/`**: Uncompressed original photographic assets for luxury cars.
- **`public/images/vehicles/`**: Web-served assets referenced by the `vehicles.image_path` column in MySQL (`database/seed.sql`).
