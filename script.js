// =================================================================
// GLOBAL MAPBOX SETTINGS
// =================================================================


let map;
let mapInitialized = false;

function initMap() {
  if (mapInitialized) return;

  mapboxgl.accessToken = 'pk.eyJ1IjoibW9udGFtYXBwIiwiYSI6ImNsamM0aGNkZDAxM3Mza3FuZzhid2plcHAifQ.nZ_xTAcBW0sNHi0Utyh9Kg';

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [116.4575, -8.4111],
    zoom: 9,
    pitch: 45,
    bearing: -17.6,
    antialias: true
  });

  // Controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }), 'top-right');
  map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
  map.addControl(new MapboxStyleSwitcherControl({
    defaultStyle: 'Mapbox Outdoors',
    styles: [
      { title: 'Outdoors', uri: 'mapbox://styles/mapbox/outdoors-v12' },
      { title: 'Satellite', uri: 'mapbox://styles/mapbox/satellite-v9' },
      { title: 'Satellite 3D', uri: 'mapbox://styles/mapbox/satellite-streets-v12' },
      { title: 'Dark', uri: 'mapbox://styles/mapbox/dark-v11' },
      { title: 'Streets', uri: 'mapbox://styles/mapbox/streets-v12' },
      { title: 'Terrain 3D', uri: 'mapbox://styles/mapbox/outdoors-v12' }
    ]
  }), 'top-right');

  // Reset View button
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset View';
  Object.assign(resetBtn.style, {
    position: 'absolute', top: '10px', left: '10px', zIndex: 1,
    padding: '6px 12px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer'
  });
  resetBtn.onclick = () => {
    map.flyTo({ center: [116.4575, -8.4111], zoom: 9, pitch: 45, bearing: -17.6 });
  };
  document.getElementById('map').appendChild(resetBtn);

  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = 'Download Map';
  Object.assign(downloadBtn.style, {
    position: 'absolute', top: '50px', left: '10px', zIndex: 1,
    padding: '6px 12px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer'
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

  // Load terrain + data
  map.on('load', () => {
    // DEM Terrain
    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: 14
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    }

    // Mountain data
    if (!map.getSource('mountains')) {
      map.addSource('mountains', {
        type: 'geojson',
        data: 'data/mountains_indonesia.geojson'
      });
    }

    // Layer gunung
    if (!map.getLayer('mountain-points')) {
      map.addLayer({
        id: 'mountain-points',
        type: 'circle',
        source: 'mountains',
        paint: {
          'circle-radius': 6,
          'circle-color': '#e91e63'
        }
      });
    }

    // Fit bounds to all points
    fetch('data/mountains_indonesia.geojson')
      .then(res => res.json())
      .then(data => {
        const bounds = new mapboxgl.LngLatBounds();
        data.features.forEach(feature => {
          const coords = feature.geometry.coordinates;
          if (feature.geometry.type === 'Point') bounds.extend(coords);
        });
        map.fitBounds(bounds, { padding: 50, duration: 1000 });
      });

    // Interaktif
    map.on('click', 'mountain-points', e => {
      const props = e.features[0].properties;
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${props.name || 'Unknown'}</strong>`)
        .addTo(map);
    });

    map.on('mouseenter', 'mountain-points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'mountain-points', () => {
      map.getCanvas().style.cursor = '';
    });
  });

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




const mountainData = [
  { id:"everest",       name:"Everest",        city:"Namche Bazaar, Nepal",         lat:27.9881,  lon:86.9250,  status:"Open",   elevation:"8,848 m",  weather:"-35°C Windy",        icon:"01d", image:"mountain-image/everest.jpg",       link:"everest" },
  { id:"k2",            name:"K2",             city:"Skardu, Pakistan",             lat:35.8800,  lon:76.5151,  status:"Closed", elevation:"8,611 m",  weather:"-40°C Snow",         icon:"13d", image:"mountain-image/k2.jpg",            link:"k2" },
  { id:"kangchenjunga", name:"Kangchenjunga",  city:"Taplejung, Nepal",             lat:27.7000,  lon:88.2000,  status:"Open",   elevation:"8,586 m",  weather:"-30°C Cloudy",      icon:"04d", image:"mountain-image/kangchenjunga.jpg", link:"kangchenjunga" },
  { id:"lhotse",        name:"Lhotse",         city:"Namche Bazaar, Nepal",         lat:27.9617,  lon:86.9333,  status:"Open",   elevation:"8,516 m",  weather:"-28°C Sunny",       icon:"01d", image:"mountain-image/lhotse.jpg",        link:"lhotse" },
  { id:"rinjani",       name:"Rinjani",        city:"West Nusa Tenggara, Indonesia", lat:-8.4115, lon:116.4577, status:"Open",   elevation:"3,726 m",  weather:"-6°C Cloudy",       icon:"04d", image:"mountain-image/rinjani.jpg",       link:"rinjani" },
  { id:"cartenz",       name:"Cartenz Pyramid",city:"Papua, Indonesia",             lat:-4.0833,  lon:137.1833, status:"Open",   elevation:"4,884 m",  weather:"-10°C Snow",       icon:"13d", image:"mountain-image/cartenz.jpg",       link:"cartenz" },
  { id:"semeru",        name:"Semeru",         city:"East Java, Indonesia",         lat:-8.1080,  lon:112.9220, status:"Open",   elevation:"3,676 m",  weather:"-4°C Smoke",        icon:"50d", image:"mountain-image/semeru.jpg",        link:"semeru" },
  { id:"bromo",         name:"Bromo",          city:"East Java, Indonesia",         lat:-7.9425,  lon:112.9530, status:"Open",   elevation:"2,329 m",  weather:"2°C Clear",        icon:"01d", image:"mountain-image/bromo.jpg",         link:"bromo" },
  { id:"agung",         name:"Agung",          city:"Bali, Indonesia",               lat:-8.3421, lon:115.5085, status:"Open",   elevation:"3,031 m",  weather:"3°C Partly Cloudy",icon:"03d", image:"mountain-image/agung.jpg",         link:"agung" },
  { id:"batur",         name:"Batur",          city:"Bali, Indonesia",               lat:-8.2395, lon:115.3761, status:"Open",   elevation:"1,717 m",  weather:"7°C Cloudy",       icon:"04d", image:"mountain-image/batur.jpg",         link:"batur" },
  { id:"prau",          name:"Prau",           city:"Central Java, Indonesia",      lat:-7.2079, lon:109.9181, status:"Open",   elevation:"2,590 m",  weather:"1°C Fog",          icon:"50d", image:"mountain-image/prau.jpg",          link:"prau" },
  { id:"raung",         name:"Raung",          city:"East Java, Indonesia",         lat:-8.1255, lon:114.0428, status:"Open",   elevation:"3,344 m",  weather:"-2°C Cloudy",      icon:"04d", image:"mountain-image/raung.jpg",         link:"raung" },
  { id:"sindoro",       name:"Sindoro",        city:"Central Java, Indonesia",      lat:-7.3006, lon:110.0571, status:"Open",   elevation:"3,150 m",  weather:"-1°C Clear",       icon:"01d", image:"mountain-image/sindoro.jpg",       link:"sindoro" },
  { id:"sumbing",       name:"Sumbing",        city:"Central Java, Indonesia",      lat:-7.3844, lon:110.0722, status:"Open",   elevation:"3,371 m",  weather:"-1°C Partly Cloudy",icon:"03d", image:"mountain-image/sumbing.jpg",       link:"sumbing" },
  { id:"merapi",        name:"Merapi",         city:"Yogyakarta, Indonesia",        lat:-7.5407, lon:110.4462, status:"Closed", elevation:"2,930 m",  weather:"0°C Smoke",        icon:"50d", image:"mountain-image/merapi.jpg",        link:"merapi" }
];







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