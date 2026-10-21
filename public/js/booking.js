const $ = id => document.getElementById(id), form = $('form'), DAY = 86400000;
let price = null;
const today = new Date().toISOString().slice(0,10);
$('pickup_date').min = today; $('return_date').min = today;
const days = () => { const a = $('pickup_date').value, b = $('return_date').value; return a && b ? Math.round((new Date(b) - new Date(a)) / DAY) : 0; };
function estimate() {
  const d = days();
  $('estimate').textContent = !price ? 'Select a vehicle.' : d >= 1 ? `${d} day${d>1?'s':''} × ${inr(price)} = ${inr(d*price)} (estimate; final amount is calculated by the server)` : 'Pick valid dates to see an estimate.';
}
async function init() {
  try {
    const rows = await (await fetch('/api/vehicles?sort=name_asc')).json();
    $('vehicle_id').innerHTML = '<option value="">Select a vehicle</option>' + rows.map(v => `<option value="${v.vehicle_id}" data-p="${v.price_per_day}">${esc(v.brand_name+' '+v.model)}</option>`).join('');
    const pre = new URLSearchParams(location.search).get('vehicle'); if (pre) $('vehicle_id').value = pre;
    onVehicle();
  } catch { show('err', ['Could not load vehicles. Is the server running?']); }
}
function onVehicle() { const o = $('vehicle_id').selectedOptions[0]; price = o && o.dataset.p ? Number(o.dataset.p) : null; estimate(); }
function show(type, msgs) { $('msg').innerHTML = `<div class="alert ${type}" role="alert">${msgs.map(esc).join('<br>')}</div>`; $('msg').scrollIntoView({behavior:'smooth',block:'nearest'}); }
$('vehicle_id').onchange = onVehicle; $('pickup_date').onchange = $('return_date').onchange = estimate;
form.addEventListener('submit', async e => {
  e.preventDefault(); $('msg').innerHTML = '';
  const data = Object.fromEntries(new FormData(form)); const errs = [];
  if (!data.vehicle_id) errs.push('Select a vehicle.');
  if (data.customer_name.trim().length < 2) errs.push('Enter your name.');
  if (!/^[+\d][\d\s-]{6,18}$/.test(data.phone.trim())) errs.push('Enter a valid phone number.');
  if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errs.push('Enter a valid email or leave it blank.');
  if (days() < 1) errs.push('Return date must be later than pickup date.');
  if (errs.length) return show('err', errs);
  const btn = $('submit'); btn.disabled = true;
  try {
    const r = await fetch('/api/bookings', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
    const j = await r.json();
    if (!r.ok) return show('err', j.errors || [j.error || 'Request failed.']);
    form.hidden = true;
    $('msg').innerHTML = `<div class="alert ok"><strong>Request submitted — reference #${j.booking_id}.</strong><br>Status: ${j.status}. This is not a confirmed booking; the manager will review it.<br>${j.total_days} day(s), estimated ${inr(j.estimated_amount)}.</div><a class="btn" href="vehicles.html">Back to fleet</a>`;
  } catch { show('err', ['Network error. Please try again.']); }
  finally { btn.disabled = false; }
});
init();
