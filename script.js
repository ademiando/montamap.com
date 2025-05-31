// GLOBAL MAPBOX SETTINGS

let map;
let mapInitialized = false;

function initMap() {
  if (mapInitialized) return;

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

  // MAP CONTROLS
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }), 'bottom-right');
  map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

  // RESET VIEW BUTTON
  const resetBtn = document.createElement('button');
  resetBtn.textContent = '↻';
  Object.assign(resetBtn.style, {
    position: 'absolute', top: '10px', left: '10px', zIndex: 9999,
    padding: '5px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer'
  });
  resetBtn.onclick = () => {
    map.flyTo({ center: [116.4575, -8.4111], zoom: 9, pitch: 45, bearing: -17.6 });
  };
  document.getElementById('map').appendChild(resetBtn);

  // DOWNLOAD MAP BUTTON
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = '⬇︎';
  Object.assign(downloadBtn.style, {
    position: 'absolute', top: '50px', left: '10px', zIndex: 9999,
    padding: '5px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer'
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

  // LOAD MAP DATA
  map.on('load', () => {
    // Terrain
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb',
      tileSize: 512,
      maxzoom: 14
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

















    // GeoJSON Mountains
map.addSource('mountains', {
  type: 'geojson',
  data: 'data/mountains_indonesia.geojson'
});

map.addLayer({
  id: 'mountain-points',
  type: 'circle',
  source: 'mountains',
  paint: {
    'circle-radius': 3,
    'circle-color': '#333',
    'circle-stroke-color': '#fff',
    'circle-stroke-width': 1.5
  }
});

// Fit Bounds
fetch('data/mountains_indonesia.geojson')
  .then(res => res.json())
  .then(data => {
    const bounds = new mapboxgl.LngLatBounds();
    data.features.forEach(f => {
      if (f.geometry.type === 'Point') bounds.extend(f.geometry.coordinates);
    });
    map.fitBounds(bounds, { padding: 50, duration: 1000 });
  });

// Interaktif Popup dengan Link ke Halaman Gunung
map.on('click', 'mountain-points', e => {
  const props = e.features[0].properties;
  const name = props.name || 'Unknown';
  const slug = name.toLowerCase().replace(/\s+/g, '-'); // Buat URL slug
  const url = `https://montamap.com/${slug}`;

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










    // STYLE SWITCHER aman di dalam on('load')
    if (typeof MapboxStyleSwitcherControl !== 'undefined') {
      map.addControl(new MapboxStyleSwitcherControl({
        defaultStyle: 'mapbox://styles/mapbox/outdoors-v12',
        styles: [
          { title: 'Outdoors', uri: 'mapbox://styles/mapbox/outdoors-v12' },
          { title: 'Satellite', uri: 'mapbox://styles/mapbox/satellite-v9' },
          { title: 'Satellite 3D', uri: 'mapbox://styles/mapbox/satellite-streets-v12' },
          { title: 'Dark', uri: 'mapbox://styles/mapbox/dark-v11' },
          { title: 'Streets', uri: 'mapbox://styles/mapbox/streets-v12' },
          { title: 'Terrain 3D', uri: 'mapbox://styles/mapbox/outdoors-v12' }
        ]
      }), 'top-right');
    } else {
      console.warn('Style Switcher not available when map is loaded.');
    }

  }); // end of map.on('load')

  mapInitialized = true;
}










// =================================================================
// MAIN SCRIPT.JS
// =================================================================

// grab elements
const menuToggle        = document.getElementById('hamburger');
const dropdownMenu      = document.getElementById('menu');
const loginButton       = document.getElementById('loginButton');
const loginDropdown     = document.getElementById('loginDropdown');
const languageSelect    = document.getElementById('language');
const currencySelect    = document.getElementById('currency');
const lightBtn          = document.getElementById('lightBtn');
const darkBtn           = document.getElementById('darkBtn');
const mountainContainer = document.getElementById('mountainContainer');
const loadMoreBtn       = document.getElementById('loadMoreBtn');
const favoriteContainer = document.getElementById('favorite-container');

// 1) MENU TOGGLE
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () =>
    dropdownMenu.classList.toggle('menu-visible')
  );
  document.addEventListener('click', e => {
    if (
      !menuToggle.contains(e.target) &&
      !dropdownMenu.contains(e.target)
    ) dropdownMenu.classList.remove('menu-visible');
  });
}

// 2) LOGIN DROPDOWN
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () =>
    loginDropdown.style.display =
      loginDropdown.style.display === 'block' ? 'none' : 'block'
  );
  document.addEventListener('click', e => {
    if (
      !loginButton.contains(e.target) &&
      !loginDropdown.contains(e.target)
    ) loginDropdown.style.display = 'none';
  });
}

