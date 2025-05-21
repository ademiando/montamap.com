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

// 1) Dropdown menu
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible'));
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target))
      dropdownMenu.classList.remove('menu-visible');
  });
}

// 2) Login dropdown
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () => {
    loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', e => {
    if (!loginButton.contains(e.target) && !loginDropdown.contains(e.target))
      loginDropdown.style.display = 'none';
  });
}

// 3) Language & currency persistence
languageSelect.value = localStorage.getItem('language') || 'en';
currencySelect.value = localStorage.getItem('currency') || 'usd';
languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value));
currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));

// 4) Theme toggle
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn.classList.toggle('active', mode === 'light');
  darkBtn.classList.toggle('active', mode === 'dark');
}
lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));

// Data & render logic only after DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem('theme') || 'light');
  initMountainRendering();
});

// --- MOUNTAIN SECTION ---
const mountainData = [
  { id: 'everest', name:"Everest", city:"Namche Bazaar, Nepal", lat:27.9881, lon:86.9250, status:"Open", elevation:"8,848 m", image:"mountain-image/everest.jpg", link:"everest" },
  { id: 'k2',     name:"K2",     city:"Skardu, Pakistan",   lat:35.8800, lon:76.5151, status:"Closed", elevation:"8,611 m", image:"mountain-image/k2.jpg",     link:"k2" },
  { id: 'kangchenjunga', name:"Kangchenjunga", city:"Taplejung, Nepal", lat:27.7000, lon:88.2000, status:"Open", elevation:"8,586 m", image:"mountain-image/kangchenjunga.jpg", link:"kangchenjunga" },
  { id: 'lhotse', name:"Lhotse", city:"Namche Bazaar, Nepal", lat:27.9617, lon:86.9333, status:"Open", elevation:"8,516 m", image:"mountain-image/lhotse.jpg", link:"lhotse" },
  { id: 'rinjani', name:"Rinjani", city:"West Nusa Tenggara, Indonesia", lat:-8.4115, lon:116.4577, status:"Open", elevation:"3,726 m", image:"mountain-image/rinjani.jpg", link:"rinjani" },
  { id: 'cartenz', name:"Cartenz Pyramid", city:"Papua, Indonesia", lat:-4.0833, lon:137.1833, status:"Open", elevation:"4,884 m", image:"mountain-image/cartenz.jpg", link:"cartenz" },
  { id: 'semeru', name:"Semeru", city:"East Java, Indonesia", lat:-8.1080, lon:112.9220, status:"Open", elevation:"3,676 m", image:"mountain-image/semeru.jpg", link:"semeru" },
  { id: 'bromo', name:"Bromo", city:"East Java, Indonesia", lat:-7.9425, lon:112.9530, status:"Open", elevation:"2,329 m", image:"mountain-image/bromo.jpg", link:"bromo" },
  { id: 'agung', name:"Agung", city:"Bali, Indonesia", lat:-8.3421, lon:115.5085, status:"Open", elevation:"3,031 m", image:"mountain-image/agung.jpg", link:"agung" },
  { id: 'batur', name:"Batur", city:"Bali, Indonesia", lat:-8.2395, lon:115.3761, status:"Open", elevation:"1,717 m", image:"mountain-image/batur.jpg", link:"batur" },
  { id: 'pra','name':"Prau", city:"Central Java, Indonesia", lat:-7.2079, lon:109.9181, status:"Open", elevation:"2,590 m", image:"mountain-image/prau.jpg", link:"prau" },
  // …tambah lagi sesuai data lengkap
];

let loaded = 0;
const batch = 6;
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

function initMountainRendering() {
  // initial load & load more
  renderMountains();
  loadMoreBtn.addEventListener('click', renderMountains);
}

async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const d = await res.json();
    return d.main
      ? { temperature:`${Math.round(d.main.temp)}°C`, weather:d.weather[0].main, icon:d.weather[0].icon }
      : { temperature:'N/A', weather:'N/A', icon:'' };
  } catch {
    return { temperature:'N/A', weather:'N/A', icon:'' };
  }
}

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
  f.includes(id) ? f = f.filter(x=>x!==id) : f.push(id);
  saveFavorites(f);
  // refresh from beginning
  loaded = 0;
  mountainContainer.innerHTML = '';
  renderMountains();
}

// render batch
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
      ${isFavorite(m.id)? '★':'☆'}
    </div>
    <div class="gradient-overlay"></div>
    <div class="mountain-info">
      <div class="mountain-name">${m.name}</div>
      <div class="mountain-details">
        ${m.city}<br/>
        <span class="${m.status==='Open'?'status-open':'status-closed'}">Status: ${m.status}</span><br/>
        Elevation: ${m.elevation}<br/>
        <img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}" class="weather-icon"/>
        ${w.temperature} | ${w.weather}
      </div>
    </div>`;
  // favorite toggle
  card.querySelector('.favorite-icon').addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(m.id);
  });
  return card;
}







function openTab(evt, tabName) {
  // Sembunyikan semua konten tab
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach(content => content.style.display = "none");

  // Hapus class 'active' dari semua tab
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => tab.classList.remove("active"));

  // Tampilkan konten tab yang diklik
  const activeTab = document.getElementById(tabName);
  if (activeTab) {
    activeTab.style.display = "block";
  }

  // Tandai tombol tab yang aktif
  evt.currentTarget.classList.add("active");
}