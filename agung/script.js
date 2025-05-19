// Tabs
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

// Photo Slider
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
  isDragging = false;
  const endX = e.changedTouches[0].clientX;
  const diffX = endX - startX;
  if (diffX > 50) showSlide(currentIndex - 1);
  else if (diffX < -50) showSlide(currentIndex + 1);
});

// Cuaca Gunung Agung
const apiKey = '3187c49861f858e524980ea8dd0d43c6';
const lat = -8.342; // Gunung Agung
const lon = 115.508;

async function fetchWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    if (!response.ok) throw new Error('Weather data not available');
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
showSlide(currentIndex);

// MAPBOX - Gunung Agung
mapboxgl.accessToken = 'pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg';

const map = new mapboxgl.Map({
  container: 'agung-map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [115.508, -8.342],
  zoom: 11,
  pitch: 60,
  bearing: -20,
  antialias: true
});

map.addControl(new mapboxgl.NavigationControl());

function addMapLayers() {
  map.addSource('agung-routes', {
    type: 'geojson',
    data: '/data/agung_routes.geojson'
  });

  map.addLayer({
    id: 'routes-layer',
    type: 'line',
    source: 'agung-routes',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#ff4500',
      'line-width': 4
    }
  });

  map.addSource('agung-points', {
    type: 'geojson',
    data: '/data/agung_points.geojson'
  });

  map.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'agung-points',
    paint: {
      'circle-radius': 7,
      'circle-color': [
        'match',
        ['get', 'type'],
        'basecamp', '#1E90FF',
        'pos', '#32CD32',
        'plawangan', '#FFA500',
        'lake', '#00CED1',
        'summit', '#FF4500',
        'danger', '#FF0000',
        'water', '#1E90FF',
        '#ccc'
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });

  map.on('mouseenter', 'points-layer', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name, elevation, temperature, note } = e.features[0].properties;

    let description = `<strong>${name}</strong><br>Elevation: ${elevation}<br>Temperature: ${temperature}`;
    if (note) description += `<br>Note: ${note}`;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });

  map.on('mouseleave', 'points-layer', () => {
    map.getCanvas().style.cursor = '';
  });
}

function bindRouteButtons() {
  const routes = {
    besakih: [115.465, -8.374],
    pasar_agung: [115.542, -8.390]
  };

  const buttons = document.querySelectorAll('.route-selector button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const coords = routes[btn.dataset.route];
      if (coords) {
        map.flyTo({
          center: coords,
          zoom: 15.5,
          pitch: 65,
          bearing: -20
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
      id: 'basecamp-layer',
      type: 'symbol',
      source: 'agung-points',
      filter: ['==', 'type', 'trailhead'],
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

// Style toggle
const styleSelector = document.getElementById('mapStyle');
if (styleSelector) {
  styleSelector.addEventListener('change', (e) => {
    const newStyle = e.target.value;
    map.setStyle(newStyle);
    map.once('style.load', () => {
      addMapLayers();
      bindRouteButtons();
    });
  });
}

// Toggle visibility
const routeCheckbox = document.getElementById('toggle-routes');
const pointCheckbox = document.getElementById('toggle-points');

if (routeCheckbox) {
  routeCheckbox.addEventListener('change', () => {
    map.setLayoutProperty('routes-layer', 'visibility', routeCheckbox.checked ? 'visible' : 'none');
  });
}

if (pointCheckbox) {
  pointCheckbox.addEventListener('change', () => {
    map.setLayoutProperty('points-layer', 'visibility', pointCheckbox.checked ? 'visible' : 'none');
  });
}