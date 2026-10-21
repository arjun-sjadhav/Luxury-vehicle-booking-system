const NAV = [['index.html','Home'],['vehicles.html','Fleet'],['about.html','About'],['contact.html','Contact'],['manager.html','Manager']];
const page = location.pathname.split('/').pop() || 'index.html';
document.getElementById('site-header').innerHTML = `<header class="site"><div class="wrap">
  <a class="logo" href="index.html">LUXE GARAGE</a>
  <nav aria-label="Main">${NAV.map(([h,t]) => `<a href="${h}" class="${h===page?'active':''}">${t}</a>`).join('')}</nav></div></header>`;
document.getElementById('site-footer').innerHTML = `<footer class="site"><div class="wrap">
  <strong style="color:#fff">LUXE GARAGE</strong> — Academic DBMS mini project. Prices are demo estimates, not real rental rates.</div></footer>`;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr = n => '₹' + Number(n).toLocaleString('en-IN', {maximumFractionDigits:0});
const FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect fill="#1D2430" width="100%" height="100%"/><text x="50%" y="50%" fill="#737780" font-family="Arial" font-size="22" text-anchor="middle">Image unavailable</text></svg>');
const imgTag = (v, alt) => `<img src="${esc(v.image_path||'')}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK}'">`;
function vehicleCard(v) {
  const name = `${v.brand_name} ${v.model}`;
  return `<article class="card"><div class="img">${imgTag(v, name)}</div><div class="body">
    <span class="eyebrow">${esc(v.category_name)}</span><h3>${esc(name)}</h3>
    <div><span class="tag">${v.model_year}</span><span class="tag">${esc(v.fuel_type)}</span><span class="tag">${esc(v.transmission)}</span></div>
    <div class="price">${inr(v.price_per_day)} <small>/ day (demo est.)</small></div>
    <div class="actions"><a class="btn ghost sm" href="vehicle-details.html?id=${v.vehicle_id}">View Details</a>
    <a class="btn sm" href="booking.html?vehicle=${v.vehicle_id}">Request</a></div></div></article>`;
}
