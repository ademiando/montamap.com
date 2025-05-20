// === Theme Toggle ===
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
  loadMountains();
  applyTranslations();
});

// === Tab Navigation ===
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(target).classList.remove('hidden');

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// === Language Switch ===
const langToggle = document.getElementById('language-toggle');
langToggle.addEventListener('click', () => {
  const currentLang = document.documentElement.lang;
  const newLang = currentLang === 'en' ? 'id' : 'en';
  document.documentElement.lang = newLang;
  localStorage.setItem('language', newLang);
  applyTranslations();
});

function applyTranslations() {
  const lang = localStorage.getItem('language') || 'en';
  fetch(`/data/lang_${lang}.json`)
    .then(res => res.json())
    .then(data => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) el.textContent = data[key];
      });
    });
}

// === Load Mountain Data ===
const mountainContainer = document.getElementById('mountain-list');
const filterSelect = document.getElementById('mountain-filter');
const searchInput = document.getElementById('search-bar');
let mountains = [];
let currentPage = 1;
const mountainsPerPage = 6;

function loadMountains() {
  fetch('/data/mountains.json')
    .then(res => res.json())
    .then(data => {
      mountains = data;
      renderMountains();
    });
}

function renderMountains() {
  const filter = filterSelect.value;
  const search = searchInput.value.toLowerCase();
  const start = (currentPage - 1) * mountainsPerPage;
  const filtered = mountains.filter(m => 
    (filter === 'all' || m.island === filter) &&
    m.name.toLowerCase().includes(search)
  );
  const paginated = filtered.slice(start, start + mountainsPerPage);

  mountainContainer.innerHTML = '';
  paginated.forEach(mountain => {
    const card = document.createElement('div');
    card.className = 'mountain-card';
    card.innerHTML = `
      <img src="${mountain.image}" alt="${mountain.name}">
      <h3>${mountain.name}</h3>
      <p>${mountain.location}</p>
      <button class="favorite-btn ${isFavorited(mountain.id) ? 'favorited' : ''}" data-id="${mountain.id}">★</button>
    `;
    mountainContainer.appendChild(card);
  });

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleFavorite(btn.dataset.id);
      btn.classList.toggle('favorited');
    });
  });

  document.getElementById('load-more').style.display =
    (start + mountainsPerPage < filtered.length) ? 'block' : 'none';
}

// === Pagination ===
document.getElementById('load-more').addEventListener('click', () => {
  currentPage++;
  renderMountains();
});

// === Filter & Search ===
filterSelect.addEventListener('change', () => {
  currentPage = 1;
  renderMountains();
});
searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderMountains();
});

// === Favorites ===
function toggleFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
}

function isFavorited(id) {
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  return favs.includes(id);
}

// === Weather Tab ===
const weatherContainer = document.getElementById('weather-tab');
const weatherAPI = 'https://api.openweathermap.org/data/2.5/weather';
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

function loadWeatherData() {
  fetch('/data/mountains.json')
    .then(res => res.json())
    .then(mountains => {
      weatherContainer.innerHTML = '';
      mountains.slice(0, 6).forEach(m => {
        fetch(`${weatherAPI}?lat=${m.lat}&lon=${m.lon}&units=metric&appid=${apiKey}`)
          .then(res => res.json())
          .then(data => {
            const div = document.createElement('div');
            div.className = 'weather-card';
            div.innerHTML = `
              <h3>${m.name}</h3>
              <p>${data.weather[0].main}, ${data.main.temp.toFixed(1)}°C</p>
              <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="">
            `;
            weatherContainer.appendChild(div);
          });
      });
    });
}

if (document.getElementById('weather-tab')) loadWeatherData();