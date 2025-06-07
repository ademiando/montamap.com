// =================================================================
// 1) MAPBOX INITIALIZATION
//    (hanya dipanggil saat tab "Maps" dibuka)
// =================================================================
let map;
let mapInitialized = false;



function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [116.4575, -8.4111],
    zoom: 9,
    pitch: 45,
    bearing: -17.6,
    antialias: true
  });

  // Kontrol peta dasar
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

  // PASANG STYLE SWITCHER SETELAH MAP LOAD (js pisah)
 




  // 1.4) Tombol Reset View
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

  // 1.5) Tombol Download Map (Screenshot)
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

// 2.1) MENU TOGGLE
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => dropdownMenu.classList.toggle('menu-visible'));
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('menu-visible');
    }
  });
}

// 2.2) LANGUAGE & CURRENCY SELECTOR
if (languageSelect && currencySelect) {
  languageSelect.value = localStorage.getItem('language') || 'en';
  currencySelect.value = localStorage.getItem('currency') || 'usd';
  languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value));
  currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));
}

// 2.3) THEME SWITCH
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn?.classList.toggle('active', mode === 'light');
  darkBtn?.classList.toggle('active', mode === 'dark');
}
lightBtn?.addEventListener('click', () => setTheme('light'));
darkBtn?.addEventListener('click', () => setTheme('dark'));

// 2.4) TAB NAVIGATION
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
    // Beri sedikit waktu agar favoriteContainer siap
    setTimeout(renderFavorites, 50);
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
// 3) MOUNTAIN & FAVORITES SECTION
//    (Supabase + Filter + Search + Paging + Favorite)
// =================================================================

// Inisialisasi Supabase (pakai URL & KEY dari config.js)
const supabase = window.supabase.createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
);

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

// Fetch cuaca via OpenWeatherMap (pakai API key dari config.js)
async function fetchWeather(lat, lon) {
  try {
    const apiKey = CONFIG.OPENWEATHER_API_KEY;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const d = await res.json();
    return {
      temperature: d?.main?.temp != null ? `${Math.round(d.main.temp)}°C` : '-',
      weather:     d?.weather?.[0]?.main || 'N/A',
      icon:        d?.weather?.[0]?.icon || ''
    };
  } catch (err) {
    console.error('Error fetchWeather:', err);
    return { temperature: '-', weather: 'N/A', icon: '' };
  }
}

// Buat elemen mountain card (desain final, termasuk status + cuaca)
function createMountainCard(m, w) {
  const card = document.createElement("div");
  card.className = "mountain-card";

  // Klik di card (kecuali ikon favorite) → navigasi detail
  card.addEventListener('click', (evt) => {
    if (evt.target.classList.contains('favorite-icon')) return;
    if (m.slug) {
      window.location.href = `https://montamap.com/mount/${m.slug}`;
    }
  });

  // Pilih gambar: pakai m.image_url jika ada, kalau tidak fallback berdasarkan slug
  const imgUrl = (m.image_url && m.image_url.trim() !== '')
    ? m.image_url
    : `https://montamap.com/mountain-image/${m.slug}.jpg`;

  // Teks fallback
  const nameText      = m.name                           || '-';
  const locationText  = m.region
                         ? `${m.region}, ${m.country}`
                         : m.country                     || '-';
  const elevationText = (m.elevation_m != null && !isNaN(m.elevation_m))
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

  // Cek favorite (simpan ID integer atau UUID berdasarkan kolom id Supabase)
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

  // Toggle favorite icon
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

    // Jika tab Favorite aktif, re-render ulang
    const currentTab = document.querySelector('.tab.active')?.textContent.trim();
    if (currentTab === 'Favorite') {
      setTimeout(renderFavorites, 50);
    }
  });

  return card;
}

// Render daftar gunung (Mountain tab)
async function renderMountains() {
  if (!mountainContainer) return;

  if (loaded === 0) {
    mountainContainer.innerHTML = "";
    loadMoreBtn && (loadMoreBtn.style.display = 'block');
  }

  const filters = getCurrentFilters();
  const rawSearch = searchInput?.value.trim().toLowerCase() || '';

  // 1) Bangun query Supabase
  let query = supabase.from('mountains').select('*');

  // 2) Filter type
  if (filters.type && filters.type !== 'type') {
    query = query.ilike('type', `%${filters.type}%`);
  }
  // 3) Filter country
  if (filters.country && filters.country !== 'global') {
    query = query.ilike('country', `%${filters.country}%`);
  }
  // 4) Filter destination
  if (filters.destination && filters.destination !== '') {
    query = query.ilike('destination', `%${filters.destination}%`);
  }
  // 5) Filter difficulty
  if (filters.difficulty && filters.difficulty !== 'level') {
    query = query.ilike('difficulty', `%${filters.difficulty}%`);
  }
  // 6) Filter season (kolom season berupa TEXT[])
  if (filters.season && filters.season !== 'any') {
    query = query.contains('season', [filters.season]);
  }

  // 7) Full‐text search across beberapa kolom
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

  // Pagination: ambil dari range loaded..loaded+batch-1
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
    const lat = Array.isArray(m.coordinates) ? m.coordinates[0] : null;
    const lon = Array.isArray(m.coordinates) ? m.coordinates[1] : null;
    const w = (lat != null && lon != null)
      ? await fetchWeather(lat, lon)
      : { temperature: '-', weather: 'N/A', icon: '' };

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

  // Query Supabase menggunakan array integer/UUID IDs
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
    const lat = Array.isArray(m.coordinates) ? m.coordinates[0] : null;
    const lon = Array.isArray(m.coordinates) ? m.coordinates[1] : null;
    const w = (lat != null && lon != null)
      ? await fetchWeather(lat, lon)
      : { temperature: '-', weather: 'N/A', icon: '' };

    favoriteContainer.appendChild(createMountainCard(m, w));
  }
}
