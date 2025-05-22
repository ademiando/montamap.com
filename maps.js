mapboxgl.accessToken = 'pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg';

let map;
let mapInitialized = false;

function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  const styles = {
    outdoors: 'mapbox://styles/mapbox/outdoors-v11',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    outdoors3d: 'mapbox://styles/mapbox/outdoors-v11',
    satellite3d: 'mapbox://styles/mapbox/satellite-v9',
    dark: 'mapbox://styles/mapbox/dark-v10'
  };

  map = new mapboxgl.Map({
    container: 'map',
    style: styles.outdoors,
    center: [116.2420, -8.3405],
    zoom: 5,
    pitch: 0
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
  map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }), 'bottom-right');

  map.on('load', () => {
    addMountainData();

    const add3DBuildings = () => {
      const layers = map.getStyle().layers;
      const labelLayer = layers.find(l => l.type === 'symbol' && l.layout?.['text-field']);
      if (!labelLayer) return;

      if (!map.getLayer('3d-buildings')) {
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
    };

    // Style switcher
    const styleSelector = document.getElementById('styleSelector');
    if (styleSelector) {
      styleSelector.addEventListener('change', (e) => {
        const choice = e.target.value;
        map.setStyle(styles[choice]);

        map.once('styledata', () => {
          if (choice.includes('3d')) {
            map.setPitch(60);
            add3DBuildings();
          } else {
            map.setPitch(0);
          }
          addMountainData();
        });
      });
    }
  });
}

function addMountainData() {
  // Load custom marker icon jika belum ada
  if (!map.hasImage('custom-marker')) {
    map.loadImage('https://montamap.com/assets/icon.png', (err, img) => {
      if (err) throw err;
      if (!map.hasImage('custom-marker')) {
        map.addImage('custom-marker', img);
        addPointLayer(); // Panggil saat image sudah siap
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

// Inisialisasi saat tab Maps ditampilkan
document.addEventListener('DOMContentLoaded', () => {
  const mapsTab = document.getElementById('Maps');
  const observer = new MutationObserver(() => {
    if (mapsTab.style.display !== 'none') {
      initMap();
      setTimeout(() => map.resize(), 200);
    }
  });
  observer.observe(mapsTab, { attributes: true, attributeFilter: ['style'] });
});