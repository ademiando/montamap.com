// Elements
const menuToggle      = document.getElementById('hamburger');
const dropdownMenu    = document.getElementById('menu');
const loginButton     = document.getElementById('loginButton');
const loginDropdown   = document.getElementById('loginDropdown');
const languageSelect  = document.getElementById('language');
const currencySelect  = document.getElementById('currency');
const lightBtn        = document.getElementById('lightBtn');
const darkBtn         = document.getElementById('darkBtn');
const searchInput     = document.getElementById('searchInput');
const mountainContainer = document.getElementById('mountainContainer');
const loadMoreBtn     = document.getElementById('loadMoreBtn');
const favoriteContainer = document.getElementById('favorite-container');
const editFavoritesBtn = document.createElement('button');

// Menu Toggle
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible'));
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target))
      dropdownMenu.classList.remove('menu-visible');
  });
}

// Login Dropdown
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () => {
    loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', e => {
    if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target))
      loginDropdown.style.display = 'none';
  });
}

// Language & Currency
languageSelect.value = localStorage.getItem('language') || 'en';
currencySelect.value = localStorage.getItem('currency') || 'usd';
languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value));
currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));

// Theme Toggle
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn.classList.toggle('active', mode === 'light');
  darkBtn.classList.toggle('active', mode === 'dark');
}
lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));

// Tab Navigation
function openTab(event, tabName) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.style.display = 'none');
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

  const selected = document.getElementById(tabName);
  if (selected) selected.style.display = 'block';
  if (event.currentTarget) event.currentTarget.classList.add('active');

  if (tabName === 'Favorite') renderFavorites();
}
document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.tab.active');
  if (defaultTab) defaultTab.click();
});

// Mountain Data
const mountainData = [
  { id: 'rinjani', name:"Rinjani", city:"NTB, Indonesia", lat:-8.41, lon:116.45, status:"Open", elevation:"3,726 m", image:"mountain-image/rinjani.jpg", link:"rinjani" },
  { id: 'prau', name:"Prau", city:"Central Java", lat:-7.20, lon:109.91, status:"Open", elevation:"2,590 m", image:"mountain-image/prau.jpg", link:"prau" },
  // Tambah lainnya sesuai kebutuhan
];

let loaded = 0;
const batch = 6;
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

// Theme on Load
window.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem('theme') || 'light');
  initMountainRendering();
});

// Cuaca API
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const d = await res.json();
    return d.main ? {
      temperature: `${Math.round(d.main.temp)}°C`,
      weather: d.weather[0].main,
      icon: d.weather[0].icon
    } : { temperature: 'N/A', weather: 'N/A', icon: '' };
  } catch {
    return { temperature: 'N/A', weather: 'N/A', icon: '' };
  }
}

// Favorites
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}
function saveFavorites(f) {
  localStorage.setItem('favorites', JSON.stringify(f));
}
function isFavorite(id) {
  return getFavorites().includes(id);
}
function toggleFavorite(id) {
  let f = getFavorites();
  f.includes(id) ? f = f.filter(x => x !== id) : f.push(id);
  saveFavorites(f);
  loaded = 0;
  mountainContainer.innerHTML = '';
  renderMountains();
}

// Render Gunung
function initMountainRendering() {
  renderMountains();
  loadMoreBtn.addEventListener('click', renderMountains);
}
async function renderMountains() {
  const slice = mountainData.slice(loaded, loaded + batch);
  for (let m of slice) {
    const w = await fetchWeather(m.lat, m.lon);
    const card = createMountainCard(m, w);
    mountainContainer.appendChild(card);
  }
  loaded += batch;
  if (loaded >= mountainData.length) loadMoreBtn.style.display = 'none';
}
function createMountainCard(m, w) {
  const card = document.createElement('div');
  card.className = 'mountain-card';
  card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
  card.innerHTML = `
    <img src="${m.image}" alt="${m.name}" class="mountain-image" />
    <div class="favorite-icon" data-id="${m.id}">
      ${isFavorite(m.id) ? '★' : '☆'}
    </div>
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
  card.querySelector('.favorite-icon').addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(m.id);
  });
  return card;
}

// Favorite Tab
function renderFavorites() {
  const favorites = getFavorites();
  favoriteContainer.innerHTML = '';
  if (favorites.length === 0) {
    favoriteContainer.innerHTML = '<p>No favorites yet.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'favorite-list';

  favorites.forEach(id => {
    const m = mountainData.find(m => m.id === id);
    if (!m) return;
    const item = document.createElement('div');
    item.className = 'favorite-item';
    item.innerHTML = `
      <img src="${m.image}" alt="${m.name}" class="favorite-thumb" />
      <span class="favorite-name">${m.name}</span>`;
    list.appendChild(item);
  });

  // Edit Button
  editFavoritesBtn.className = 'edit-fav-btn';
  editFavoritesBtn.innerHTML = '✏️ Edit';
  editFavoritesBtn.onclick = () => {
    alert('Feature to manage favorites will come soon.');
  };

  favoriteContainer.appendChild(editFavoritesBtn);
  favoriteContainer.appendChild(list);
}