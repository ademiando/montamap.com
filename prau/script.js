// ========== Tabs ==========
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ========== Slider ==========
const slides = document.querySelector('.slides');
const images = document.querySelectorAll('.slides img');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;
const totalSlides = images.length;

function showSlide(index) {
  if (index < 0) currentIndex = totalSlides - 1;
  else if (index >= totalSlides) currentIndex = 0;
  else currentIndex = index;

  const slideWidth = images[0].clientWidth;
  slides.style.transform = `translateX(${-slideWidth * currentIndex}px)`;
}

prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

let startX = 0;
let isDragging = false;

slides.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isDragging = true;
});
slides.addEventListener('touchend', e => {
  if (!isDragging) return;
  const endX = e.changedTouches[0].clientX;
  const diffX = endX - startX;
  if (diffX > 50) showSlide(currentIndex - 1);
  else if (diffX < -50) showSlide(currentIndex + 1);
  isDragging = false;
});

showSlide(currentIndex);

// ========== Cuaca ==========
const apiKey = '3187c49861f858e524980ea8dd0d43c6';
const lat = -7.21;
const lon = 109.92;

async function fetchWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();

    document.getElementById('temp').textContent = `${data.main.temp.toFixed(1)} °C`;
    document.getElementById('weather').textContent = data.weather[0].main;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  } catch (error) {
    console.error(error);
    document.getElementById('weather').textContent = 'Unavailable';
  }
}
fetchWeather();

// ========== MAPBOX PRAU ==========
mapboxgl.accessToken = 'pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg';

const map = new mapboxgl.Map({
  container: 'prau-map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [109.92, -7.21],
  zoom: 12,
  pitch: 55,
  bearing: -10,
  antialias: true,
  attributionControl: false
});

map.addControl(new mapboxgl.NavigationControl());

function addMapLayers() {
  map.addSource('prau-routes', {
    type: 'geojson',
    data: '/data/prau_routes.geojson'
  });

  map.addLayer({
    id: 'prau-routes-layer',
    type: 'line',
    source: 'prau-routes',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': [
        'match',
        ['get', 'route_name'],
        'Patak Banteng', '#e63946',
        'Dieng', '#2a9d8f',
        'Kalilembu', '#f4a261',
        '#888'
      ],
      'line-width': 4
    }
  });

  map.addSource('prau-points', {
    type: 'geojson',
    data: '/data/prau_points.geojson'
  });

  map.addLayer({
    id: 'prau-points-layer',
    type: 'circle',
    source: 'prau-points',
    paint: {
      'circle-radius': 7,
      'circle-color': [
        'match',
        ['get', 'type'],
        'basecamp', '#1E90FF',
        'pos', '#32CD32',
        'summit', '#FF4500',
        'viewpoint', '#FFD700',
        'camp', '#8A2BE2',
        '#ccc'
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });

  map.on('mouseenter', 'prau-points-layer', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name, elevation, note } = e.features[0].properties;

    let description = `<strong>${name}</strong>`;
    if (elevation) description += `<br>Elevation: ${elevation}`;
    if (note) description += `<br>Note: ${note}`;

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on('mouseleave', 'prau-points-layer', () => {
    map.getCanvas().style.cursor = '';
  });
}

function bindRouteButtons() {
  const routes = {
    patak: [109.919, -7.217],
    dieng: [109.915, -7.225],
    kalilembu: [109.911, -7.221]
  };

  const buttons = document.querySelectorAll('.route-selector button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const coords = routes[btn.dataset.route];
      if (coords) {
        map.flyTo({
          center: coords,
          zoom: 15,
          pitch: 60,
          bearing: -10
        });
      }
    });
  });
}

map.on('load', () => {
  addMapLayers();
  bindRouteButtons();

  map.loadImage('https://montamap.com/assets/logo.png', (error, icon) => {
    if (error) throw error;
    map.addImage('basecamp-icon', icon);

    map.addLayer({
      id: 'prau-basecamp-layer',
      type: 'symbol',
      source: 'prau-points',
      filter: ['==', 'type', 'basecamp'],
      layout: {
        'icon-image': 'basecamp-icon',
        'icon-size': 0.015,
        'icon-allow-overlap': true,
        'text-field': ['get', 'name'],
        'text-offset': [0, 0.6],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#333',
        'text-halo-color': '#fff',
        'text-halo-width': 1
      }
    });
  });
});