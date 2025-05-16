// Aktifkan tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Image slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slides img');
const totalSlides = slides.length;

document.querySelector('.next').addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlider();
});
document.querySelector('.prev').addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSlider();
});
function updateSlider() {
  const offset = -currentSlide * 100;
  document.querySelector('.slides').style.transform = `translateX(${offset}%)`;
}

// Weather fetch
fetch(`https://api.openweathermap.org/data/2.5/weather?lat=-7.233&lon=109.93&appid=55076f8b9d7f790a4e7bc850384aef13&units=metric`)
  .then(res => res.json())
  .then(data => {
    document.getElementById('temp').textContent = `${data.main.temp} °C`;
    document.getElementById('weather').textContent = data.weather[0].description;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  })
  .catch(err => console.error('Weather fetch error:', err));

// MAPBOX
mapboxgl.accessToken = 'sk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF3bHZxbjA0bzcybHNlamRsOXJzMXgifQ.iwdYXuYOQs7gNxnLE3pu0w';

const map = new mapboxgl.Map({
  container: 'prau-map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [109.93, -7.233],
  zoom: 12
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
  // Tambahkan jalur pendakian
  map.addSource('routes', {
    type: 'geojson',
    data: '/data/prau_routes.geojson'
  });

  map.addLayer({
    id: 'routes-layer',
    type: 'line',
    source: 'routes',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#FF5733',
      'line-width': 4
    }
  });

  // Tambahkan titik penting
  map.addSource('points', {
    type: 'geojson',
    data: '/data/prau_points.geojson'
  });

  map.addLayer({
    id: 'points-layer',
    type: 'symbol',
    source: 'points',
    layout: {
      'icon-image': 'mountain-15',
      'icon-size': 1.5,
      'text-field': ['get', 'name'],
      'text-offset': [0, 1.2],
      'text-anchor': 'top'
    }
  });

  // Toggle layer
  document.getElementById('toggle-routes').addEventListener('change', (e) => {
    map.setLayoutProperty('routes-layer', 'visibility', e.target.checked ? 'visible' : 'none');
  });
  document.getElementById('toggle-points').addEventListener('change', (e) => {
    map.setLayoutProperty('points-layer', 'visibility', e.target.checked ? 'visible' : 'none');
  });

  // Highlight rute saat pilih
  document.querySelectorAll('.route-selector button').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.route;
      map.setFilter('routes-layer', ['==', ['get', 'name'], selected]);
    });
  });
});