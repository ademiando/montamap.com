// =================================================================
// 1) MAPBOX INITIALIZATION
//    (hanya dipanggil saat tab "Maps" dibuka)
// =================================================================
let map;
let mapInitialized = false;

function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  mapboxgl.accessToken = 'pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg';

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [116.4575, -8.4111],
    zoom: 9,
    pitch: 45,
    bearing: -17.6,
    antialias: true
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }),
    'bottom-right'
  );
  map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

  // Style Switcher
  map.on('load', () => {
    if (
      window.mapboxglStyleSwitcher &&
      typeof window.mapboxglStyleSwitcher.MapboxStyleSwitcherControl !== 'undefined'
    ) {
      const StyleSwitcherControl = window.mapboxglStyleSwitcher.MapboxStyleSwitcherControl;
      const styleSwitcher = new StyleSwitcherControl({
        defaultStyle: 'mapbox://styles/mapbox/outdoors-v12',
        styles: [
          { title: 'Outdoors', uri: 'mapbox://styles/mapbox/outdoors-v12' },
          { title: 'Satellite', uri: 'mapbox://styles/mapbox/satellite-v9' },
          { title: 'Satellite 3D', uri: 'mapbox://styles/mapbox/satellite-streets-v12' },
          { title: 'Dark', uri: 'mapbox://styles/mapbox/dark-v11' },
          { title: 'Streets', uri: 'mapbox://styles/mapbox/streets-v12' },
          { title: 'Terrain 3D', uri: 'mapbox://styles/mapbox/outdoors-v12' }
        ]
      });
      map.addControl(styleSwitcher, 'top-right');
    } else {
      console.warn('MapboxStyleSwitcherControl belum tersedia — periksa urutan <script> Anda.');
    }
  });

  // Tombol Reset View
  const resetBtn = document.createElement('button');
  resetBtn.textContent = '↻';
  Object.assign(resetBtn.style, {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 9999,
    padding: '5px',
    background: '#fff',
    border: '1px solid #ccc',
    cursor: 'pointer'
  });
  resetBtn.onclick = () => {
    map.flyTo({ center: [116.4575, -8.4111], zoom: 9, pitch: 45, bearing: -17.6 });
  };
  document.getElementById('map').appendChild(resetBtn);

  // Tombol Download Map
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = '⬇︎';
  Object.assign(downloadBtn.style, {
    position: 'absolute',
    top: '50px',
    left: '10px',
    zIndex: 9999,
    padding: '5px',
    background: '#fff',
    border: '1px solid #ccc',
    cursor: 'pointer'
  });
  downloadBtn.onclick = () => {
    map.getCanvas().toBlob(blob => {
      if (!blob) {
        console.error('Gagal mengambil canvas peta.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'montamap-map.png';
      a.click();
    });
  };
  document.getElementById('map').appendChild(downloadBtn);
}


// =================================================================
// 2) TAB NAVIGATION, MENU & THEME SWITCH
// =================================================================
const menuToggle        = document.getElementById('hamburger');
const dropdownMenu      = document.getElementById('menu');
const languageSelect    = document.getElementById('language');
const currencySelect    = document.getElementById('currency');
const lightBtn          = document.getElementById('lightBtn');
const darkBtn           = document.getElementById('darkBtn');
const favoriteContainer = document.getElementById('favorite-container');

// MENU TOGGLE
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible'));
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('menu-visible');
    }
  });
}

// LANGUAGE & CURRENCY SELECTOR
if (languageSelect && currencySelect) {
  languageSelect.value = localStorage.getItem('language') || 'en';
  currencySelect.value = localStorage.getItem('currency') || 'usd';
  languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value));
  currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));
}

// THEME SWITCH
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn?.classList.toggle('active', mode === 'light');
  darkBtn?.classList.toggle('active', mode === 'dark');
}
lightBtn?.addEventListener('click', () => setTheme('light'));
darkBtn?.addEventListener('click', () => setTheme('dark'));

