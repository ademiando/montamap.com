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
const typeSort = document.getElementById('type-sort');
const countrySort = document.getElementById('country-sort');
const destinationSort = document.getElementById('destination-sort');
const difficultySort = document.getElementById('difficulty-sort');
const seasonSort = document.getElementById('season-sort');
const mountainContainer = document.getElementById('mountainContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Toggle Dropdown Menu
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('menu-visible');
  });
  document.addEventListener('click', (event) => {
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
  document.addEventListener('click', (event) => {
    if (!loginButton.contains(event.target) && !loginDropdown.contains(event.target)) {
      loginDropdown.style.display = 'none';
    }
  });
}

// Language Translations
const translations = {
  en: {
    title: "Welcome to Xcapeak",
    description: "This is your mountain tracker and ticket website."
  },
  id: {
    title: "Selamat Datang di Xcapeak",
    description: "Ini adalah situs pelacak gunung dan tiket Anda."
  },
  zh: {
    title: "欢迎来到 Xcapeak",
    description: "这是您的山地追踪和票务网站。"
  },
  hi: {
    title: "Xcapeak में आपका स्वागत है",
    description: "यह आपका पर्वत ट्रैकर और टिकट वेबसाइट है।"
  },
  ru: {
    title: "Добро пожаловать в Xcapeak",
    description: "Это ваш сайт для отслеживания гор и билетов."
  }
};

// Update Language & Currency on change + persist
if (languageSelect) {
  languageSelect.addEventListener('change', () => {
    localStorage.setItem('language', languageSelect.value);
    applyLanguage();
  });
}
if (currencySelect) {
  currencySelect.addEventListener('change', () => {
    localStorage.setItem('currency', currencySelect.value);
  });
}
function applyLanguage() {
  const lang = localStorage.getItem('language') || 'en';
  languageSelect.value = lang;
  title.textContent = translations[lang].title;
  description.textContent = translations[lang].description;
}
function applyCurrency() {
  const cur = localStorage.getItem('currency') || 'usd';
  currencySelect.value = cur;
}

// Function to Switch to Light/Dark Theme
if (lightBtn) lightBtn.addEventListener('click', () => setTheme('light'));
if (darkBtn) darkBtn.addEventListener('click', () => setTheme('dark'));
function setTheme(mode) {
  const html = document.documentElement;
  if (mode === 'dark') {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  }
}

// Pas pertama kali halaman load
window.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem('theme') || 'light');
  applyLanguage();
  applyCurrency();
  applyFilters();
});

// Tab Navigation
function openTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach((content) => {
    content.style.display = 'none';
    content.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.remove('active');
  });
  const selected = document.getElementById(tabName);
  selected.style.display = 'block';
  selected.classList.add('active');
  if (event.currentTarget) event.currentTarget.classList.add('active');
}

// Default Tab Activation
document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.tab.active');
  if (defaultTab) defaultTab.click();
});

