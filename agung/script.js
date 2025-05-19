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
slides.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});
slides.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  const diffX = endX - startX;
  if (diffX > 50) showSlide(currentIndex - 1);
  else if (diffX < -50) showSlide(currentIndex + 1);
});

// Cuaca Gunung Agung
const apiKey = '3187c49861f858e524980ea8dd0d43c6';
const lat = -8.342;
const lon = 115.508;

async function fetchWeather() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const data = await res.json();
    document.getElementById('temp').textContent = `${data.main.temp.toFixed(1)} °C`;
    document.getElementById('weather').textContent = data.weather[0].main;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  } catch (err) {
    document.getElementById('weather').textContent = 'Unavailable';
  }
}

fetchWeather();
showSlide(currentIndex);








// MAPBOX
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

map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserHeading: true
}), 'bottom-right');

function addMapLayers() {
  if (!map.getSource('agung-routes')) {
    map.addSource('agung-routes', {
      type: 'geojson',
      data: '/data/agung_routes.geojson'
    });
  }

  if (!map.getLayer('routes-layer')) {
    map.addLayer({
      id: 'routes-layer',
      type: 'line',
      source: 'agung-routes',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#ff4500',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 2,
          14, 4,
          16, 6
        ],
        'line-opacity': 0.9
      }
    });
  }

  if (!map.getSource('agung-points')) {
    map.addSource('agung-points', {
      type: 'geojson',
      data: '/data/agung_points.geojson'
    });
  }

  map.loadImage('https://montamap.com/assets/logo.png', (err, img) => {
    if (err) throw err;
    if (!map.hasImage('basecamp-icon')) map.addImage('basecamp-icon', img);

    if (!map.getLayer('basecamp-layer')) {
      map.addLayer({
        id: 'basecamp-layer',
        type: 'symbol',
        source: 'agung-points',
        filter: ['==', 'type', 'basecamp'],
        layout: {
          'icon-image': 'basecamp-icon',
          'icon-size': 0.02,
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-offset': [0, 0.4],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': 'none;',
          'text-halo-color': '#fff',
          'text-halo-width': 1
        }
      });

      map.on('click', 'basecamp-layer', (e) => {
        const { name, elevation, temperature, note } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        let html = `<strong>${name}</strong>`;
        if (elevation) html += `<br>Elevation: ${elevation}`;
        if (temperature) html += `<br>Temperature: ${temperature}`;
        if (note) html += `<br>${note}`;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map);
      });

      map.on('mouseenter', 'basecamp-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'basecamp-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    }
  });
}

function bindRouteButtons() {
  const coords = {
    besakih: [115.465, -8.374],
    pasar_agung: [115.542, -8.390]
  };

  const buttons = document.querySelectorAll('.route-selector button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const target = coords[button.dataset.route];
      if (target) {
        map.flyTo({
          center: target,
          zoom: 15.5,
          pitch: 65,
          bearing: -20,
          speed: 1.2,
          curve: 1.42
        });
      }
    });
  });
}

map.on('load', () => {
  addMapLayers();
  bindRouteButtons();
});

const styleSelector = document.getElementById('mapStyle');
if (styleSelector) {
  styleSelector.addEventListener('change', (e) => {
    const selected = e.target.value;
    let styleURL = 'mapbox://styles/mapbox/outdoors-v12';
    let useTerrain = false;

    if (selected === 'satellite') {
      styleURL = 'mapbox://styles/mapbox/satellite-streets-v12';
    } else if (selected === 'outdoors-3d') {
      styleURL = 'mapbox://styles/mapbox/outdoors-v12';
      useTerrain = true;
    } else if (selected === 'satellite-3d') {
      styleURL = 'mapbox://styles/mapbox/satellite-streets-v12';
      useTerrain = true;
    } else if (selected === 'dark') {
      styleURL = 'mapbox://styles/mapbox/dark-v11';
    }

    map.setStyle(styleURL);
    map.once('style.load', () => {
      addMapLayers();
      bindRouteButtons();

      if (useTerrain) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb',
          tileSize: 512,
          maxzoom: 14
        });

        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
        map.setFog({
          color: 'rgba(255,255,255,0.5)',
          'horizon-blend': 0.3
        });
      }
    });
  });
}










// Layer visibility toggle
const routeToggle = document.getElementById('toggle-routes');
const pointToggle = document.getElementById('toggle-points');

if (routeToggle) {
  routeToggle.addEventListener('change', () => {
    map.setLayoutProperty('routes-layer', 'visibility', routeToggle.checked ? 'visible' : 'none');
  });
}

if (pointToggle) {
  pointToggle.addEventListener('change', () => {
    map.setLayoutProperty('points-layer', 'visibility', pointToggle.checked ? 'visible' : 'none');
  });
}