// TAB NAVIGATION
function openTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  const pane = document.getElementById(tabName);
  if (pane) pane.style.display = 'block';

  let btn;
  if (event && event.currentTarget) {
    btn = event.currentTarget;
  } else {
    btn = Array.from(document.querySelectorAll('.tab')).find(x => x.textContent.trim() === tabName);
  }
  if (btn) btn.classList.add('active');

  if (tabName === 'Favorite') {
    renderFavorites();
  }
  if (tabName === 'Maps') {
    setTimeout(() => {
      initMap();
      map && map.resize();
    }, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem('theme') || 'light');
  initMountainRendering();
  openTab(null, 'Mountain');
});


// =================================================================
// 3) MOUNTAIN & FAVORITES SECTION (Supabase + Filter + Search + Paging)
// =================================================================

// Supabase URL & Key
const supabaseUrl = 'https://wmutwaurieyuujbwvzav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdXR3YXVyaWV5dXVqYnd2emF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NDk1MTcsImV4cCI6MjA2NDUyNTUxN30.hjdpU8Vo7b5x-0VKUMdoe9Qbm189mw7PMvyVnACD7eY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const mountainContainer = document.getElementById("mountainContainer");
const loadMoreBtn       = document.getElementById("loadMoreBtn");
const searchInput       = document.getElementById("searchInput");

// Pagination & batch size
let loaded = 0;
const batch = 6;

// Ambil nilai dropdown filter
function getCurrentFilters() {
  return {
    type:        document.getElementById("type-sort")?.value || '',
    country:     document.getElementById("country-sort")?.value || '',
    destination: document.getElementById("destination-sort")?.value || '',
    difficulty:  document.getElementById("difficulty-sort")?.value || '',
    season:      document.getElementById("season-sort")?.value || ''
  };
}

// Fetch cuaca via OpenWeatherMap
async function fetchWeather(lat, lon) {
  try {
    const apiKey = '3187c49861f858e524980ea8dd0d43c6';
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const d = await res.json();
    return {
      temperature: d?.main?.temp ? `${Math.round(d.main.temp)}°C` : '-',
      weather:     d?.weather?.[0]?.main || 'N/A',
      icon:        d?.weather?.[0]?.icon || ''
    };
  } catch (err) {
    console.error('Error fetchWeather:', err);
    return { temperature: '-', weather: 'N/A', icon: '' };
  }
}

// Buat elemen mountain card sesuai desain final
function createMountainCard(m, w) {
  const card = document.createElement("div");
  card.className = "mountain-card";

  card.addEventListener('click', (evt) => {
    if (evt.target.classList.contains('favorite-icon')) return;
    if (m.slug) {
      window.location.href = `https://montamap.com/mount/${m.slug}`;
    }
  });

  const imgUrl = (m.image_url && m.image_url.trim() !== '')
    ? m.image_url
    : `https://montamap.com/mountain-image/${m.slug}.jpg`;

  const nameText      = m.name                           || '-';
  const locationText  = m.region
                         ? `${m.region}, ${m.country}`
                         : m.country                     || '-';
  const elevationText = (m.elevation_m && !isNaN(m.elevation_m))
                         ? `${m.elevation_m}m`
                         : '-';
  const statusText    = m.status || '-';
  const statusClass   = (statusText.toLowerCase() === 'open') ? 'status-open' : 'status-closed';
  const weatherIcon   = w.icon
                         ? `<img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}" class="weather-icon"/>`
                         : '';
  const weatherText   = (w.temperature && w.weather && w.weather !== 'N/A')
                         ? `${w.temperature} | ${w.weather}`
                         : 'N/A';

  const isFav = isFavorite(m.id);

  card.innerHTML = `
    <img src="${imgUrl}" alt="${nameText}" class="mountain-image" />
    <div class="favorite-icon" title="${isFav ? 'Unfavorite' : 'Favorite'}">
      ${isFav ? '★' : '☆'}
    </div>
    <div class="gradient-overlay"></div>
    <div class="mountain-info">
      <div class="mountain-name">${nameText}</div>
      <div class="mountain-details">
        <span class="${statusClass}">Status: ${statusText}</span><br/>
        ${locationText}<br/>
        Elevation: ${elevationText}<br/>
        ${weatherIcon} ${weatherText}
      </div>
    </div>
  `;

  const favEl = card.querySelector('.favorite-icon');
  favEl.addEventListener('click', (e) => {
    e.stopPropagation();
    let favs = getFavorites();
    if (favs.includes(m.id)) {
      favs = favs.filter(x => x !== m.id);
      favEl.innerHTML = '☆';
      favEl.title = 'Favorite';
    } else {
      favs.push(m.id);
      favEl.innerHTML = '★';
      favEl.title = 'Unfavorite';
    }
    saveFavorites(favs);
    const currentTab = document.querySelector('.tab.active')?.textContent.trim();
    if (currentTab === 'Favorite') {
      renderFavorites();
    }
  });

  return card;
}

