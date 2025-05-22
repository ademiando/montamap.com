// maps.js
mapboxgl.accessToken = 'pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg';

const styles = {
  outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  outdoors3d: 'mapbox://styles/mapbox/outdoors-v11',
  satellite3d: 'mapbox://styles/mapbox/satellite-v9',
  dark: 'mapbox://styles/mapbox/dark-v10'
};

const map = new mapboxgl.Map({
  container: 'map',
  style: styles.outdoors,
  center: [116.2420, -8.3405],
  zoom: 5,
  pitch: 0
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
  addMountainData();  // tambahkan data awal

  const add3DBuildings = () => {
    const layers = map.getStyle().layers;
    const labelLayer = layers.find(l =>
      l.type === 'symbol' && l.layout && l.layout['text-field']
    );
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

  document.getElementById('styleSelector')
    .addEventListener('change', (e) => {
      const choice = e.target.value;
      map.setStyle(styles[choice]);

      map.once('styledata', () => {
        if (choice === 'outdoors3d' || choice === 'satellite3d') {
          map.setPitch(60);
          add3DBuildings();
        } else {
          map.setPitch(0);
        }
        addMountainData();
      });
    });
});

// Fungsi terpisah untuk marker & data gunung
function addMountainData() {
  if (!map.hasImage('custom-marker')) {
    map.loadImage('https://montamap.com/assets/icon.png', (err, img) => {
      if (err) throw err;
      map.addImage('custom-marker', img);
    });
  }
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
        'icon-allow-overlap': true
      }
    });
  }
}

// Resize observer setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
  const mapsTab = document.getElementById('Maps');
  if (!mapsTab) return;
  const observer = new MutationObserver(() => {
    if (mapsTab.style.display !== 'none') {
      map.resize();
    }
  });
  observer.observe(mapsTab, {
    attributes: true,
    attributeFilter: ['style']
  });
});