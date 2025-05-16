const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Reset all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Activate selected
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});



<!-- =================== JavaScript: overview.js =================== -->

// Photo slider for Overview
const slides = document.querySelector('.slides');
const images = document.querySelectorAll('.slides img');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;
const totalSlides = images.length;

function showSlide(index) {
  if (index < 0) {
    currentIndex = totalSlides - 1;
  } else if (index >= totalSlides) {
    currentIndex = 0;
  } else {
    currentIndex = index;
  }
  const slideWidth = images[0].clientWidth;
  slides.style.transform = `translateX(${-slideWidth * currentIndex}px)`;
}

prevBtn.addEventListener('click', () => {
  showSlide(currentIndex - 1);
});

nextBtn.addEventListener('click', () => {
  showSlide(currentIndex + 1);
});

// Optional: swipe support for mobile
let startX = 0;
let isDragging = false;

slides.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

slides.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const currentX = e.touches[0].clientX;
  const diffX = currentX - startX;
  // Could add feedback animation here
});

slides.addEventListener('touchend', e => {
  isDragging = false;
  const endX = e.changedTouches[0].clientX;
  const diffX = endX - startX;
  if (diffX > 50) {
    // Swipe right - prev slide
    showSlide(currentIndex - 1);
  } else if (diffX < -50) {
    // Swipe left - next slide
    showSlide(currentIndex + 1);
  }
});

// Fetch OpenWeather API data for Mount Rinjani by coordinates
const apiKey = '3187c49861f858e524980ea8dd0d43c6';
const lat = -8.41;
const lon = 116.46;

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







mapboxgl.accessToken = 'sk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF3bHZxbjA0bzcybHNlamRsOXJzMXgifQ.iwdYXuYOQs7gNxnLE3pu0w';

const map = new mapboxgl.Map({
  container: 'rinjani-map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [116.47, -8.41],
  zoom: 10
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
  // Sumber data jalur
  map.addSource('rinjani-routes', {
    type: 'geojson',
    data: '/data/rinjani_routes.geojson'
  });
  map.addLayer({
    id: 'routes-layer',
    type: 'line',
    source: 'rinjani-routes',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      // warna jalur sesuai nama route
      'line-color': [
        'match',
        ['get', 'route_name'],
        'Sembalun', '#ff0000',
        'Senaru', '#0000ff',
        'Torean', '#00ff00',
        '#888'
      ],
      'line-width': 4
    }
  });

  // Sumber data titik penting
  map.addSource('important-points', {
    type: 'geojson',
    data: '/data/rinjani_points.geojson'
  });
  map.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'important-points',
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

  // Popup info titik penting saat hover
  map.on('mouseenter', 'points-layer', (e) => {
    map.getCanvas().style.cursor = 'pointer';

    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name, elevation, temperature, note } = e.features[0].properties;

    let description = `<strong>${name}</strong><br>Elevation: ${elevation}<br>Temperature: ${temperature}`;
    if(note) description += `<br>Note: ${note}`;

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });

  map.on('mouseleave', 'points-layer', () => {
    map.getCanvas().style.cursor = '';
  });
});

// Toggle layer visibility
const routeCheckbox = document.getElementById('toggle-routes');
const pointCheckbox = document.getElementById('toggle-points');

routeCheckbox.addEventListener('change', () => {
  map.setLayoutProperty('routes-layer', 'visibility', routeCheckbox.checked ? 'visible' : 'none');
});

pointCheckbox.addEventListener('change', () => {
  map.setLayoutProperty('points-layer', 'visibility', pointCheckbox.checked ? 'visible' : 'none');
});

// Tombol route selector
const buttons = document.querySelectorAll('.route-selector button');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.route === 'sembalun') map.flyTo({ center: [116.55, -8.41], zoom: 12 });
    if (btn.dataset.route === 'senaru') map.flyTo({ center: [116.45, -8.30], zoom: 12 });
    if (btn.dataset.route === 'torean') map.flyTo({ center: [116.43, -8.38], zoom: 12 });
  });
});