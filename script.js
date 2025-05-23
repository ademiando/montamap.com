// =================================================================
// GLOBAL MAPBOX SETTINGS
// =================================================================
let map;
let mapInitialized = false;

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

  const styleSelector = document.getElementById('styleSelector');
  if (styleSelector) {
    styleSelector.addEventListener('change', () => {
      const styles = {
        outdoors:     'mapbox://styles/mapbox/outdoors-v12',
        satellite:    'mapbox://styles/mapbox/satellite-v9',
        outdoors3d:   'mapbox://styles/mapbox/outdoors-v12',
        satellite3d:  'mapbox://styles/mapbox/satellite-streets-v12',
        dark:         'mapbox://styles/mapbox/dark-v11'
      };
      map.setStyle(styles[styleSelector.value]);
    });
  }

  mapInitialized = true;
}

// =================================================================
// MAIN SCRIPT.JS
// =================================================================
let isEditMode = false;

// Elements
const menuToggle        = document.getElementById('hamburger');
const dropdownMenu      = document.getElementById('menu');
const loginButton       = document.getElementById('loginButton');
const loginDropdown     = document.getElementById('loginDropdown');
const languageSelect    = document.getElementById('language');
const currencySelect    = document.getElementById('currency');
const lightBtn          = document.getElementById('lightBtn');
const darkBtn           = document.getElementById('darkBtn');
const searchInput       = document.getElementById('searchInput');
const mountainContainer = document.getElementById('mountainContainer');
const loadMoreBtn       = document.getElementById('loadMoreBtn');
const favoriteContainer = document.getElementById('favorite-container');

// 1) MENU TOGGLE
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible'));
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('menu-visible');
    }
  });
}

// 2) LOGIN DROPDOWN
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () => {
    loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', e => {
    if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target)) {
      loginDropdown.style.display = 'none';
    }
  });
}

// 3) LANGUAGE & CURRENCY PERSISTENCE
languageSelect.value = localStorage.getItem('language') || 'en';
currencySelect.value = localStorage.getItem('currency') || 'usd';
languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value));
currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));

// 4) THEME TOGGLE
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn.classList.toggle('active', mode === 'light');
  darkBtn.classList.toggle('active', mode === 'dark');
}
lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));

// 5) TAB NAVIGATION
function openTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  const sel = document.getElementById(tabName);
  if (sel) sel.style.display = 'block';
  event.currentTarget.classList.add('active');

  if (tabName === 'Favorite') {
    renderFavorites();
  }
  if (tabName === 'Maps') {
    setTimeout(initMap, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // apply saved theme
  setTheme(localStorage.getItem('theme') || 'light');
  // wire up tab buttons
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', e => openTab(e, btn.getAttribute('data-tab')));
  });
  // trigger default tab
  const def = document.querySelector('.tab.active');
  if (def) def.click();
  // init mountain section
  initMountainRendering();
});

