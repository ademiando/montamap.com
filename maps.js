mapboxgl.accessToken = 'pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg';

const styles = {
  outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  outdoors3d: 'mapbox://styles/mapbox/outdoors-v11',
  satellite3d: 'mapbox://styles/mapbox/satellite-v9',
  dark: 'mapbox://styles/mapbox/dark-v10'
};

let map;

function initMap(style = 'outdoors') {
  if (map) return;

  map = new mapboxgl.Map({
    container: 'map',
    style: styles[style],
    center: [116.2420, -8.3405],
    zoom: 5,
    pitch: style.includes('3d') ? 60 : 0
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
  map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }), 'bottom-right');

  map.on('load', () => {
    if (style.includes('3d')) add3DBuildings();
    addMountainData();
  });
}

function add3DBuildings() {
  const layers = map.getStyle().layers;
  const labelLayer = layers.find(l => l.type === 'symbol' && l.layout?.['text-field']);
  if (!labelLayer || map.getLayer('3d-buildings')) return;

  map.addLayer({
    id: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    filter: ['==', 'extrude', 'true'],
    type: 'fill-extrusion',
    minzoom: 15,
    paint: {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'min_height'],
      'fill-extrusion-opacity': 0.6
    }
  }, labelLayer.id);
}

function addMountainData() {
  if (!map.hasImage('custom-marker')) {
    map.loadImage('https://montamap.com/assets/icon.png', (err, img) => {
      if (err) return console.error(err);
      if (!map.hasImage('custom-marker')) {
        map.addImage('custom-marker', img);
        addPointLayer();
      }
    });
  } else {
    addPointLayer();
  }
}

function addPointLayer() {
  if (!map.getSource('mountains')) {
    map.addSource('mountains', {
      type: 'geojson',
      data: 'https://montamap.com/data/mountains_indonesia.geojson'
    });
  }

  if (!map.getLayer('mountain-points')) {
    map.addLayer({
      id: 'mountain-points',
      type: 'symbol',
      source: 'mountains',
      layout: {
        'icon-image': 'custom-marker',
        'icon-size': 0.5,
        'icon-allow-overlap': true,
        'text-field': ['get', 'name'],
        'text-offset': [0, 0.6],
        'text-anchor': 'top'
      },
      paint: {
        'text-halo-color': '#fff',
        'text-halo-width': 1.5
      }
    });

    map.on('click', 'mountain-points', (e) => {
      const props = e.features[0].properties;
      const coords = e.features[0].geometry.coordinates.slice();
      let html = `<strong>${props.name}</strong>`;
      if (props.elevation) html += `<br>Elevation: ${props.elevation}`;
      if (props.note) html += `<br>${props.note}`;
      new mapboxgl.Popup().setLngLat(coords).setHTML(html).addTo(map);
    });

    map.on('mouseenter', 'mountain-points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'mountain-points', () => {
      map.getCanvas().style.cursor = '';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();

  // Ganti style dari dropdown
  const styleSelector = document.getElementById('styleSelector');
  if (styleSelector) {
    styleSelector.addEventListener('change', (e) => {
      const selected = e.target.value;
      map.setStyle(styles[selected]);

      map.once('styledata', () => {
        map.setPitch(selected.includes('3d') ? 60 : 0);
        if (selected.includes('3d')) add3DBuildings();
        addMountainData();
      });
    });
  }

  // Pastikan map resize saat tab dibuka
  const mapsTab = document.getElementById('Maps');
  const observer = new MutationObserver(() => {
    if (mapsTab.style.display !== 'none') {
      map.resize();
    }
  });
  observer.observe(mapsTab, { attributes: true, attributeFilter: ['style'] });
});