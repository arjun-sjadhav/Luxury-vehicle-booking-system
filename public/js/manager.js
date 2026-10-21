const $ = id => document.getElementById(id), ST = ['Pending','Confirmed','Rejected','Completed'];
async function load() {
  try {
    const r = await fetch('/api/bookings'); if (!r.ok) throw 0;
    const { bookings, counts } = await r.json();
    $('counts').innerHTML = `<div><b>${bookings.length}</b>Total</div>` + ST.map(s => `<div><b>${counts[s]||0}</b>${s}</div>`).join('');
    $('rows').innerHTML = bookings.length ? bookings.map(b => `<tr>
      <td>#${b.booking_id}</td><td>${esc(b.customer_name)}<br><span class="muted">${esc(b.phone)}${b.email?'<br>'+esc(b.email):''}</span></td>
      <td>${esc(b.vehicle)}</td><td>${esc(b.pickup_date)} → ${esc(b.return_date)}<br><span class="muted">${b.total_days} day(s)</span></td>
      <td>${inr(b.estimated_amount)}</td><td>${b.message?esc(b.message):'<span class="muted">—</span>'}</td>
      <td><span class="status ${b.status}">${b.status}</span></td>
      <td><select aria-label="Status for booking ${b.booking_id}" data-id="${b.booking_id}">${ST.map(s=>`<option ${s===b.status?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')
      : '<tr><td colspan="8" class="state">No booking requests yet.</td></tr>';
  } catch { $('rows').innerHTML = '<tr><td colspan="8" class="state">Could not load bookings. Is the server running?</td></tr>'; }
}
$('rows').addEventListener('change', async e => {
  if (e.target.tagName !== 'SELECT') return;
  const r = await fetch(`/api/bookings/${e.target.dataset.id}/status`, {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:e.target.value})});
  if (!r.ok) alert('Could not update status.');
  load();
});
load();
