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

// 1) Toggle Dropdown Menu
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('menu-visible');
  });
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('menu-visible');
    }
  });
}

// 2) Toggle Login Dropdown
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

// 3) Language & Currency Persistence
languageSelect.value = localStorage.getItem('language') || 'en';
currencySelect.value = localStorage.getItem('currency') || 'usd';
languageSelect.addEventListener('change', () => {
  localStorage.setItem('language', languageSelect.value);
});
currencySelect.addEventListener('change', () => {
  localStorage.setItem('currency', currencySelect.value);
});

// 4) Theme Toggle
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn.classList.toggle('active', mode === 'light');
  darkBtn.classList.toggle('active', mode === 'dark');
}
lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));
setTheme(localStorage.getItem('theme') || 'light');

// 5) Tab Navigation (unchanged)
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

// Mountain data (unchanged)
let mountainData = [];

fetch('/data/mountains.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    mountainData = data;
    renderAllMountains();
  })
  .catch(error => {
    console.error('Error loading mountains.json:', error);
  });

// Weather fetch
const apiKey = '3187c49861f858e524980ea8dd0d43c6';
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const d = await res.json();
    if (d.main) {
      return { temperature:`${Math.round(d.main.temp)}°C`, weather:d.weather[0].main, icon:d.weather[0].icon };
    }
  } catch(e){ console.error(e); }
  return { temperature:'N/A', weather:'N/A', icon:'' };
}

// Favorites logic
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites'))||[];
}
function saveFavorites(a) {
  localStorage.setItem('favorites', JSON.stringify(a));
}
function isFavorite(n) {
  return getFavorites().includes(n);
}
function toggleFavorite(n) {
  let f = getFavorites();
  f.includes(n)? f=f.filter(x=>x!==n) : f.push(n);
  saveFavorites(f);
  renderAllMountains();
}

// 1) Search filter
function filterMountains(q) {
  return mountainData.filter(m=>
    m.name.toLowerCase().includes(q) ||
    m.city.toLowerCase().includes(q) ||
    m.status.toLowerCase().includes(q)
  );
}

// 2) Sort logic
function sortMountains(arr, by) {
  if (by==='name') return arr.slice().sort((a,b)=>a.name.localeCompare(b.name));
  if (by==='elevation') return arr.slice().sort((a,b)=>parseInt(b.elevation)-parseInt(a.elevation));
  return arr;
}

// Render all
async function renderAllMountains() {
  const q = searchInput.value.toLowerCase();
  let list = filterMountains(q);
  list = sortMountains(list, sortSelect.value);

  mountainContainer.innerHTML = '';
  for (const m of list) {
    const w = await fetchWeather(m.lat,m.lon);
    const div = document.createElement('div');
    div.className = 'mountain-card';
    div.innerHTML = `
      <img src="${m.image}" alt="${m.name}" class="mountain-image">
      <div class="mountain-info">
        <div class="mountain-name">${m.name}</div>
        <div class="mountain-details">
          ${m.city}<br>
          <span class="${m.status==='Open'?'status-open':'status-closed'}">Status: ${m.status}</span><br>
          Elevation: ${m.elevation}<br>
          <img src="https://openweathermap.org/img/wn/${w.icon}.png">${w.temperature} | ${w.weather}<br>
        </div>
        <div class="favorite-icon" data-name="${m.name}">
          ${isFavorite(m.name)?'★':'☆'}
        </div>
      </div>`;
    div.querySelector('.favorite-icon').addEventListener('click', e=>{
      e.stopPropagation();
      toggleFavorite(m.name);
    });
    div.addEventListener('click', ()=>location.href=`https://montamap.com/${m.link}`);
    mountainContainer.appendChild(div);
  }
}

// Bind search & sort
searchInput.addEventListener('input', renderAllMountains);
sortSelect.addEventListener('change', renderAllMountains);

// Initial load
window.addEventListener('DOMContentLoaded', renderAllMountains);