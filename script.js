/* ====================================================================== script.js - MontaMap Combined Logic

Pastikan file ini di-include sebelum </body> dengan:

   <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>   <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
   <script src="path/to/script.js"></script>
*/// --- Global State --- let isEditMode = false; let map, mapInitialized = false;

// --- DOM Elements --- const menuToggle        = document.getElementById('hamburger'); const dropdownMenu      = document.getElementById('menu'); const loginButton       = document.getElementById('loginButton'); const loginDropdown     = document.getElementById('loginDropdown'); const languageSelect    = document.getElementById('language'); const currencySelect    = document.getElementById('currency'); const lightBtn          = document.getElementById('lightBtn'); const darkBtn           = document.getElementById('darkBtn'); const mountainContainer = document.getElementById('mountainContainer'); const loadMoreBtn       = document.getElementById('loadMoreBtn'); const favoriteContainer = document.getElementById('favorite-container');

// Expose openTab globally window.openTab = openTab;

// --- Menu Toggle --- if (menuToggle && dropdownMenu) { menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible')); document.addEventListener('click', e => { if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) dropdownMenu.classList.remove('menu-visible'); }); }

// --- Login Dropdown --- if (loginButton && loginDropdown) { loginButton.addEventListener('click', () => { loginDropdown.style.display = (loginDropdown.style.display === 'block' ? 'none' : 'block'); }); document.addEventListener('click', e => { if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target)) loginDropdown.style.display = 'none'; }); }

// --- Language & Currency Persistence --- languageSelect.value = localStorage.getItem('language') || 'en'; currencySelect.value = localStorage.getItem('currency') || 'usd'; languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value)); currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));

// --- Theme Toggle --- function setTheme(mode) { document.documentElement.classList.toggle('dark', mode === 'dark'); localStorage.setItem('theme', mode); lightBtn.classList.toggle('active', mode === 'light'); darkBtn.classList.toggle('active', mode === 'dark'); } lightBtn.addEventListener('click', () => setTheme('light')); darkBtn.addEventListener('click', () => setTheme('dark'));

// --- Tab Navigation --- function openTab(event, tabName) { document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none'); document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

const sel = document.getElementById(tabName); if (!sel) return; sel.style.display = 'block'; event.currentTarget.classList.add('active');

if (tabName === 'Favorite') renderFavorites(); if (tabName === 'Maps') setTimeout(initMap, 100); }

document.addEventListener('DOMContentLoaded', () => { setTheme(localStorage.getItem('theme') || 'light'); const defaultTab = document.querySelector('.tab.active'); if (defaultTab) defaultTab.click(); initMountainRendering(); });

// --- Map Initialization --- function initMap() { if (mapInitialized) return;

mapboxgl.accessToken = 'pk.eyJ1IjoibW9udGFtYXBwIiwiYSI6ImNsamM0aGNkZDAxM3Mza3FuZzhid2plcHAifQ.nZ_xTAcBW0sNHi0Utyh9Kg'; map = new mapboxgl.Map({ container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', center: [116.4575, -8.4111], zoom: 9 }); map.addControl(new mapboxgl.NavigationControl());

const styleSelector = document.getElementById('styleSelector'); styleSelector.addEventListener('change', () => { const styles = { outdoors: 'mapbox://styles/mapbox/outdoors-v12', satellite: 'mapbox://styles/mapbox/satellite-v9', outdoors3d: 'mapbox://styles/mapbox/outdoors-v12', satellite3d: 'mapbox://styles/mapbox/satellite-streets-v12', dark: 'mapbox://styles/mapbox/dark-v11' }; map.setStyle(styles[styleSelector.value] || styles.outdoors); });

mapInitialized = true; }

// --- Mountain Data & Rendering --- const mountainData = [ { id: 'everest', name: 'Everest', city: 'Namche Bazaar, Nepal', lat: 27.9881, lon: 86.9250, status: 'Open', elevation: '8,848 m', icon: '01d', image: 'mountain-image/everest.jpg', link: 'everest' }, /* ... tambahkan data gunung lainnya ... */ ]; let loaded = 0; const batch = 6; const apiKey = '3187c49861f858e524980ea8dd0d43c6';

function initMountainRendering() { renderMountains(); loadMoreBtn.addEventListener('click', renderMountains); }

async function fetchWeather(lat, lon) { try { const res = await fetch(https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric); const d = await res.json(); return d.main ? { temperature: ${Math.round(d.main.temp)}°C, weather: d.weather[0].main, icon: d.weather[0].icon } : { temperature: 'N/A', weather: 'N/A', icon: '' }; } catch { return { temperature: 'N/A', weather: 'N/A', icon: '' }; } }

function getFavorites() { return JSON.parse(localStorage.getItem('favorites')) || []; } function saveFavorites(f) { localStorage.setItem('favorites', JSON.stringify(f)); } function isFavorite(id) { return getFavorites().includes(id); }

function toggleFavorite(id) { let f = getFavorites(); f.includes(id) ? f = f.filter(x => x !== id) : f.push(id); saveFavorites(f); loaded = 0; mountainContainer.innerHTML = ''; renderMountains(); }

async function renderMountains() { const slice = mountainData.slice(loaded, loaded + batch); for (let m of slice) { const w = await fetchWeather(m.lat, m.lon); mountainContainer.appendChild(createMountainCard(m, w)); } loaded += batch; if (loaded >= mountainData.length) loadMoreBtn.style.display = 'none'; }

function createMountainCard(m, w, edit = false) { const card = document.createElement('div'); card.className = 'mountain-card'; if (!edit) card.onclick = () => window.location.href = https://montamap.com/${m.link}; card.innerHTML = <img src="${m.image}" alt="${m.name}" class="mountain-image" /> <div class="favorite-icon" title="${isFavorite(m.id) ? 'Unfavorite' : 'Favorite'}">${isFavorite(m.id) ? '★' : '☆'}</div> <div class="gradient-overlay"></div> <div class="mountain-info"> <div class="mountain-name">${m.name}</div> <div class="mountain-details"> ${m.city}<br/> <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">Status: ${m.status}</span><br/> Elevation: ${m.elevation}<br/> <img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}" class="weather-icon"/> ${w.temperature} | ${w.weather} </div> </div>; const icon = card.querySelector('.favorite-icon'); icon.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(m.id); icon.innerHTML = isFavorite(m.id) ? '★' : '☆'; icon.title = isFavorite(m.id) ? 'Unfavorite' : 'Favorite'; if (edit) renderFavorites(); }); return card; }

async function renderFavorites() { favoriteContainer.innerHTML = ''; const favs = getFavorites(); if (!favs.length) { favoriteContainer.innerHTML = '<p>No favorites yet.</p>'; return; } const grid = document.createElement('div'); grid.className = 'favorite-grid'; for (let id of favs) { const m = mountainData.find(x => x.id === id); if (m) grid.appendChild(createMountainCard(m, await fetchWeather(m.lat, m.lon), true)); } favoriteContainer.appendChild(grid); }