// Render daftar gunung dengan filter, search, pagination
async function renderMountains() {
  if (!mountainContainer) return;

  if (loaded === 0) {
    mountainContainer.innerHTML = "";
    loadMoreBtn && (loadMoreBtn.style.display = 'block');
  }

  const filters = getCurrentFilters();
  const rawSearch = searchInput?.value.trim().toLowerCase() || '';

  let query = supabase.from('mountains').select('*');

  if (filters.type && filters.type !== 'type') {
    query = query.ilike('type', `%${filters.type}%`);
  }
  if (filters.country && filters.country !== 'global') {
    query = query.ilike('country', `%${filters.country}%`);
  }
  if (filters.destination && filters.destination !== '') {
    query = query.ilike('destination', `%${filters.destination}%`);
  }
  if (filters.difficulty && filters.difficulty !== 'level') {
    query = query.ilike('difficulty', `%${filters.difficulty}%`);
  }
  if (filters.season && filters.season !== 'any') {
    query = query.contains('season', [filters.season]);
  }

  if (rawSearch) {
    const pattern = `%${rawSearch}%`;
    const orFilter =
      `name.ilike.${pattern},` +
      `region.ilike.${pattern},` +
      `country.ilike.${pattern},` +
      `type.ilike.${pattern},` +
      `destination.ilike.${pattern}`;
    query = query.or(orFilter);
  }

  const { data, error } = await query.range(loaded, loaded + batch - 1);
  if (error) {
    console.error("Supabase error di renderMountains:", error);
    mountainContainer.innerHTML = "<p>Error loading data.</p>";
    loadMoreBtn && (loadMoreBtn.style.display = 'none');
    return;
  }

  if (!data || data.length === 0) {
    if (loaded === 0) {
      mountainContainer.innerHTML = "<p>No mountains found matching your criteria.</p>";
    }
    loadMoreBtn && (loadMoreBtn.style.display = 'none');
    return;
  }

  for (const m of data) {
    const w = await fetchWeather(m.latitude, m.longitude);
    mountainContainer.appendChild(createMountainCard(m, w));
  }

  loaded += data.length;
  if (data.length < batch) {
    loadMoreBtn && (loadMoreBtn.style.display = 'none');
  } else {
    loadMoreBtn && (loadMoreBtn.style.display = 'block');
  }
}

// Inisialisasi Mountain tab (filter, search, paging)
function initMountainRendering() {
  if (!mountainContainer) return;

  renderMountains();

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      renderMountains();
    });
  }

  document.querySelectorAll(".sort-options-container select").forEach(select => {
    select.addEventListener("change", () => {
      loaded = 0;
      renderMountains();
    });
  });

  searchInput?.addEventListener("input", () => {
    loaded = 0;
    renderMountains();
  });
}


// =================================================================
// 4) FAVORITES SECTION (LocalStorage-based)
// =================================================================
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}
function saveFavorites(favs) {
  localStorage.setItem('favorites', JSON.stringify(favs));
}
function isFavorite(id) {
  return getFavorites().includes(id);
}

async function renderFavorites() {
  if (!favoriteContainer) return;

  favoriteContainer.innerHTML = '';
  const favs = getFavorites();
  if (!favs.length) {
    favoriteContainer.textContent = 'No favorites yet.';
    return;
  }

  const { data, error } = await supabase
    .from('mountains')
    .select('*')
    .in('id', favs);

  if (error) {
    console.error("Supabase error di renderFavorites:", error);
    favoriteContainer.innerHTML = "<p>Error loading favorites.</p>";
    return;
  }

  if (!data || data.length === 0) {
    favoriteContainer.innerHTML = "<p>No favorites found in database.</p>";
    return;
  }

  for (const m of data) {
    const w = await fetchWeather(m.latitude, m.longitude);
    favoriteContainer.appendChild(createMountainCard(m, w));
  }
}