// =================================================================
// MOUNTAIN SECTION
// =================================================================
const mountainData = [
  { id:"everest",       name:"Everest",        city:"Namche Bazaar, Nepal",         lat:27.9881,  lon:86.9250,  status:"Open",   elevation:"8,848 m",  weather:"-35°C Windy",        icon:"01d", image:"mountain-image/everest.jpg",       link:"everest" },
  { id:"k2",            name:"K2",             city:"Skardu, Pakistan",             lat:35.8800,  lon:76.5151,  status:"Closed", elevation:"8,611 m",  weather:"-40°C Snow",         icon:"13d", image:"mountain-image/k2.jpg",            link:"k2" },
  { id:"kangchenjunga", name:"Kangchenjunga",  city:"Taplejung, Nepal",             lat:27.7000,  lon:88.2000,  status:"Open",   elevation:"8,586 m",  weather:"-30°C Cloudy",      icon:"04d", image:"mountain-image/kangchenjunga.jpg", link:"kangchenjunga" },
  { id:"lhotse",        name:"Lhotse",         city:"Namche Bazaar, Nepal",         lat:27.9617,  lon:86.9333,  status:"Open",   elevation:"8,516 m",  weather:"-28°C Sunny",       icon:"01d", image:"mountain-image/lhotse.jpg",        link:"lhotse" },
  { id:"rinjani",       name:"Rinjani",        city:"West Nusa Tenggara, Indonesia", lat:-8.4115, lon:116.4577, status:"Open",   elevation:"3,726 m",  weather:"-6°C Cloudy",       icon:"04d", image:"mountain-image/rinjani.jpg",       link:"rinjani" },
  { id:"cartenz",       name:"Cartenz Pyramid",city:"Papua, Indonesia",             lat:-4.0833,  lon:137.1833, status:"Open",   elevation:"4,884 m",  weather:"-10°C Snow",       icon:"13d", image:"mountain-image/cartenz.jpg",       link:"cartenz" },
  { id:"semeru",        name:"Semeru",         city:"East Java, Indonesia",         lat:-8.1080,  lon:112.9220, status:"Open",   elevation:"3,676 m",  weather:"-4°C Smoke",        icon:"50d", image:"mountain-image/semeru.jpg",        link:"semeru" },
  { id:"bromo",         name:"Bromo",          city:"East Java, Indonesia",         lat:-7.9425,  lon:112.9530, status:"Open",   elevation:"2,329 m",  weather:"2°C Clear",        icon:"01d", image:"mountain-image/bromo.jpg",         link:"bromo" },
  { id:"agung",         name:"Agung",          city:"Bali, Indonesia",               lat:-8.3421, lon:115.5085, status:"Open",   elevation:"3,031 m",  weather:"3°C Partly Cloudy",icon:"03d", image:"mountain-image/agung.jpg",         link:"agung" },
  { id:"batur",         name:"Batur",          city:"Bali, Indonesia",               lat:-8.2395, lon:115.3761, status:"Open",   elevation:"1,717 m",  weather:"7°C Cloudy",       icon:"04d", image:"mountain-image/batur.jpg",         link:"batur" },
  { id:"prau",          name:"Prau",           city:"Central Java, Indonesia",      lat:-7.2079, lon:109.9181, status:"Open",   elevation:"2,590 m",  weather:"1°C Fog",          icon:"50d", image:"mountain-image/prau.jpg",          link:"prau" },
  { id:"raung",         name:"Raung",          city:"East Java, Indonesia",         lat:-8.1255, lon:114.0428, status:"Open",   elevation:"3,344 m",  weather:"-2°C Cloudy",      icon:"04d", image:"mountain-image/raung.jpg",         link:"raung" },
  { id:"sindoro",       name:"Sindoro",        city:"Central Java, Indonesia",      lat:-7.3006, lon:110.0571, status:"Open",   elevation:"3,150 m",  weather:"-1°C Clear",       icon:"01d", image:"mountain-image/sindoro.jpg",       link:"sindoro" },
  { id:"sumbing",       name:"Sumbing",        city:"Central Java, Indonesia",      lat:-7.3844, lon:110.0722, status:"Open",   elevation:"3,371 m",  weather:"-1°C Partly Cloudy",icon:"03d", image:"mountain-image/sumbing.jpg",       link:"sumbing" },
  { id:"merapi",        name:"Merapi",         city:"Yogyakarta, Indonesia",        lat:-7.5407, lon:110.4462, status:"Closed", elevation:"2,930 m",  weather:"0°C Smoke",        icon:"50d", image:"mountain-image/merapi.jpg",        link:"merapi" }
];

let loaded = 0;
const batch  = 6;
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

// Initialize mountain rendering & load more
function initMountainRendering() {
  renderMountains();
  loadMoreBtn.addEventListener('click', renderMountains);
}

// Fetch weather from OpenWeatherMap
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` +
      `&appid=${apiKey}&units=metric`
    );
    const d = await res.json();
    return d.main
      ? { temperature: `${Math.round(d.main.temp)}°C`, weather: d.weather[0].main, icon: d.weather[0].icon }
      : { temperature: 'N/A', weather: 'N/A', icon: '' };
  } catch {
    return { temperature: 'N/A', weather: 'N/A', icon: '' };
  }
}

// Favorites logic
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

// Render a batch of mountains
async function renderMountains() {
  const slice = mountainData.slice(loaded, loaded + batch);
  for (let m of slice) {
    const w = await fetchWeather(m.lat, m.lon);
    mountainContainer.appendChild(createMountainCard(m, w));
  }
  loaded += batch;
  if (loaded >= mountainData.length) loadMoreBtn.style.display = 'none';
}

// Create a single mountain card
function createMountainCard(m, w, editMode = false) {
  const card = document.createElement('div');
  card.className = 'mountain-card';
  if (!editMode) {
    card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
  }
  card.innerHTML = `
    <img src="${m.image}" alt="${m.name}" class="mountain-image" />
    <div class="favorite-icon" title="${isFavorite(m.id) ? 'Unfavorite' : 'Favorite'}">
      ${isFavorite(m.id) ? '★' : '☆'}
    </div>
    <div class="gradient-overlay"></div>
    <div class="mountain-info">
      <div class="mountain-name">${m.name}</div>
      <div class="mountain-details">
        ${m.city}<br/>
        <span class="${m.status==='Open'?'status-open':'status-closed'}">Status: ${m.status}</span><br/>
        Elevation: ${m.elevation}<br/>
        <img src="https://openweathermap.org/img/wn/${w.icon}.png" 
             alt="${w.weather}" class="weather-icon"/> ${w.temperature} | ${w.weather}
      </div>
    </div>`;
  const fav = card.querySelector('.favorite-icon');
  fav.addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(m.id);
    fav.textContent = isFavorite(m.id) ? '★' : '☆';
    fav.title      = isFavorite(m.id) ? 'Unfavorite' : 'Favorite';
  });
  return card;
}

// Render favorites tab
async function renderFavorites() {
  favoriteContainer.innerHTML = '';
  const favs = getFavorites();
  if (favs.length === 0) {
    favoriteContainer.textContent = 'No favorites yet.';
    return;
  }
  favs.forEach(async id => {
    const m = mountainData.find(x => x.id === id);
    if (!m) return;
    const w = await fetchWeather(m.lat, m.lon);
    favoriteContainer.appendChild(createMountainCard(m, w, true));
  });
}