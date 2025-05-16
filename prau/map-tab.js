mapboxgl.accessToken = 'sk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF3bHZxbjA0bzcybHNlamRsOXJzMXgifQ.iwdYXuYOQs7gNxnLE3pu0w';



const map = new mapboxgl.Map({ container: 'prau-map', style: 'mapbox://styles/mapbox/outdoors-v12', center: [109.9195, -7.2032], // Koordinat Gunung Prau zoom: 12 });

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => { // Tambahkan layer jalur pendakian map.addSource('prau-routes', { type: 'geojson', data: '/data/prau_routes.geojson' });

map.addLayer({ id: 'routes-layer', type: 'line', source: 'prau-routes', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#ff7e5f', 'line-width': 4 } });

// Tambahkan layer titik penting map.addSource('prau-points', { type: 'geojson', data: '/data/prau_points.geojson' });

map.addLayer({ id: 'points-layer', type: 'symbol', source: 'prau-points', layout: { 'icon-image': 'mountain-15', 'icon-allow-overlap': true, 'text-field': ['get', 'name'], 'text-offset': [0, 1.5], 'text-anchor': 'top' }, paint: { 'text-color': '#000' } }); });

// Toggle checkbox untuk layer const routeToggle = document.getElementById('toggle-routes'); const pointToggle = document.getElementById('toggle-points');

routeToggle.addEventListener('change', () => { map.setLayoutProperty('routes-layer', 'visibility', routeToggle.checked ? 'visible' : 'none'); });

pointToggle.addEventListener('change', () => { map.setLayoutProperty('points-layer', 'visibility', pointToggle.checked ? 'visible' : 'none'); });

// Route selector: fokus ke jalur tertentu const buttons = document.querySelectorAll('.route-selector button'); buttons.forEach(button => { button.addEventListener('click', () => { const route = button.dataset.route; const focus = { patak: [109.9208, -7.202], dwarawati: [109.915, -7.197], kalilembu: [109.913, -7.209] }; if (focus[route]) map.flyTo({ center: focus[route], zoom: 14 }); }); });

