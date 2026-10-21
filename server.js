require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
