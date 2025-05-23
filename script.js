let isEditMode = false;

// Elements\const menuToggle        = document.getElementById('hamburger'); const dropdownMenu      = document.getElementById('menu'); const loginButton       = document.getElementById('loginButton'); const loginDropdown     = document.getElementById('loginDropdown'); const languageSelect    = document.getElementById('language'); const currencySelect    = document.getElementById('currency'); const lightBtn          = document.getElementById('lightBtn'); const darkBtn           = document.getElementById('darkBtn'); const searchInput       = document.getElementById('searchInput'); const mountainContainer = document.getElementById('mountainContainer'); const loadMoreBtn       = document.getElementById('loadMoreBtn'); const favoriteContainer = document.getElementById('favorite-container');

// Mapbox variables let map; let mapInitialized = false;

// Function to initialize Mapbox map function initMap() { if (mapInitialized) return;

const mapEl = document.getElementById('map'); if (!mapEl) return;

mapboxgl.accessToken = 'pk.eyJ1IjoibW9udGFtYXBwIiwiYSI6ImNsamM0aGNkZDAxM3Mza3FuZzhid2plcHAifQ.nZ_xTAcBW0sNHi0Utyh9Kg'; map = new mapboxgl.Map({ container: 'map', style: 'mapbox://styles/mapbox/outdoors-v12', center: [116.4575, -8.4111], zoom: 9 });

map.addControl(new mapboxgl.NavigationControl());

const styleSelector = document.getElementById('styleSelector'); if (styleSelector) { styleSelector.addEventListener('change', () => { const styles = { outdoors: 'mapbox://styles/mapbox/outdoors-v12', satellite: 'mapbox://styles/mapbox/satellite-v9', outdoors3d: 'mapbox://styles/mapbox/outdoors-v12', satellite3d: 'mapbox://styles/mapbox/satellite-streets-v12', dark: 'mapbox://styles/mapbox/dark-v11' }; map.setStyle(styles[styleSelector.value]); }); }

mapInitialized = true; }

// Menu Toggle if (menuToggle && dropdownMenu) { menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible') ); document.addEventListener('click', e => { if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) { dropdownMenu.classList.remove('menu-visible'); } }); }

// Login Dropdown if (loginButton && loginDropdown) { loginButton.addEventListener('click', () => { loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block'; }); document.addEventListener('click', e => { if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target)) { loginDropdown.style.display = 'none'; } }); }

// Language & Currency Persistence languageSelect.value = localStorage.getItem('language') || 'en'; currencySelect.value = localStorage.getItem('currency') || 'usd'; languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value) ); currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value) );

// Theme Toggle function setTheme(mode) { document.documentElement.classList.toggle('dark', mode === 'dark'); localStorage.setItem('theme', mode); lightBtn.classList.toggle('active', mode === 'light'); darkBtn.classList.toggle('active', mode === 'dark'); }

lightBtn.addEventListener('click', () => setTheme('light')); darkBtn.addEventListener('click', () => setTheme('dark'));

// Tab Navigation function openTab(event, tabName) { document.querySelectorAll('.tab-content').forEach(c => { c.style.display = 'none'; }); document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); });

const sel = document.getElementById(tabName); if (sel) sel.style.display = 'block'; event.currentTarget.classList.add('active');

if (tabName === 'Favorite') { renderFavorites(); } if (tabName === 'Maps') { setTimeout(initMap, 100); } }

document.addEventListener('DOMContentLoaded', () => { setTheme(localStorage.getItem('theme') || 'light');

const defaultTab = document.querySelector('.tab.active'); if (defaultTab) defaultTab.click();

initMountainRendering(); });

// --- MOUNTAIN SECTION --- const mountainData = [ // ... your mountain objects here ]; let loaded = 0; const batch = 6; const apiKey = '3187c49861f858e524980ea8dd0d43c6';

function initMountainRendering() { renderMountains(); loadMoreBtn.addEventListener('click', renderMountains); }

async function fetchWeather(lat, lon) { try { const res = await fetch( https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric ); const data = await res.json(); if (data.main) { return { temperature: ${Math.round(data.main.temp)}°C, weather: data.weather[0].main, icon: data.weather[0].icon }; } } catch (e) { console.error(e); } return { temperature: 'N/A', weather: 'N/A', icon: '' }; }

function getFavorites() { return JSON.parse(localStorage.getItem('favorites')) || []; }

function saveFavorites(favorites) { localStorage.setItem('favorites', JSON.stringify(favorites)); }

function isFavorite(id) { return getFavorites().includes(id); }

function toggleFavorite(id) { let favorites = getFavorites(); if (favorites.includes(id)) { favorites = favorites.filter(x => x !== id); } else { favorites.push(id); } saveFavorites(favorites);

loaded = 0; mountainContainer.innerHTML = ''; renderMountains(); }

async function renderMountains() { const slice = mountainData.slice(loaded, loaded + batch); for (const m of slice) { const w = await fetchWeather(m.lat, m.lon); const card = createMountainCard(m, w); mountainContainer.appendChild(card); } loaded += batch; if (loaded >= mountainData.length) { loadMoreBtn.style.display = 'none'; } }

function createMountainCard(m, w, isEditMode = false) { const card = document.createElement('div'); card.className = 'mountain-card';

if (!isEditMode) { card.onclick = () => { window.location.href = https://montamap.com/${m.link}; }; }

card.innerHTML = ` <img src="${m.image}" alt="${m.name}" class="mountain-image" /> <div class="favorite-icon" data-id="${m.id}" title="${

