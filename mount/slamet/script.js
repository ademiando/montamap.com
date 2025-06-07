// script.js for Mount Slamet

// Import API keys & config from montamapConfig (defined in config.js) // montamapConfig: { MAPBOX_TOKEN, OPENWEATHER_KEY, SUPABASE_URL, SUPABASE_KEY, MAP_STYLE }

// Tab Navigation const tabs = document.querySelectorAll('.tab'); const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => { tab.addEventListener('click', () => { tabs.forEach(t => t.classList.remove('active')); contents.forEach(c => c.classList.remove('active')); tab.classList.add('active'); document.getElementById(tab.dataset.tab).classList.add('active'); }); });

// Fetch OpenWeather API data for Mount Slamet const { OPENWEATHER_KEY, MAPBOX_TOKEN, MAP_STYLE } = montamapConfig; const lat = -7.246; const lon = 109.2093; async function fetchWeather() { try { const response = await fetch( https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_KEY} ); if (!response.ok) throw new Error('Weather data not available'); const data = await response.json();

document.getElementById('temp').textContent = `${data.main.temp.toFixed(1)} °C`;
document.getElementById('weather').textContent = data.weather[0].main;
document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
document.getElementById('humidity').textContent = `${data.main.humidity}%`;

} catch (error) { console.error(error); document.getElementById('weather').textContent = 'Unavailable'; } } fetchWeather();

// Initialize Mapbox for Mount Slamet Overview mapboxgl.accessToken = MAPBOX_TOKEN; const map = new mapboxgl.Map({ container: 'slamet-overview-map', style: MAP_STYLE || 'mapbox://styles/mapbox/outdoors-v12', center: [lon, lat], zoom: 11, pitch: 60, bearing: -20, antialias: true }); map.addControl(new mapboxgl.NavigationControl());

function setupTerrainAndSky() { map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.terrain-rgb', tileSize: 512, maxzoom: 14 }); map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.8 }); map.setFog({ color: 'rgb(186, 210, 235)', 'high-color': 'rgb(36, 92, 223)', 'horizon-blend': 0.5, 'space-color': 'rgb(11, 11, 25)', 'star-intensity': 0.15 }); map.addLayer({ id: 'sky', type: 'sky', paint: { 'sky-type': 'atmosphere', 'sky-atmosphere-sun': [0.0, 90.0], 'sky-atmosphere-sun-intensity': 10 } }); } map.on('load', () => { setupTerrainAndSky(); // Additional layers (routes, points) can be added here if GeoJSON data is available });

