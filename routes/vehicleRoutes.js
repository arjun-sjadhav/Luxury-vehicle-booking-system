const router = require('express').Router();
const db = require('../config/database');

const BASE = `SELECT v.vehicle_id, b.brand_name, v.model, v.model_year, c.category_name, c.vehicle_type,
  v.price_per_day, v.fuel_type, v.transmission, v.drivetrain, v.engine, v.horsepower,
  v.seating_capacity, v.mileage, v.description, v.image_path
  FROM vehicles v JOIN brands b ON b.brand_id = v.brand_id JOIN categories c ON c.category_id = v.category_id
  WHERE v.is_active = 1`;

const SORTS = {   // whitelist: never interpolate user input into ORDER BY
  price_asc: 'v.price_per_day ASC', price_desc: 'v.price_per_day DESC',
  year_desc: 'v.model_year DESC, b.brand_name', name_asc: 'b.brand_name, v.model'
};

router.get('/', async (req, res) => {
  try {
    const { search, category, fuel, transmission, type, minPrice, maxPrice, sort } = req.query;
    const where = [], params = [];
    if (search)       { where.push('(b.brand_name LIKE ? OR v.model LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (category)     { where.push('c.category_name = ?'); params.push(category); }
    if (type)         { where.push('c.vehicle_type = ?');  params.push(type); }
    if (fuel)         { where.push('v.fuel_type = ?');     params.push(fuel); }
    if (transmission) { where.push('v.transmission = ?');  params.push(transmission); }
    if (minPrice !== undefined && minPrice !== '' && !isNaN(minPrice)) { where.push('v.price_per_day >= ?'); params.push(Number(minPrice)); }
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(maxPrice)) { where.push('v.price_per_day <= ?'); params.push(Number(maxPrice)); }
    const sql = BASE + (where.length ? ' AND ' + where.join(' AND ') : '') + ' ORDER BY ' + (SORTS[sort] || SORTS.name_asc);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Database error' }); }
});

router.get('/meta/filters', async (req, res) => {
  try {
    const [cats] = await db.query('SELECT category_name, vehicle_type FROM categories ORDER BY vehicle_type, category_name');
    res.json({ categories: cats });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Database error' }); }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid vehicle id' });
  try {
    const [rows] = await db.query(BASE + ' AND v.vehicle_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Database error' }); }
});

module.exports = router;
