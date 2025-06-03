// =================================================================
// 1) MAPBOX INITIALIZATION
//    (hanya dipanggil saat tab "Maps" dibuka)
// =================================================================
let map;
let mapInitialized = false;

function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  // Access Token Montamap (pastikan sudah benar)
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg';
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [116.4575, -8.4111], // Lombok sebagai default
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

  // ─────────────────────────────────────────────────────────────────
  // 1.1) Style Switcher (Outdoors, Satellite, Dark, etc.)
  //   Di‐embed langsung agar tombol selalu muncul setelah map load
  // ─────────────────────────────────────────────────────────────────
  const styleSwitcher = new MapboxStyleSwitcherControl({
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

  // ─────────────────────────────────────────────────────────────────
  // 1.2) Tombol Reset View (FlyTo)
  // ─────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────
  // 1.3) Tombol Download Map (Screenshot)
  // ─────────────────────────────────────────────────────────────────
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
      a.download = 'montamap-map.png';
      a.click();
    });
  };
  document.getElementById('map').appendChild(downloadBtn);

  // ─────────────────────────────────────────────────────────────────
  // Setelah map load: tambahkan terrain DEM & GeoJSON mountains
  // ─────────────────────────────────────────────────────────────────
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
      data: 'data/mountains_indonesia.geojson' // Pastikan path valid
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
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 50, duration: 1000 });
        }
      })
      .catch(err => console.error('Error fetching GeoJSON:', err));

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
// 2) TAB NAVIGATION, MENU & THEME SWITCH
// =================================================================

// Ambil elemen‐elemen yang dibutuhkan:
const menuToggle        = document.getElementById('hamburger');
const dropdownMenu      = document.getElementById('menu');
const languageSelect    = document.getElementById('language');
const currencySelect    = document.getElementById('currency');
const lightBtn          = document.getElementById('lightBtn');
const darkBtn           = document.getElementById('darkBtn');
const favoriteContainer = document.getElementById('favorite-container');

// 2.1) MENU TOGGLE (Hamburger Menu)
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

  // Jika tab Favorite dibuka, render daftar favorite
  if (tabName === 'Favorite') {
    renderFavorites();
  }
  // Jika tab Maps dibuka, init peta
  if (tabName === 'Maps') {
    setTimeout(() => {
      initMap();
      map && map.resize();
    }, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Terapkan tema terakhir (light/dark)
  setTheme(localStorage.getItem('theme') || 'light');

  // Inisialisasi rendering Mountain + event favorites
  initMountainRendering();

  // Tampilkan tab Mountain secara default
  openTab(null, 'Mountain');
});


// =================================================================
// 3) MOUNTAIN & FAVORITES SECTION (Supabase + Filter + Search + Paging)
// =================================================================

// Supabase (UMD)  
const supabaseUrl = 'https://bntqvdqkaikkhlmfxovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHF2ZHFrYWlra2hsbWZ4b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjU1NTIsImV4cCI6MjA2NDIwMTU1Mn0.jG_Mt1-3861ItE2WzpYKKg7So_WKI506c8F9RTPIl44';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
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

