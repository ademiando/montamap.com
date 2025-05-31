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

  // Kontrol map
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'map.png';
      a.click();
    });
  };
  document.getElementById('map').appendChild(downloadBtn);

  // Saat map selesai load, tambahkan data GeoJSON gunung
  map.on('load', () => {
    // 1) Terrain DEM
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb',
      tileSize: 512,
      maxzoom: 14
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

    // 2) Sumber GeoJSON gunung
    map.addSource('mountains', {
      type: 'geojson',
      data: 'data/mountains_indonesia.geojson'
    });

    // 3) Layer circle untuk titik gunung
    map.addLayer({
      id: 'mountain-points',
      type: 'circle',
      source: 'mountains',
      paint: {
        'circle-radius': 4,
        'circle-color': '#333',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1.5
      }
    });

    // 4) Fit bounds sesuai seluruh titik di GeoJSON
    fetch('data/mountains_indonesia.geojson')
      .then(res => res.json())
      .then(geojsonData => {
        const bounds = new mapboxgl.LngLatBounds();
        geojsonData.features.forEach(f => {
          if (f.geometry.type === 'Point') {
            bounds.extend(f.geometry.coordinates);
          }
        });
        map.fitBounds(bounds, { padding: 50, duration: 1000 });
      });

    // 5) Popup interaktif dengan link ke detail gunung
    map.on('click', 'mountain-points', e => {
      const props = e.features[0].properties;
      const name = props.name || 'Unknown';
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const url = `https://montamap.com/mount/${slug}`;

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<strong><a href="${url}" target="_blank" style="text-decoration:none;color:#95ae98;">${name}</a></strong>`)
        .addTo(map);
    });

    map.on('mouseenter', 'mountain-points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'mountain-points', () => {
      map.getCanvas().style.cursor = '';
    });
  });
}


// =================================================================
// 2) TAB NAVIGATION, MENU & LOGIN DROPDOWN, THEME SWITCH
// =================================================================

// Ambil elemen-elemen yang dibutuhkan:
const menuToggle        = document.getElementById('hamburger');
const dropdownMenu      = document.getElementById('menu');
const loginButton       = document.getElementById('loginButton');
const loginDropdown     = document.getElementById('loginDropdown');
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

// 2.2) LOGIN DROPDOWN
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

// 2.3) LANGUAGE & CURRENCY SELECTOR
if (languageSelect && currencySelect) {
  languageSelect.value = localStorage.getItem('language') || 'en';
  currencySelect.value = localStorage.getItem('currency') || 'usd';
  languageSelect.addEventListener('change', () => localStorage.setItem('language', languageSelect.value));
  currencySelect.addEventListener('change', () => localStorage.setItem('currency', currencySelect.value));
}

// 2.4) THEME SWITCH
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn?.classList.toggle('active', mode === 'light');
  darkBtn?.classList.toggle('active', mode === 'dark');
}
lightBtn?.addEventListener('click', () => setTheme('light'));
darkBtn?.addEventListener('click', () => setTheme('dark'));

// 2.5) TAB NAVIGATION
function openTab(event, tabName) {
  // Sembunyikan semua tab-content
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  // Hapus class active pada semua tab button
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  // Tampilkan tab-content sesuai tabName
  const pane = document.getElementById(tabName);
  if (pane) pane.style.display = 'block';

  // Tambahkan class active pada tombol yang sedang dipilih
  let btn;
  if (event && event.currentTarget) {
    btn = event.currentTarget;
  } else {
    btn = Array.from(document.querySelectorAll('.tab'))
      .find(x => x.textContent.trim() === tabName);
  }
  if (btn) btn.classList.add('active');

  // Perilaku khusus tiap tab
  if (tabName === 'Favorite') renderFavorites();
  if (tabName === 'Maps') {
    setTimeout(() => {
      initMap();
      map && map.resize();
    }, 100);
  }
}

// Saat DOM sudah siap, jalankan inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  // Terapkan tema terakhir (light/dark)
  setTheme(localStorage.getItem('theme') || 'light');

  // Inisialisasi tab Mountain + event favorites
  initMountainRendering();

  // Tampilkan tab Mountain secara default
  openTab(null, 'Mountain');
});


// =================================================================
// 3) MOUNTAIN & FAVORITES SECTION (Supabase + Filter + Search + Paging)
// =================================================================

// Supabase sudah tersedia via window.supabase (UMD)  
const supabaseUrl = 'https://bntqvdqkaikkhlmfxovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHF2ZHFrYWlra2hsbWZ4b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjU1NTIsImV4cCI6MjA2NDIwMTU1Mn0.jG_Mt1-3861ItE2WzpYKKg7So_WKI506c8F9RTPIl44';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Elemen-elemen yang dibutuhkan
const mountainContainer = document.getElementById("mountainContainer");
const loadMoreBtn       = document.getElementById("loadMoreBtn");
const searchInput       = document.getElementById("searchInput");

// Pagination & batch size
let loaded = 0;
const batch = 12;

// Ambil nilai dari dropdown filter
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
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const d = await res.json();
    return {
      temperature: d?.main?.temp ? `${Math.round(d.main.temp)}°C` : '-',
      weather:     d?.weather?.[0]?.main || 'N/A',
      icon:        d?.weather?.[0]?.icon || ''
    };
  } catch {
    return { temperature: '-', weather: 'N/A', icon: '' };
  }
}

// Buat elemen mountain card sesuai permintaan
function createMountainCard(m, w) {
  const card = document.createElement("div");
  card.className = "mountain-card";

  card.addEventListener('click', () => {
    window.location.href = `https://montamap.com/mount/${m.link}`;
  });

  card.innerHTML = `
    <img src="${m.image_url}" alt="${m.name}" class="mountain-image"/>
    <div class="favorite-icon" title="${isFavorite(m.id) ? 'Unfavorite' : 'Favorite'}">
      ${isFavorite(m.id) ? '★' : '☆'}
    </div>
    <div class="gradient-overlay"></div>
    <div class="mountain-info">
      <div class="mountain-name">${m.name}</div>
      <div class="mountain-details">
        ${m.city || ''}<br/>
        <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">
          Status: ${m.status}
        </span><br/>
        Elevation: ${m.elevation}m<br/>
        <img src="https://openweathermap.org/img/wn/${w.icon}.png"
          alt="${w.weather}" class="weather-icon"/> ${w.temperature} | ${w.weather}
      </div>
    </div>
  `;

  // Toggle favorite icon
  const favEl = card.querySelector('.favorite-icon');
  favEl.addEventListener('click', e => {
    e.stopPropagation();
    let favs = getFavorites();
    if (favs.includes(m.id)) {
      favs = favs.filter(x => x !== m.id);
    } else {
      favs.push(m.id);
    }
    saveFavorites(favs);
    renderFavorites(); // update tab Favorite
  });

  return card;
}

// Render daftar gunung dengan filter, search, pagination
async function renderMountains() {
  if (loaded === 0) {
    mountainContainer.innerHTML = "";
    loadMoreBtn.style.display = 'block';
  }

  const filters = getCurrentFilters();
  const searchQuery = searchInput?.value.trim().toLowerCase() || '';

  let query = supabase.from('mountains').select('*').eq('is_active', true);

  if (filters.type && filters.type !== 'type') query = query.eq('type', filters.type);
  if (filters.country && filters.country !== 'global') query = query.eq('country', filters.country);
  if (filters.destination && filters.destination !== 'trending') query = query.eq('destination', filters.destination);
  if (filters.difficulty && filters.difficulty !== 'level') query = query.eq('difficulty', filters.difficulty);
  if (filters.season && filters.season !== 'any') query = query.contains('season', [filters.season]);
  if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);

  const { data, error } = await query.range(loaded, loaded + batch - 1);
  if (error) {
    console.error("Supabase error:", error.message);
    mountainContainer.innerHTML = "<p>Error loading data.</p>";
    return;
  }

  for (const m of data) {
    const w = await fetchWeather(m.lat, m.lon);
    mountainContainer.appendChild(createMountainCard(m, w));
  }

  loaded += data.length;
  if (data.length < batch) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
}

// Inisialisasi Mountain tab (filter, search, paging)
function initMountainRendering() {  
  renderMountains();

  // Tombol Load More
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      renderMountains();
    });
  }

  // Event change untuk setiap dropdown filter
  document.querySelectorAll(".sort-options-container select").forEach(select => {
    select.addEventListener("change", () => {
      loaded = 0;
      renderMountains();
    });
  });

  // Event search input (real-time)
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
  // Bersihkan kontainer favorite
  favoriteContainer.innerHTML = '';
  const favs = getFavorites();
  if (!favs.length) {
    favoriteContainer.textContent = 'No favorites yet.';
    return;
  }

  // Ambil data favorit dari Supabase berdasar ID
  const { data, error } = await supabase
    .from('mountains')
    .select('*')
    .in('id', favs);

  if (error) {
    console.error("Supabase error:", error.message);
    favoriteContainer.innerHTML = "<p>Error loading favorites.</p>";
    return;
  }

  // Render tiap favorit
  for (const m of data) {
    const w = await fetchWeather(m.lat, m.lon);
    favoriteContainer.appendChild(createMountainCard(m, w));
  }
}