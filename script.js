// Elements
const menuToggle = document.getElementById('hamburger');
const dropdownMenu = document.getElementById('menu');
const loginButton = document.getElementById('loginButton');
const loginDropdown = document.getElementById('loginDropdown');
const languageSelect = document.getElementById('language');
const currencySelect = document.getElementById('currency');
const lightBtn = document.getElementById('lightBtn');
const darkBtn = document.getElementById('darkBtn');
const title = document.getElementById('title');
const description = document.getElementById('description');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const mountainContainer = document.getElementById('mountainContainer');

// Toggle Dropdown Menu
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('menu-visible');
  });
  document.addEventListener('click', event => {
    if (!menuToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove('menu-visible');
    }
  });
}

// Toggle Login Dropdown
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () => {
    loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', event => {
    if (!loginButton.contains(event.target) && !loginDropdown.contains(event.target)) {
      loginDropdown.style.display = 'none';
    }
  });
}

// Language & Currency persistence
function applyLanguage(lang) {
  const t = translations[lang];
  if (t) {
    title.textContent = t.title;
    description.textContent = t.description;
    localStorage.setItem('language', lang);
    languageSelect.value = lang;
  }
}
languageSelect.addEventListener('change', () => applyLanguage(languageSelect.value));
const savedLang = localStorage.getItem('language') || 'en';
applyLanguage(savedLang);

currencySelect.addEventListener('change', () => {
  localStorage.setItem('currency', currencySelect.value);
});
currencySelect.value = localStorage.getItem('currency') || 'usd';

// Theme toggle
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn.classList.toggle('active', mode === 'light');
  darkBtn.classList.toggle('active', mode === 'dark');
}
lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));
setTheme(localStorage.getItem('theme') || 'light');

// Tab navigation
function openTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach(c => {
    c.style.display = 'none';
    c.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const sel = document.getElementById(tabName);
  if (sel) {
    sel.style.display = 'block';
    sel.classList.add('active');
  }
  event.currentTarget.classList.add('active');
}
document.addEventListener('DOMContentLoaded', () => {
  const def = document.querySelector('.tab.active');
  if (def) def.click();
});

// Translations data (titles & descriptions)
const translations = {
  en: { title: "Welcome to Montamap", description: "Explore the world's greatest mountains." },
  id: { title: "Selamat Datang di Montamap", description: "Jelajahi gunung-gunung terbaik di dunia." },
  zh: { title: "欢迎来到 Montamap", description: "探索世界上最伟大的山脉。" },
  hi: { title: "मोंटामैप में आपका स्वागत है", description: "दुनिया के महानतम पर्वतों का अन्वेषण करें।" },
  ru: { title: "Добро пожаловать в Montamap", description: "Исследуйте величайшие горы мира." }
};

// Mountain data
const mountainData = [
  { name:"Everest", city:"Namche Bazaar, Nepal", lat:27.9881, lon:86.9250, status:"Open", elevation:"8,848 m", image:"mountain-image/everest.jpg", link:"everest" },
  { name:"K2", city:"Skardu, Pakistan", lat:35.8800, lon:76.5151, status:"Closed", elevation:"8,611 m", image:"mountain-image/k2.jpg", link:"k2" },
  { name:"Kangchenjunga", city:"Taplejung, Nepal", lat:27.7000, lon:88.2000, status:"Open", elevation:"8,586 m", image:"mountain-image/kangchenjunga.jpg", link:"kangchenjunga" },
  { name:"Lhotse", city:"Namche Bazaar, Nepal", lat:27.9617, lon:86.9333, status:"Open", elevation:"8,516 m", image:"mountain-image/lhotse.jpg", link:"lhotse" },
  { name:"Rinjani", city:"West Nusa Tenggara, Indonesia", lat:-8.4115, lon:116.4577, status:"Open", elevation:"3,726 m", image:"mountain-image/rinjani.jpg", link:"rinjani" },
  { name:"Cartenz Pyramid", city:"Papua, Indonesia", lat:-4.0833, lon:137.1833, status:"Open", elevation:"4,884 m", image:"mountain-image/cartenz.jpg", link:"cartenz" },
  { name:"Semeru", city:"East Java, Indonesia", lat:-8.1080, lon:112.9220, status:"Open", elevation:"3,676 m", image:"mountain-image/semeru.jpg", link:"semeru" },
  { name:"Bromo", city:"East Java, Indonesia", lat:-7.9425, lon:112.9530, status:"Open", elevation:"2,329 m", image:"mountain-image/bromo.jpg", link:"bromo" },
  { name:"Agung", city:"Bali, Indonesia", lat:-8.3421, lon:115.5085, status:"Open", elevation:"3,031 m", image:"mountain-image/agung.jpg", link:"agung" },
  { name:"Batur", city:"Bali, Indonesia", lat:-8.2395, lon:115.3761, status:"Open", elevation:"1,717 m", image:"mountain-image/batur.jpg", link:"batur" },
  { name:"Prau", city:"Central Java, Indonesia", lat:-7.2079, lon:109.9181, status:"Open", elevation:"2,590 m", image:"mountain-image/prau.jpg", link:"prau" },
  { name:"Raung", city:"East Java, Indonesia", lat:-8.1255, lon:114.0428, status:"Open", elevation:"3,344 m", image:"mountain-image/raung.jpg", link:"raung" },
  { name:"Sindoro", city:"Central Java, Indonesia", lat:-7.3006, lon:110.0571, status:"Open", elevation:"3,150 m", image:"mountain-image/sindoro.jpg", link:"sindoro" },
  { name:"Sumbing", city:"Central Java, Indonesia", lat:-7.3844, lon:110.0722, status:"Open", elevation:"3,371 m", image:"mountain-image/sumbing.jpg", link:"sumbing" },
  { name:"Merapi", city:"Yogyakarta, Indonesia", lat:-7.5407, lon:110.4462, status:"Closed", elevation:"2,930 m", image:"mountain-image/merapi.jpg", link:"merapi" }
];

// Fetch weather from OpenWeatherMap
const apiKey = '3187c49861f858e524980ea8dd0d43c6';
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await res.json();
    if (data.main) {
      return {
        temperature: `${Math.round(data.main.temp)}°C`,
        weather: data.weather[0].main,
        icon: data.weather[0].icon
      };
    }
  } catch (e) {
    console.error('Weather error', e);
  }
  return { temperature:'N/A', weather:'N/A', icon:'' };
}