// 3) LANGUAGE & CURRENCY
languageSelect.value = localStorage.getItem('language') || 'en';
currencySelect.value = localStorage.getItem('currency') || 'usd';
languageSelect.addEventListener('change', () =>
  localStorage.setItem('language', languageSelect.value)
);
currencySelect.addEventListener('change', () =>
  localStorage.setItem('currency', currencySelect.value)
);

// 4) THEME
function setTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  lightBtn.classList.toggle('active', mode === 'light');
  darkBtn.classList.toggle('active', mode === 'dark');
}
lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));

// 5) TAB NAVIGATION
function openTab(event, tabName) {
  // hide all
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  // deactivate buttons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  // show the right pane
  const pane = document.getElementById(tabName);
  if (pane) pane.style.display = 'block';

  // highlight button
  let btn;
  if (event && event.currentTarget) {
    btn = event.currentTarget;
  } else {
    btn = Array.from(document.querySelectorAll('.tab'))
      .find(x => x.textContent.trim() === tabName);
  }
  if (btn) btn.classList.add('active');

  // special behaviors
  if (tabName === 'Favorite') renderFavorites();
  if (tabName === 'Maps') {
    setTimeout(() => {
      initMap();
      map && map.resize();
    }, 100);
  }
}

// on load
document.addEventListener('DOMContentLoaded', () => {
  // apply theme
  setTheme(localStorage.getItem('theme') || 'light');
  // init favorites + mountain
  initMountainRendering();
  // trigger default "Mountain" tab
  openTab(null, 'Mountain');
});

// =================================================================
// MOUNTAIN & FAVORITES SECTION
// =================================================================







// (A) Supabase Setup (gunakan UMD build yang sudah dipanggil di <head>)
const supabaseUrl = 'https://bntqvdqkaikkhlmfxovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHF2ZHFrYWlra2hsbWZ4b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjU1NTIsImV4cCI6MjA2NDIwMTU1Mn0.jG_Mt1-3861ItE2WzpYKKg7So_WKI506c8F9RTPIl44';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);



  const filters = getCurrentFilters();
  let query = supabase.from('mountains').select('*').eq('is_active', true);

  if (filters.type && filters.type !== 'type') query = query.eq('type', filters.type);
  if (filters.country && filters.country !== 'global') query = query.eq('country', filters.country);
  if (filters.destination && filters.destination !== 'trending') query = query.eq('destination', filters.destination);
  if (filters.difficulty && filters.difficulty !== 'level') query = query.eq('difficulty', filters.difficulty);
  if (filters.season && filters.season !== 'any') query = query.contains('season', [filters.season]);

  // Panggil Supabase dengan range untuk pagination
  const { data, error } = await query.range(loaded, loaded + batch - 1);

  if (error) {
    console.error("Supabase error:", error.message);
    mountainContainer.innerHTML = "<p>Error loading data.</p>";
    return;
  }

  // Render tiap gunung
  for (const m of data) {
    const w = await fetchWeather(m.lat, m.lon);
    mountainContainer.appendChild(createMountainCard(m, w));
  }

  loaded += data.length;
  if (data.length < batch) {
    // Kalau data hasil < batch, sembunyikan tombol Load More
    loadMoreBtn.style.display = 'none';
  }
}

