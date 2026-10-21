const $ = id => document.getElementById(id), grid = $('grid');
const f = ['search','type','category','fuel','transmission','minPrice','maxPrice','sort'];
async function load() {
  const qs = new URLSearchParams();
  f.forEach(k => { const v = $(k).value.trim(); if (v) qs.set(k, v); });
  grid.innerHTML = '<p class="state">Loading…</p>';
  try {
    const r = await fetch('/api/vehicles?' + qs); if (!r.ok) throw 0;
    const rows = await r.json();
    $('count').textContent = `${rows.length} vehicle${rows.length===1?'':'s'}`;
    grid.innerHTML = rows.length ? rows.map(vehicleCard).join('') : '<p class="state">No vehicles match these filters. Try clearing them.</p>';
  } catch { grid.innerHTML = '<p class="state">Could not load vehicles. Make sure the server and MySQL are running.</p>'; }
}
async function loadCategories() {
  try {
    const { categories } = await (await fetch('/api/vehicles/meta/filters')).json();
    $('category').innerHTML = '<option value="">All</option>' + categories.map(c => `<option>${esc(c.category_name)}</option>`).join('');
  } catch {}
}
let t; f.forEach(k => $(k).addEventListener(k==='search'||k.includes('Price')?'input':'change', () => { clearTimeout(t); t = setTimeout(load, 250); }));
$('clear').onclick = () => { f.forEach(k => $(k).value = k==='sort' ? 'name_asc' : ''); load(); };
loadCategories().then(load);
