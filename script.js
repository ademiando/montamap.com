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
const editFavoritesBtn  = document.createElement('button');

// 1) Menu Toggle
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible'));
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target))
      dropdownMenu.classList.remove('menu-visible');
  });
}

// 2) Login Dropdown
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () => {
    loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', e => {
    if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target))
      loginDropdown.style.display = 'none';
  });
}

// 3) Language & Currency Persistence
languageSelect.value = localStorage.getItem('language') || 'en';
currencySelect.value = localStorage.getItem('currency') || 'usd';
languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value));
currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));

// 4) Theme Toggle
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn.classList.toggle('active', mode === 'light');
  darkBtn.classList.toggle('active', mode === 'dark');
}
lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));

// 5) Tab Navigation
function openTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  const sel = document.getElementById(tabName);
  if (sel) sel.style.display = 'block';
  event.currentTarget.classList.add('active');

  if (tabName === 'Favorite') renderFavorites();
}
document.addEventListener('DOMContentLoaded', () => {
  // apply theme
  setTheme(localStorage.getItem('theme') || 'light');
  // trigger default tab
  const def = document.querySelector('.tab.active');
  if (def) def.click();
  // init mountain rendering
  initMountainRendering();
});

// --- MOUNTAIN SECTION ---
const mountainData = [
  { id: 'everest', name:"Everest", city:"Namche Bazaar, Nepal", lat:27.9881, lon:86.9250, status:"Open", elevation:"8,848 m", image:"mountain-image/everest.jpg", link:"everest" },
  { id: 'k2', name:"K2", city:"Skardu, Pakistan", lat:35.8800, lon:76.5151, status:"Closed", elevation:"8,611 m", image:"mountain-image/k2.jpg", link:"k2" },
  { id: 'rinjani', name:"Rinjani", city:"NTB, Indonesia", lat:-8.4115, lon:116.4577, status:"Open", elevation:"3,726 m", image:"mountain-image/rinjani.jpg", link:"rinjani" },
  { id: 'prau', name:"Prau", city:"Central Java, Indonesia", lat:-7.2079, lon:109.9181, status:"Open", elevation:"2,590 m", image:"mountain-image/prau.jpg", link:"prau" },
  { id: 'bromo', name:"Bromo", city:"East Java, Indonesia", lat:-7.9425, lon:112.9530, status:"Open", elevation:"2,329 m", image:"mountain-image/bromo.jpg", link:"bromo" },
  { id: 'agung', name:"Agung", city:"Bali, Indonesia", lat:-8.3421, lon:115.5085, status:"Open", elevation:"3,031 m", image:"mountain-image/agung.jpg", link:"agung" },
  // …tambahkan data lain sesuai kebutuhan
];

let loaded = 0;
const batch  = 6;
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

function initMountainRendering() {
  renderMountains();
  loadMoreBtn.addEventListener('click', renderMountains);
}

async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const d   = await res.json();
    return d.main
      ? { temperature:`${Math.round(d.main.temp)}°C`, weather:d.weather[0].main, icon:d.weather[0].icon }
      : { temperature:'N/A', weather:'N/A', icon:'' };
  } catch {
    return { temperature:'N/A', weather:'N/A', icon:'' };
  }
}

// Favorites Logic
function getFavorites() { return JSON.parse(localStorage.getItem('favorites')) || []; }
function saveFavorites(f) { localStorage.setItem('favorites', JSON.stringify(f)); }
function isFavorite(id) { return getFavorites().includes(id); }
function toggleFavorite(id) {
  let f = getFavorites();
  f.includes(id) ? f = f.filter(x => x !== id) : f.push(id);
  saveFavorites(f);
  // reset render
  loaded = 0;
  mountainContainer.innerHTML = '';
  renderMountains();
}

// Render batch of mountains
async function renderMountains() {
  const slice = mountainData.slice(loaded, loaded + batch);
  for (let m of slice) {
    const w    = await fetchWeather(m.lat, m.lon);
    const card = createMountainCard(m, w);
    mountainContainer.appendChild(card);
  }
  loaded += batch;
  if (loaded >= mountainData.length) loadMoreBtn.style.display = 'none';
}

// Create single card
function createMountainCard(m, w, isEditMode = false) {
  const card = document.createElement('div');
  card.className = 'mountain-card';

  if (!isEditMode) {
    card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
  }

  card.innerHTML = `
    <img src="${m.image}" alt="${m.name}" class="mountain-image" />
 

    <div class="gradient-overlay"></div>
    <div class="mountain-info">
      <div class="mountain-name">${m.name}</div>
      <div class="mountain-details">
        ${m.city}<br/>
        <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">Status: ${m.status}</span><br/>
        Elevation: ${m.elevation}<br/>
        <img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}" class="weather-icon"/>
        ${w.temperature} | ${w.weather}
      </div>
    </div>`;

   <div class="favorite-icon" data-id="${m.id}" title="${isFavorite(m.id) ? 'Unfavorite' : 'Favorite'}">
      ${isFavorite(m.id) ? '★' : '☆'}
    </div>


// Favorite Icon Tab Favorite
  const favIcon = card.querySelector('.favorite-icon');
  favIcon.addEventListener('click', e => {
  e.stopPropagation();
  toggleFavorite(m.id);

  if (isEditMode) {
    renderFavorites();
  } else {
  favIcon.innerHTML = isFavorite(m.id) ? '★' : '☆';
    favIcon.title = isFavorite(m.id) ? 'Unfavorite' : 'Favorite';
  }
});

  return card;
}

// Render Favorite Card
async function renderFavorites() {
  const favorites = getFavorites();
  favoriteContainer.innerHTML = '';

  // Tombol Edit Favorites Disini Nanti...

   // Container grid kartu
  const grid = document.createElement('div');
  grid.className = 'favorite-grid';

  if (favorites.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No favorites yet.';
    favoriteContainer.appendChild(msg);
    return;
  }

  for (let id of favorites) {
    const m = mountainData.find(m => m.id === id);
    if (!m) continue;
    const w = await fetchWeather(m.lat, m.lon);
    const card = createMountainCard(m, w, isEditMode);
    grid.appendChild(card);
  }

  favoriteContainer.appendChild(grid);
}