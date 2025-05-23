/* ====================================================================== MontaMap: Combined script.js + map.js ====================================================================== */

// Global state let isEditMode = false; let map;                // Mapbox GL map instance let mapInitialized = false;

// Elements const menuToggle        = document.getElementById('hamburger'); const dropdownMenu      = document.getElementById('menu'); const loginButton       = document.getElementById('loginButton'); const loginDropdown     = document.getElementById('loginDropdown'); const languageSelect    = document.getElementById('language'); const currencySelect    = document.getElementById('currency'); const lightBtn          = document.getElementById('lightBtn'); const darkBtn           = document.getElementById('darkBtn'); const searchInput       = document.getElementById('searchInput'); const mountainContainer = document.getElementById('mountainContainer'); const loadMoreBtn       = document.getElementById('loadMoreBtn'); const favoriteContainer = document.getElementById('favorite-container');

// 1) Menu Toggle if (menuToggle && dropdownMenu) { menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible')); document.addEventListener('click', e => { if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) dropdownMenu.classList.remove('menu-visible'); }); }

// 2) Login Dropdown if (loginButton && loginDropdown) { loginButton.addEventListener('click', () => { loginDropdown.style.display = (loginDropdown.style.display === 'block' ? 'none' : 'block'); }); document.addEventListener('click', e => { if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target)) loginDropdown.style.display = 'none'; }); }

// 3) Language & Currency Persistence languageSelect.value = localStorage.getItem('language') || 'en'; currencySelect.value = localStorage.getItem('currency') || 'usd'; languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value)); currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));

// 4) Theme Toggle function setTheme(mode) { document.documentElement.classList.toggle('dark', mode === 'dark'); localStorage.setItem('theme', mode); lightBtn.classList.toggle('active', mode === 'light'); darkBtn.classList.toggle('active', mode === 'dark'); } lightBtn.addEventListener('click', () => setTheme('light')); darkBtn.addEventListener('click', () => setTheme('dark'));

// 5) Tab Navigation + Map init function openTab(event, tabName) { document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none'); document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

const sel = document.getElementById(tabName); if (sel) sel.style.display = 'block'; event.currentTarget.classList.add('active');

if (tabName === 'Favorite') { renderFavorites(); } if (tabName === 'Maps') { // Delay to ensure #map is visible setTimeout(initMap, 100); } } document.addEventListener('DOMContentLoaded', () => { // Apply stored theme setTheme(localStorage.getItem('theme') || 'light'); // Trigger default tab const def = document.querySelector('.tab.active'); if (def) def.click(); // Initialize mountain list initMountainRendering(); });

/* ---------------------------------------------------------------------- Mapbox initialization ---------------------------------------------------------------------- */ function initMap() { if (mapInitialized) return;

mapboxgl.accessToken = 'pk.eyJ1IjoibW9udGFtYXBwIiwiYSI6ImNsamM0aGNkZDAxM3Mza3FuZzhid2plcHAifQ.nZ_xTAcBW0sNHi0Utyh9Kg'; map = new mapboxgl.Map({ container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', center: [116.4575, -8.4111], zoom: 9 }); map.addControl(new mapboxgl.NavigationControl());

// Style switcher const styleSelector = document.getElementById('styleSelector'); styleSelector.addEventListener('change', () => { const styles = { outdoors:    'mapbox://styles/mapbox/outdoors-v12', satellite:   'mapbox://styles/mapbox/satellite-v9', outdoors3d:  'mapbox://styles/mapbox/outdoors-v12', satellite3d: 'mapbox://styles/mapbox/satellite-streets-v12', dark:        'mapbox://styles/mapbox/dark-v11' }; const val = styleSelector.value; if (styles[val]) map.setStyle(styles[val]); });

mapInitialized = true; }

/* ---------------------------------------------------------------------- Mountain & Favorites logic ---------------------------------------------------------------------- / const mountainData = [ / ... (isi data gunung seperti di script awal) ... */ ]; let loaded = 0; const batch = 6; const apiKey = '3187c49861f858e524980ea8dd0d43c6';

function initMountainRendering() { renderMountains(); loadMoreBtn.addEventListener('click', renderMountains); }

async function fetchWeather(lat, lon) { try { const res = await fetch( https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric ); const d = await res.json(); return d.main ? { temperature: ${Math.round(d.main.temp)}°C, weather: d.weather[0].main, icon: d.weather[0].icon } : { temperature: 'N/A', weather: 'N/A', icon: '' }; } catch { return { temperature: 'N/A', weather: 'N/A', icon: '' }; } }

function getFavorites() { return JSON.parse(localStorage.getItem('favorites')) || []; } function saveFavorites(f) { localStorage.setItem('favorites', JSON.stringify(f)); } function isFavorite(id) { return getFavorites().includes(id); }

function toggleFavorite(id) { let f = getFavorites(); f.includes(id) ? f = f.filter(x => x !== id) : f.push(id); saveFavorites(f); // re-render loaded = 0; mountainContainer.innerHTML = ''; renderMountains(); }

async function renderMountains() { const slice = mountainData.slice(loaded, loaded + batch); for (let m of slice) { const w = await fetchWeather(m.lat, m.lon); const card = createMountainCard(m, w); mountainContainer.appendChild(card); } loaded += batch; if (loaded >= mountainData.length) loadMoreBtn.style.display = 'none'; }

function createMountainCard(m, w, edit = false) { const card = document.createElement('div'); card.className = 'mountain-card'; if (!edit) card.onclick = () => window.location.href = https://montamap.com/${m.link}; card.innerHTML = <img src="${m.image}" alt="${m.name}" class="mountain-image" /> <div class="favorite-icon" title="${isFavorite(m.id) ? 'Unfavorite' : 'Favorite'}"> ${isFavorite(m.id) ? '★' : '☆'} </div> <div class="gradient-overlay"></div> <div class="mountain-info"> <div class="mountain-name">${m.name}</div> <div class="mountain-details"> ${m.city}<br /> <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">Status: ${m.status}</span><br /> Elevation: ${m.elevation}<br /> <img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}" class="weather-icon" /> ${w.temperature} | ${w.weather} </div> </div>; const icon = card.querySelector('.favorite-icon'); icon.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(m.id); icon.innerHTML = isFavorite(m.id) ? '★' : '☆'; icon.title = isFavorite(m.id) ? 'Unfavorite' : 'Favorite'; if (edit) renderFavorites(); }); return card; }

async function renderFavorites() { favoriteContainer.innerHTML = ''; const favs = getFavorites(); if (!favs.length) { favoriteContainer.innerHTML = '<p>No favorites yet.</p>'; return; } const grid = document.createElement('div'); grid.className = 'favorite-grid'; for (let id of favs) { const m = mountainData.find(x => x.id === id); if (!m) continue; const w = await fetchWeather(m.lat, m.lon); grid.appendChild(createMountainCard(m, w, true)); } favoriteContainer.appendChild(grid); }