// (11) Init Mountain & Filter Event
function initMountainRendering() {
  // Panggil pertama kali
  renderMountains();

  // Pagination: tombol Load More
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', renderMountains);
  }

  // Event change untuk dropdown filter
  document.querySelectorAll(".sort-options-container select").forEach(select => {
    select.addEventListener("change", () => {
      loaded = 0;
      renderMountains();
    });
  });
}













let loaded = 0;
const batch = 6;
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

// render mountain list
async function renderMountains() {
  const slice = mountainData.slice(loaded, loaded + batch);
  for (const m of slice) {
    const w = await fetchWeather(m.lat, m.lon);
    mountainContainer.appendChild(createMountainCard(m, w));
  }
  loaded += batch;
  if (loaded >= mountainData.length) loadMoreBtn.style.display = 'none';
}

// initial mountain
function initMountainRendering() {
  renderMountains();
  loadMoreBtn.addEventListener('click', renderMountains);
}

// weather fetcher
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` +
      `&appid=${apiKey}&units=metric`
    );
    const d = await res.json();
    if (d.main) {
      return {
        temperature: `${Math.round(d.main.temp)}°C`,
        weather:     d.weather[0].main,
        icon:        d.weather[0].icon
      };
    }
    return { temperature: 'N/A', weather: 'N/A', icon: '' };
  } catch {
    return { temperature: 'N/A', weather: 'N/A', icon: '' };
  }
}

// favorites storage
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}
function saveFavorites(f) {
  localStorage.setItem('favorites', JSON.stringify(f));
}
function isFavorite(id) {
  return getFavorites().includes(id);
}

// toggle & render favorites
async function renderFavorites() {
  favoriteContainer.innerHTML = '';       // clear old
  const favs = getFavorites();
  if (!favs.length) {
    favoriteContainer.textContent = 'No favorites yet.';
    return;
  }
  for (const id of favs) {
    const m = mountainData.find(x => x.id === id);
    if (!m) continue;
    const w = await fetchWeather(m.lat, m.lon);
    const card = createMountainCard(m, w);
    favoriteContainer.appendChild(card);
  }
}

// create mountain card
function createMountainCard(m, w) {
  const card = document.createElement('div');
  card.className = 'mountain-card';
  card.addEventListener('click', () => {
    window.location.href = `https://montamap.com/${m.link}`;
  });
  card.innerHTML = `
    <img src="${m.image}" alt="${m.name}" class="mountain-image"/>
    <div class="favorite-icon" title="${isFavorite(m.id)?'Unfavorite':'Favorite'}">
      ${isFavorite(m.id)?'★':'☆'}
    </div>
    <div class="gradient-overlay"></div>
    <div class="mountain-info">
      <div class="mountain-name">${m.name}</div>
      <div class="mountain-details">
        ${m.city}<br/>
        <span class="${m.status==='Open'?'status-open':'status-closed'}">
          Status: ${m.status}
        </span><br/>
        Elevation: ${m.elevation}<br/>
        <img src="https://openweathermap.org/img/wn/${w.icon}.png"
          alt="${w.weather}" class="weather-icon"/> ${w.temperature} | ${w.weather}
      </div>
    </div>
  `;
  
  // favorite click
  const favEl = card.querySelector('.favorite-icon');
  favEl.addEventListener('click', e => {
    e.stopPropagation();
    let favs = getFavorites();
    if (favs.includes(m.id)) favs = favs.filter(x=>x!==m.id);
    else favs.push(m.id);
    saveFavorites(favs);
    // update icon
    favEl.textContent = isFavorite(m.id)?'★':'☆';
    favEl.title       = isFavorite(m.id)?'Unfavorite':'Favorite';
  });

  return card;
}







// Auto-init map if all scripts loaded
window.addEventListener('load', () => {
  if (typeof MapboxStyleSwitcherControl === 'undefined' && window.mapboxglStyleSwitcher) {
    window.MapboxStyleSwitcherControl = window.mapboxglStyleSwitcher.MapboxStyleSwitcherControl;
    console.log('Style Switcher loaded globally');
  }
  initMap();
});






