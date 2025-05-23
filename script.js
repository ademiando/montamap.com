// ===== GLOBAL STATE =====
let isEditMode = false;
let map;
let mapInitialized = false;
let loaded = 0;
const batch = 6;
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

// ===== ELEMENTS =====
const menuToggle        = document.getElementById('hamburger');
const dropdownMenu      = document.getElementById('menu');
const loginButton       = document.getElementById('loginButton');
const loginDropdown     = document.getElementById('loginDropdown');
const languageSelect    = document.getElementById('language');
const currencySelect    = document.getElementById('currency');
const lightBtn          = document.getElementById('lightBtn');
const darkBtn           = document.getElementById('darkBtn');
const mountainContainer = document.getElementById('mountainContainer');
const loadMoreBtn       = document.getElementById('loadMoreBtn');
const favoriteContainer = document.getElementById('favorite-container');

// ===== MENU TOGGLE =====
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible'));
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('menu-visible');
    }
  });
}

// ===== LOGIN DROPDOWN =====
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () => {
    loginDropdown.style.display = (loginDropdown.style.display === 'block' ? 'none' : 'block');
  });
  document.addEventListener('click', e => {
    if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target)) {
      loginDropdown.style.display = 'none';
    }
  });
}

// ===== LANGUAGE & CURRENCY =====
languageSelect.value = localStorage.getItem('language') || 'en';
currencySelect.value = localStorage.getItem('currency') || 'usd';
languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value));
currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));

// ===== THEME TOGGLE =====
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn.classList.toggle('active', mode === 'light');
  darkBtn.classList.toggle('active', mode === 'dark');
}
lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));

// ===== TAB NAVIGATION =====
function openTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const sel = document.getElementById(tabName);
  if (sel) sel.style.display = 'block';
  event.currentTarget.classList.add('active');
  if (tabName === 'Favorite') renderFavorites();
  if (tabName === 'Maps') setTimeout(initMap, 100);
}
document.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem('theme') || 'light');
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) activeTab.click();
  initMountainRendering();
});

// ===== MOUNTAIN DATA =====
const mountainData = [
  { id: 'everest',  name: 'Everest',  city: 'Namche Bazaar, Nepal',               lat: 27.9881,  lon: 86.9250,  status: 'Open',   elevation: '8,848 m', image: 'mountain-image/everest.jpg',      link: 'everest' },
  { id: 'k2',       name: 'K2',       city: 'Skardu, Pakistan',                  lat: 35.8800,  lon: 76.5151,  status: 'Closed', elevation: '8,611 m', image: 'mountain-image/k2.jpg',           link: 'k2'      },
  { id: 'rinjani',  name: 'Rinjani',  city: 'West Nusa Tenggara, Indonesia',     lat: -8.4115,  lon: 116.4577, status: 'Open',   elevation: '3,726 m', image: 'mountain-image/rinjani.jpg',      link: 'rinjani' },
  // …tambahkan data lain sesuai kebutuhan
];

// ===== WEATHER FETCH =====
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const d = await res.json();
    return d.main
      ? { temp: `${Math.round(d.main.temp)}°C`, icon: d.weather[0].icon, desc: d.weather[0].main }
      : { temp: 'N/A', icon: '', desc: 'N/A' };
  } catch {
    return { temp: 'N/A', icon: '', desc: 'N/A' };
  }
}

// ===== RENDER MOUNTAINS =====
function initMountainRendering() {
  renderMountains();
  loadMoreBtn.addEventListener('click', renderMountains);
}

async function renderMountains() {
  const slice = mountainData.slice(loaded, loaded + batch);
  for (const m of slice) {
    const w = await fetchWeather(m.lat, m.lon);
    mountainContainer.appendChild(createMountainCard(m, w));
  }
  loaded += batch;
  if (loaded >= mountainData.length) loadMoreBtn.style.display = 'none';
}

function createMountainCard(m, w, edit = false) {
  const card = document.createElement('div');
  card.className = 'mountain-card';
  if (!edit) card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
  card.innerHTML = `
    <img src="${m.image}" alt="${m.name}" class="mountain-image"/>
    <div class="favorite-icon" data-id="${m.id}">☆</div>
    <div class="mountain-details">
      <h3>${m.name}</h3>
      <p>${m.city}</p>
      <p>${m.elevation}</p>
      <p><img src="https://openweathermap.org/img/wn/${w.icon}.png"/> ${w.temp} | ${w.desc}</p>
    </div>
  `;
  const icon = card.querySelector('.favorite-icon');
  icon.innerText = isFavorite(m.id) ? '★' : '☆';
  icon.title = isFavorite(m.id) ? 'Unfavorite' : 'Favorite';
  icon.addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(m.id);
    if (edit) renderFavorites();
    else icon.innerText = isFavorite(m.id) ? '★' : '☆';
  });
  return card;
}

// ===== FAVORITES =====
function getFavorites() { return JSON.parse(localStorage.getItem('favorites')) || []; }
function saveFavorites(f) { localStorage.setItem('favorites', JSON.stringify(f)); }
function isFavorite(id) { return getFavorites().includes(id); }
function toggleFavorite(id) {
  let f = getFavorites();
  f.includes(id) ? f = f.filter(x => x !== id) : f.push(id);
  saveFavorites(f);
  loaded = 0;
  mountainContainer.innerHTML = '';
  renderMountains();
}

async function renderFavorites() {
  favoriteContainer.innerHTML = '';
  const favs = getFavorites();
  if (!favs.length) {
    favoriteContainer.textContent = 'No favorites yet.';
    return;
  }
  for (const id of favs) {
    const m = mountainData.find(x => x.id === id);
    if (m) {
      const w = await fetchWeather(m.lat, m.lon);
      favoriteContainer.appendChild(createMountainCard(m, w, true));
    }
  }
}

// ===== MAPBOX =====
function initMap() {
  if (mapInitialized) return;
  mapboxgl.accessToken = 'pk.eyJ1IjoibW9udGFtYXBwIiwiYSI6ImNsamM0aGNkZDAxM3Mza3FuZzhid2plcHAifQ.nZ_xTAcBW0sNHi0Utyh9Kg';
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [116.4575, -8.4111],
    zoom: 9
  });
  map.addControl(new mapboxgl.NavigationControl());
  const sel = document.getElementById('styleSelector');
  if (sel) sel.addEventListener('change', () => {
    const styles = {
      outdoors: 'outdoors-v12',
      satellite: 'satellite-v9',
      outdoors3d: 'outdoors-v12',
      satellite3d: 'satellite-streets-v12',
      dark: 'dark-v11'
    };
    map.setStyle(`mapbox://styles/mapbox/${styles[sel.value]}`);
  });
  mapInitialized = true;
}