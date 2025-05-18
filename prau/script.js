mapboxgl.accessToken = 'pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg';

const map = new mapboxgl.Map({
  container: 'prau-map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [109.92, -7.21], // Koordinat pusat Gunung Prau
  zoom: 12,
  pitch: 55,
  bearing: -10,
  antialias: true
});

map.addControl(new mapboxgl.NavigationControl());

function addMapLayers() {
  // Jalur pendakian Gunung Prau
  map.addSource('prau-routes', {
    type: 'geojson',
    data: '/data/prau_routes.geojson'
  });

  map.addLayer({
    id: 'prau-routes-layer',
    type: 'line',
    source: 'prau-routes',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
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

  // Titik-titik penting Gunung Prau
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

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
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