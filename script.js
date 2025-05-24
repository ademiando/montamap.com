// ================================================================= // GLOBAL MAPBOX SETTINGS // =================================================================

let map; let mapInitialized = false;

function initMap() { if (mapInitialized) return;

mapboxgl.accessToken = 'pk.eyJ1IjoibW9udGFtYXBwIiwiYSI6ImNsamM0aGNkZDAxM3Mza3FuZzhid2plcHAifQ.nZ_xTAcBW0sNHi0Utyh9Kg';

map = new mapboxgl.Map({ container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', center: [116.4575, -8.4111], zoom: 9 });

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => { map.addSource('mountains', { type: 'geojson', data: 'data/mountains_indonesia.geojson' });

map.addLayer({
  id: 'mountain-points',
  type: 'circle',
  source: 'mountains',
  paint: {
    'circle-radius': 6,
    'circle-color': '#e91e63'
  }
});

map.on('click', 'mountain-points', (e) => {
  const props = e.features[0].properties;
  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`<strong>${props.name || 'Unknown'}</strong>`)
    .addTo(map);
});

map.on('mouseenter', 'mountain-points', () => {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'mountain-points', () => {
  map.getCanvas().style.cursor = '';
});

});

const styleSelector = document.getElementById('styleSelector'); if (styleSelector) { styleSelector.addEventListener('change', () => { const styles = { outdoors:     'mapbox://styles/mapbox/outdoors-v12', satellite:    'mapbox://styles/mapbox/satellite-v9', outdoors3d:   'mapbox://styles/mapbox/outdoors-v12', satellite3d:  'mapbox://styles/mapbox/satellite-streets-v12', dark:         'mapbox://styles/mapbox/dark-v11' }; map.setStyle(styles[styleSelector.value]); map.once('styledata', () => map.resize()); }); }

mapInitialized = true; }

// ================================================================= // MAIN SCRIPT.JS // =================================================================

// Elements const menuToggle        = document.getElementById('hamburger'); const dropdownMenu      = document.getElementById('menu'); const loginButton       = document.getElementById('loginButton'); const loginDropdown     = document.getElementById('loginDropdown'); const languageSelect    = document.getElementById('language'); const currencySelect    = document.getElementById('currency'); const lightBtn          = document.getElementById('lightBtn'); const darkBtn           = document.getElementById('darkBtn'); const searchInput       = document.getElementById('searchInput'); const mountainContainer = document.getElementById('mountainContainer'); const loadMoreBtn       = document.getElementById('loadMoreBtn'); const favoriteContainer = document.getElementById('favorite-container');

// Menu Toggle if (menuToggle && dropdownMenu) { menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible')); document.addEventListener('click', (e) => { if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) { dropdownMenu.classList.remove('menu-visible'); } }); }

// Login Dropdown if (loginButton && loginDropdown) { loginButton.addEventListener('click', () => { loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block'; }); document.addEventListener('click', (e) => { if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target)) { loginDropdown.style.display = 'none'; } }); }

// Language & Currency Persistence languageSelect.value = localStorage.getItem('language') || 'en'; currencySelect.value = localStorage.getItem('currency') || 'usd'; languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value)); currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));

// Theme Toggle function setTheme(mode) { document.documentElement.classList.toggle('dark', mode === 'dark'); localStorage.setItem('theme', mode); lightBtn.classList.toggle('active', mode === 'light'); darkBtn.classList.toggle('active', mode === 'dark'); } lightBtn.addEventListener('click', () => setTheme('light')); darkBtn.addEventListener('click', () => setTheme('dark'));

// Tab Navigation function openTab(event, tabName) { document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none'); document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

const sel = document.getElementById(tabName); if (sel) sel.style.display = 'block'; event.currentTarget.classList.add('active');

if (tabName === 'Favorite') renderFavorites();

if (tabName === 'Maps') { setTimeout(() => { initMap(); if (map) map.resize(); }, 100); } }

// Attach tab clicks document.addEventListener('DOMContentLoaded', () => { setTheme(localStorage.getItem('theme') || 'light'); document.querySelectorAll('.tab').forEach(btn => { btn.addEventListener('click', e => { const tab = btn.textContent.trim(); openTab(e, tab); }); }); // Show default const def = document.querySelector('.tab.active'); if (def) def.click(); initMountainRendering(); });

// ================================================================= // MOUNTAIN SECTION // ================================================================= const mountainData = [ /* data unchanged */ ]; let loaded = 0; const batch  = 6; const apiKey = '3187c49861f858e524980ea8dd0d43c6';

function initMountainRendering() { renderMountains(); loadMoreBtn.addEventListener('click', renderMountains); }

async function fetchWeather(lat, lon) { try { const res = await fetch( https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon} + &appid=${apiKey}&units=metric ); const d = await res.json(); return d.main ? { temperature: ${Math.round(d.main.temp)}°C, weather: d.weather[0].main, icon: d.weather[0].icon } : { temperature: 'N/A', weather: 'N/A', icon: '' }; } catch { return { temperature: 'N/A', weather: 'N/A', icon: '' }; } }

function getFavorites() { return JSON.parse(localStorage.getItem('favorites')) || []; } function saveFavorites(f) { localStorage.setItem('favorites', JSON.stringify(f)); } function isFavorite(id) { return getFavorites().includes(id); } function toggleFavorite(id) { let f = getFavorites(); f.includes(id) ? f = f.filter(x => x !== id) : f.push(id); saveFavorites(f); loaded = 0; mountainContainer.innerHTML = ''; renderMountains(); }

async function renderMountains() { const slice = mountainData.slice(loaded, loaded + batch); for (let m of slice) { const w = await fetchWeather(m.lat, m.lon); mountainContainer.appendChild(createMountainCard(m, w)); } loaded += batch; if (loaded >= mountainData.length) loadMoreBtn.style.display = 'none'; }

function createMountainCard(m, w) { const card = document.createElement('div'); card.className = 'mountain-card'; card.addEventListener('click', () => window.location.href = https://montamap.com/${m.link}); card.innerHTML =  <img src="${m.image}" alt="${m.name}" class="mountain-image" /> <div class="favorite-icon" title="${isFavorite(m.id) ? 'Unfavorite' : 'Favorite'}"> ${isFavorite(m.id) ? '★' : '☆'} </div> <div class="gradient-overlay"></div> <div class="mountain-info"> <div class="mountain-name">${m.name}</div> <div class="mountain-details"> ${m.city}<br/> <span class="${m.status==='Open'?'status-open':'status-closed'}">Status: ${m.status}</span><br/> Elevation: ${m.elevation}<br/> <img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}" class="weather-icon"/> ${w.temperature} | ${w.weather} </div> </div>; const fav = card.querySelector('.favorite-icon'); fav.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(m.id); fav.textContent = isFavorite(m.id) ? '★' : '☆'; fav.title = isFavorite(m.id) ? 'Unfavorite' : 'Favorite'; }); return card; }

async function renderFavorites() { favoriteContainer.innerHTML = ''; const favs = getFavorites(); if (!favs.length) return favoriteContainer.textContent = 'No favorites yet.'; for (let id of favs) { const m = mountainData.find(x => x.id === id); if (!m) continue; const w = await fetchWeather(m.lat, m.lon); favoriteContainer.appendChild(createMountainCard(m, w)); } }