// Buat elemen mountain card (**struktur tidak diubah**)
function createMountainCard(m, w) {
  const card = document.createElement("div");
  card.className = "mountain-card";

  // Klik pada card (kecuali icon favorite) navigasi ke detail
  card.addEventListener('click', () => {
    window.location.href = `https://montamap.com/mount/${m.link}`;
  });

  // Fallback agar tidak tampil “undefined”
  const cityText      = m.city       ? m.city : '';
  const elevationText = m.elevation  ? `${m.elevation}m` : '-';
  const weatherIcon   = w.icon       ? `<img src="https://openweathermap.org/img/wn/${w.icon}.png" alt="${w.weather}" class="weather-icon"/>` : '';
  const weatherText   = w.temperature && w.weather ? `${w.temperature} | ${w.weather}` : '';

  // Cek apakah sudah favorite
  const isFav = isFavorite(m.id);

  card.innerHTML = `
    <img src="${m.image_url}" alt="${m.name}" class="mountain-image" />
    <div class="favorite-icon" title="${isFav ? 'Unfavorite' : 'Favorite'}">
      ${isFav ? '★' : '☆'}
    </div>
    <div class="gradient-overlay"></div>
    <div class="mountain-info">
      <div class="mountain-name">${m.name}</div>
      <div class="mountain-details">
        ${cityText}<br/>
        <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">
          Status: ${m.status || '-'}
        </span><br/>
        Elevation: ${elevationText}<br/>
        ${weatherIcon} ${weatherText}
      </div>
    </div>
  `;

  // ─────────────────────────────────────────────────────────────────
  // Toggle favorite icon (klik icon saja)
  // ─────────────────────────────────────────────────────────────────
  const favEl = card.querySelector('.favorite-icon');
  favEl.addEventListener('click', e => {
    e.stopPropagation(); // Hindari klik card properti

    let favs = getFavorites();
    if (favs.includes(m.id)) {
      // Hapus favorite
      favs = favs.filter(x => x !== m.id);
      favEl.innerHTML = '☆';
      favEl.title = 'Favorite';
    } else {
      // Tambah favorite
      favs.push(m.id);
      favEl.innerHTML = '★';
      favEl.title = 'Unfavorite';
    }
    saveFavorites(favs);

    // Jika tab Favorite terbuka, update daftar
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

  // Reset container/pagination jika new render (loaded=0)
  if (loaded === 0) {
    mountainContainer.innerHTML = "";
    loadMoreBtn && (loadMoreBtn.style.display = 'block');
  }

  const filters = getCurrentFilters();
  const rawSearch = searchInput?.value.trim().toLowerCase() || '';

  // Mulai building query Supabase: hanya gunung aktif
  let query = supabase.from('mountains')
                      .select('*')
                      .eq('is_active', true);

  // 1) Filter Type
  if (filters.type && filters.type !== 'type') {
    query = query.eq('type', filters.type);
  }
  // 2) Filter Country
  if (filters.country && filters.country !== 'global') {
    query = query.eq('country', filters.country);
  }
  // 3) Filter Destination (skip default “trending”)
  if (filters.destination && filters.destination !== 'trending') {
    query = query.eq('destination', filters.destination);
  }
  // 4) Filter Difficulty
  if (filters.difficulty && filters.difficulty !== 'level') {
    query = query.eq('difficulty', filters.difficulty);
  }
  // 5) Filter Season (kolom season disimpan sebagai array)
  if (filters.season && filters.season !== 'any') {
    query = query.contains('season', [filters.season]);
  }

  // 6) Search Full‐Text (nama, kota, negara, type)
  if (rawSearch) {
    // Supabase .or() format: 'field1.ilike.%term%,field2.ilike.%term%,...'
    const pattern = `%${rawSearch}%`;
    const orFilter = 
      `name.ilike.${pattern},` +
      `city.ilike.${pattern},` +
      `country.ilike.${pattern},` +
      `type.ilike.${pattern}`;
    query = query.or(orFilter);
  }

  // Pagination: ambil data berdasarkan range loaded .. loaded+batch-1
  const { data, error } = await query.range(loaded, loaded + batch - 1);
  if (error) {
    console.error("Supabase error:", error.message);
    mountainContainer.innerHTML = "<p>Error loading data.</p>";
    return;
  }

  // Jika data kosong
  if (!data || data.length === 0) {
    if (loaded === 0) {
      mountainContainer.innerHTML = "<p>No mountains found matching your criteria.</p>";
    }
    loadMoreBtn && (loadMoreBtn.style.display = 'none');
    return;
  }

  // Iterasi setiap gunung: fetch cuaca + append card
  for (const m of data) {
    const w = await fetchWeather(m.lat, m.lon);
    mountainContainer.appendChild(createMountainCard(m, w));
  }

  loaded += data.length;
  // Tampilkan/hide tombol Load More
  if (data.length < batch) {
    loadMoreBtn && (loadMoreBtn.style.display = 'none');
  } else {
    loadMoreBtn && (loadMoreBtn.style.display = 'block');
  }
}

// Inisialisasi Mountain tab (filter, search, paging)
function initMountainRendering() {
  if (!mountainContainer) return;

  // Render initial batch
  renderMountains();

  // 1) Event listener Load More
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      renderMountains();
    });
  }

  // 2) Event change filter dropdown
  document.querySelectorAll(".sort-options-container select").forEach(select => {
    select.addEventListener("change", () => {
      loaded = 0;
      renderMountains();
    });
  });

  // 3) Event search input (real-time)
  searchInput?.addEventListener("input", () => {
    loaded = 0;
    renderMountains();
  });
}


// =================================================================
// 4) FAVORITES SECTION (LocalStorage‐based)
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

  // Ambil data favorit dari Supabase berdasar daftar ID
  const { data, error } = await supabase
    .from('mountains')
    .select('*')
    .in('id', favs);

  if (error) {
    console.error("Supabase error:", error.message);
    favoriteContainer.innerHTML = "<p>Error loading favorites.</p>";
    return;
  }

  if (!data || data.length === 0) {
    favoriteContainer.innerHTML = "<p>No favorites found in database.</p>";
    return;
  }

  // Render tiap favorit
  for (const m of data) {
    const w = await fetchWeather(m.lat, m.lon);
    favoriteContainer.appendChild(createMountainCard(m, w));
  }
}