// Mountain Data (Updated with nearest city)
const mountainData = [
  {
    name: "Everest",
    city: "Namche Bazaar, Nepal",
    lat: 27.9881,
    lon: 86.9250,
    status: "Open",
    elevation: "8,848 m",
    weather: "-35°C Windy",
    icon: "01d", // OpenWeatherMap Icon ID
    image: "mountain-image/everest.jpg",
    link: "everest"
  },
  {
    name: "K2",
    city: "Skardu, Pakistan",
    lat: 35.8800,
    lon: 76.5151,
    status: "Closed",
    elevation: "8,611 m",
    weather: "-40°C Snow",
    icon: "13d", // Snowy Icon
    image: "mountain-image/k2.jpg",
    link: "k2"
  },
  {
    name: "Kangchenjunga",
    city: "Taplejung, Nepal",
    lat: 27.7000,
    lon: 88.2000,
    status: "Open",
    elevation: "8,586 m",
    weather: "-30°C Cloudy",
    icon: "04d", // Cloudy Icon
    image: "mountain-image/kangchenjunga.jpg",
    link: "kangchenjunga"
  },
  {
    name: "Lhotse",
    city: "Namche Bazaar, Nepal",
    lat: 27.9617,
    lon: 86.9333,
    status: "Open",
    elevation: "8,516 m",
    weather: "-28°C Sunny",
    icon: "01d", // Clear Icon
    image: "mountain-image/lhotse.jpg",
    link: "lhotse"
  },
  {
    name: "Rinjani",
    city: "West Nusa Tenggara, Indonesia",
    lat: -8.4115,
    lon: 116.4577,
    status: "Open",
    elevation: "3,726 m",
    weather: "-6°C Cloudy",
    icon: "04d",
    image: "mountain-image/rinjani.jpg",
    link: "rinjani"
  },
  {
    name: "Cartenz Pyramid",
    city: "Papua, Indonesia",
    lat: -4.0833,
    lon: 137.1833,
    status: "Open",
    elevation: "4,884 m",
    weather: "-10°C Snow",
    icon: "13d",
    image: "mountain-image/cartenz.jpg",
    link: "cartenz"
  },
  {
    name: "Semeru",
    city: "East Java, Indonesia",
    lat: -8.1080,
    lon: 112.9220,
    status: "Open",
    elevation: "3,676 m",
    weather: "-4°C Smoke",
    icon: "50d",
    image: "mountain-image/semeru.jpg",
    link: "semeru"
  },
  {
    name: "Bromo",
    city: "East Java, Indonesia",
    lat: -7.9425,
    lon: 112.9530,
    status: "Open",
    elevation: "2,329 m",
    weather: "2°C Clear",
    icon: "01d",
    image: "mountain-image/bromo.jpg",
    link: "bromo"
  },
  {
    name: "Agung",
    city: "Bali, Indonesia",
    lat: -8.3421,
    lon: 115.5085,
    status: "Open",
    elevation: "3,031 m",
    weather: "3°C Partly Cloudy",
    icon: "03d",
    image: "mountain-image/agung.jpg",
    link: "agung"
  },
  {
    name: "Batur",
    city: "Bali, Indonesia",
    lat: -8.2395,
    lon: 115.3761,
    status: "Open",
    elevation: "1,717 m",
    weather: "7°C Cloudy",
    icon: "04d",
    image: "mountain-image/batur.jpg",
    link: "batur"
  },
  {
    name: "Prau",
    city: "Central Java, Indonesia",
    lat: -7.2079,
    lon: 109.9181,
    status: "Open",
    elevation: "2,590 m",
    weather: "1°C Fog",
    icon: "50d",
    image: "mountain-image/prau.jpg",
    link: "prau"
  },
  {
    name: "Raung",
    city: "East Java, Indonesia",
    lat: -8.1255,
    lon: 114.0428,
    status: "Open",
    elevation: "3,344 m",
    weather: "-2°C Cloudy",
    icon: "04d",
    image: "mountain-image/raung.jpg",
    link: "raung"
  },
  {
    name: "Sindoro",
    city: "Central Java, Indonesia",
    lat: -7.3006,
    lon: 110.0571,
    status: "Open",
    elevation: "3,150 m",
    weather: "-1°C Clear",
    icon: "01d",
    image: "mountain-image/sindoro.jpg",
    link: "sindoro"
  },
  {
    name: "Sumbing",
    city: "Central Java, Indonesia",
    lat: -7.3844,
    lon: 110.0722,
    status: "Open",
    elevation: "3,371 m",
    weather: "-1°C Partly Cloudy",
    icon: "03d",
    image: "mountain-image/sumbing.jpg",
    link: "sumbing"
  },
  {
    name: "Merapi",
    city: "Yogyakarta, Indonesia",
    lat: -7.5407,
    lon: 110.4462,
    status: "Closed",
    elevation: "2,930 m",
    weather: "0°C Smoke",
    icon: "50d",
    image: "mountain-image/merapi.jpg",
    link: "merapi"
  }
];

// Fetch weather data from OpenWeather API
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

async function fetchWeather(lat, lon) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    if (data.main) {
      return {
        temperature: `${Math.round(data.main.temp)}°C`,
        weather: data.weather[0].main || 'N/A',
        icon: data.weather[0].icon // Get weather icon code
      };
    } else {
      return { temperature: 'N/A', weather: 'N/A', icon: '' };
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    return { temperature: 'N/A', weather: 'N/A', icon: '' };
  }
}

let loaded = 0;
const batch = 6;

// Favorites
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}
function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}
function isFavorite(id) {
  return getFavorites().includes(id);
}
function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  saveFavorites(favs);
  renderMountains(true);
}

// Apply Filters & Search
function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();
  const t = typeSort.value, c = countrySort.value;
  filteredData = mountainData.filter(m =>
    (m.name.toLowerCase().includes(search) || m.city.toLowerCase().includes(search)) &&
    (t === 'type' || m.link.includes(t)) &&
    (c === 'global' || m.city.toLowerCase().includes(c))
  );
  loaded = 0;
  renderMountains(true);
}

// Render Mountains
async function renderMountains(reset = false) {
  if (reset) mountainContainer.innerHTML = '';
  const slice = filteredData.slice(loaded, loaded + batch);
  for (let m of slice) {
    const w = await fetchWeather(m.lat, m.lon);
    const card = document.createElement("div");
    card.className = "mountain-card";
    card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
    card.innerHTML = `
      <img src="${m.image}" alt="${m.name}" class="mountain-image" />
      <div class="favorite-icon" data-id="${m.name}">${isFavorite(m.name) ? "★" : "☆"}</div>
      <div class="gradient-overlay"></div>
      <div class="mountain-info">
        <div class="mountain-name">${m.name}</div>
        <div class="mountain-details">
          ${m.city}<br />
          <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">Status: ${m.status}</span><br />
          Elevation: ${m.elevation}<br />
          <img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}" /> ${w.temperature} | ${w.weather}
        </div>
      </div>`;
    mountainContainer.appendChild(card);
    card.querySelector(".favorite-icon").addEventListener("click", e => {
      e.stopPropagation();
      toggleFavorite(m.name);
    });
  }
  loaded += batch;
  loadMoreBtn.style.display = loaded < filteredData.length ? 'block' : 'none';
}

// Pagination, Search, Sort Events
loadMoreBtn.addEventListener("click", () => renderMountains());
searchInput.addEventListener("input", applyFilters);
[typeSort, countrySort].forEach(el => el.addEventListener("change", applyFilters));

// Initial load
let filteredData = [...mountainData];
renderMountains();