// Favorites logic
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}
function saveFavorites(arr) {
  localStorage.setItem('favorites', JSON.stringify(arr));
}
function isFavorite(name) {
  return getFavorites().includes(name);
}
function toggleFavorite(name) {
  let favs = getFavorites();
  if (favs.includes(name)) favs = favs.filter(f=>f!==name);
  else favs.push(name);
  saveFavorites(favs);
  renderAllMountains();
}

// Filter and sort
function filterMountains(query) {
  return mountainData.filter(m =>
    m.name.toLowerCase().includes(query) ||
    m.city.toLowerCase().includes(query) ||
    m.status.toLowerCase().includes(query)
  );
}
function sortMountains(arr, by) {
  if (by==='name') return arr.slice().sort((a,b)=>a.name.localeCompare(b.name));
  if (by==='elevation') return arr.slice().sort((a,b)=>parseInt(b.elevation)-parseInt(a.elevation));
  return arr;
}

// Render
async function renderAllMountains() {
  const q = searchInput.value.toLowerCase();
  let list = filterMountains(q);
  list = sortMountains(list, sortSelect.value);

  mountainContainer.innerHTML = '';
  for (const m of list) {
    const w = await fetchWeather(m.lat, m.lon);
    const card = document.createElement('div');
    card.className = 'mountain-card';
    card.innerHTML = `
      <img src="${m.image}" alt="${m.name}">
      <h3>${m.name}</h3>
      <p>${m.city}</p>
      <p>Elevation: ${m.elevation}</p>
      <p>Status: ${m.status}</p>
      <p>Weather: ${w.temperature}, ${w.weather}
         <img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}">
      </p>
      <button class="favorite-btn" data-name="${m.name}">
        ${isFavorite(m.name)?'★':'☆'} Favorite
      </button>
      <a href="${m.link}" class="details-link">Details</a>
    `;
    mountainContainer.appendChild(card);
  }

  document.querySelectorAll('.favorite-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>toggleFavorite(btn.dataset.name));
  });
}

// Events
searchInput.addEventListener('input', renderAllMountains);
sortSelect.addEventListener('change', renderAllMountains);

// Initial load
window.addEventListener('DOMContentLoaded', renderAllMountains);