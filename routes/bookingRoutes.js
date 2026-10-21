const router = require('express').Router();
const db = require('../config/database');
const STATUSES = ['Pending', 'Confirmed', 'Rejected', 'Completed'];
const DAY = 86400000;

function parseDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T00:00:00Z');
  return isNaN(d) || d.toISOString().slice(0, 10) !== s ? null : d;
}

router.post('/', async (req, res) => {
  const b = req.body || {};
  const name = String(b.customer_name || '').trim();
  const phone = String(b.phone || '').trim();
  const email = String(b.email || '').trim();
  const message = String(b.message || '').trim();
  const vehicleId = Number(b.vehicle_id);
  const pickup = parseDate(b.pickup_date), ret = parseDate(b.return_date);
  const errors = [];
  if (name.length < 2 || name.length > 100) errors.push('Name must be 2-100 characters.');
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) errors.push('Enter a valid phone number.');
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Enter a valid email or leave it blank.');
  if (message.length > 500) errors.push('Message must be 500 characters or fewer.');
  if (!Number.isInteger(vehicleId) || vehicleId < 1) errors.push('Select a vehicle.');
  if (!pickup || !ret) errors.push('Pickup and return dates are required (YYYY-MM-DD).');
  else {
    const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
    if (pickup < today) errors.push('Pickup date cannot be in the past.');
    if (ret <= pickup) errors.push('Return date must be later than pickup date.');
  }
  if (errors.length) return res.status(400).json({ errors });
  try {
    const [v] = await db.query('SELECT price_per_day FROM vehicles WHERE vehicle_id = ? AND is_active = 1', [vehicleId]);
    if (!v.length) return res.status(404).json({ errors: ['Vehicle not found or unavailable.'] });
    const days = Math.round((ret - pickup) / DAY);            // return date = checkout date (25->27 Oct = 2 days)
    const amount = (Number(v[0].price_per_day) * days).toFixed(2);   // price always from DB, never from client
    const [r] = await db.query(
      `INSERT INTO booking_requests (vehicle_id, customer_name, phone, email, pickup_date, return_date, total_days, estimated_amount, message, status)
       VALUES (?,?,?,?,?,?,?,?,?, 'Pending')`,
      [vehicleId, name, phone, email || null, b.pickup_date, b.return_date, days, amount, message || null]);
    res.status(201).json({ booking_id: r.insertId, status: 'Pending', total_days: days, estimated_amount: amount });
  } catch (e) { console.error(e); res.status(500).json({ errors: ['Database error. Please try again.'] }); }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.booking_id, r.customer_name, r.phone, r.email, r.pickup_date, r.return_date, r.total_days,
              r.estimated_amount, r.message, r.status, r.created_at, CONCAT(b.brand_name, ' ', v.model) AS vehicle
       FROM booking_requests r JOIN vehicles v ON v.vehicle_id = r.vehicle_id JOIN brands b ON b.brand_id = v.brand_id
       ORDER BY r.created_at DESC, r.booking_id DESC`);
    const [counts] = await db.query('SELECT status, COUNT(*) AS n FROM booking_requests GROUP BY status');
    res.json({ bookings: rows, counts: Object.fromEntries(counts.map(c => [c.status, c.n])) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Database error' }); }
});

router.patch('/:id/status', async (req, res) => {
  const id = Number(req.params.id), status = (req.body || {}).status;
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid booking id' });
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Status must be one of: ' + STATUSES.join(', ') });
  try {
    const [r] = await db.query('UPDATE booking_requests SET status = ? WHERE booking_id = ?', [status, id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking_id: id, status });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Database error' }); }
});

module.exports = router;
