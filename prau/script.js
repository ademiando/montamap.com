// === Mapbox & Weather Initialization ===
mapboxgl.accessToken = 'sk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF3bHZxbjA0bzcybHNlamRsOXJzMXgifQ.iwdYXuYOQs7gNxnLE3pu0w';

const map = new mapboxgl.Map({
  container: 'prau-map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [109.9462, -7.2314], // Gunung Prau coordinates
  zoom: 12
});

map.addControl(new mapboxgl.NavigationControl());

// === Weather Fetch ===
fetch('https://api.openweathermap.org/data/2.5/weather?lat=-7.2314&lon=109.9462&appid=7f9b5c7c931c56a99f2aab91c7715653&units=metric')
  .then(res => res.json())
  .then(data => {
    document.getElementById('temp').textContent = `${data.main.temp}°C`;
    document.getElementById('weather').textContent = data.weather[0].main;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  });

// === Load GeoJSON for Routes & Points ===
map.on('load', () => {
  // Jalur pendakian
  map.addSource('prau-routes', {
    type: 'geojson',
    data: '/data/prau_routes.geojson'
  });

  map.addLayer({
    id: 'prau-routes-line',
    type: 'line',
    source: 'prau-routes',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#FF5733',
      'line-width': 3
    }
  });

  // Titik penting
  fetch('/data/prau_points.geojson')
    .then(res => res.json())
    .then(data => {
      map.addSource('prau-points', {
        type: 'geojson',
        data: data
      });

      map.addLayer({
        id: 'prau-points-layer',
        type: 'symbol',
        source: 'prau-points',
        layout: {
          'icon-image': 'marker-15',
          'icon-size': 1.2,
          'icon-allow-overlap': true
        }
      });
    });
});

// === Tab Navigation (Overview, Map, etc.) ===
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});