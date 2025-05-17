// === script.js untuk halaman Gunung Prau ===

// TAB SWITCHING const tabs = document.querySelectorAll('.tab'); const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => { tab.addEventListener('click', () => { tabs.forEach(t => t.classList.remove('active')); contents.forEach(c => c.classList.remove('active')); tab.classList.add('active'); document.getElementById(tab.dataset.tab).classList.add('active'); }); });

// IMAGE SLIDER let slideIndex = 0; const slides = document.querySelectorAll('.slides img'); const prevBtn = document.querySelector('.prev'); const nextBtn = document.querySelector('.next');

function showSlide(index) { slides.forEach((slide, i) => { slide.style.display = i === index ? 'block' : 'none'; }); }

function nextSlide() { slideIndex = (slideIndex + 1) % slides.length; showSlide(slideIndex); }

function prevSlideFunc() { slideIndex = (slideIndex - 1 + slides.length) % slides.length; showSlide(slideIndex); }

nextBtn.addEventListener('click', nextSlide); prevBtn.addEventListener('click', prevSlideFunc); showSlide(slideIndex);

// WEATHER DATA fetch('https://api.openweathermap.org/data/2.5/weather?lat=-7.219&lon=109.92&units=metric&appid=5dd9d69a94c7cf13cf1ffbfa960f93f5') .then(response => response.json()) .then(data => { document.getElementById('temp').textContent = ${data.main.temp} °C; document.getElementById('weather').textContent = data.weather[0].main; document.getElementById('wind').textContent = ${data.wind.speed} m/s; document.getElementById('humidity').textContent = ${data.main.humidity}%; }) .catch(error => console.error('Weather fetch error:', error));

// MAPBOX mapboxgl.accessToken = 'sk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF3bHZxbjA0bzcybHNlamRsOXJzMXgifQ.iwdYXuYOQs7gNxnLE3pu0w'; const map = new mapboxgl.Map({ container: 'prau-map', style: 'mapbox://styles/mapbox/outdoors-v12', center: [109.92, -7.219], zoom: 12 });

// LOAD GEOJSON ROUTES fetch('/data/prau_routes.geojson') .then(res => res.json()) .then(data => { map.addSource('routes', { type: 'geojson', data: data }); map.addLayer({ id: 'routes-line', type: 'line', source: 'routes', paint: { 'line-color': '#f97316', 'line-width': 3 } }); });

// LOAD GEOJSON POINTS fetch('/data/prau_points.geojson') .then(res => res.json()) .then(data => { map.addSource('points', { type: 'geojson', data: data }); map.addLayer({ id: 'points-layer', type: 'symbol', source: 'points', layout: { 'icon-image': 'marker-15', 'icon-size': 1.5, 'text-field': ['get', 'name'], 'text-offset': [0, 1.5], 'text-anchor': 'top' } }); });

