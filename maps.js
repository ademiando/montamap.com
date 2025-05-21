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
  map.loadImage(
    'https://montamap.com/assets/icon.png',
    (error, image) => {
      if (error) throw error;
      map.addImage('custom-marker', image);

      map.addSource('mountains', {
        type: 'geojson',
        data: 'https://montamap.com/data/mountains_indonesia.gejson'
      });

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
  );

  const add3DBuildings = () => {
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(layer => layer.type === 'symbol' && layer.layout['text-field']).id;

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
    }, labelLayerId);
  };

  document.getElementById('styleSelector').addEventListener('change', (e) => {
    const choice = e.target.value;
    map.setStyle(styles[choice]);

    if (choice === 'outdoors3d' || choice === 'satellite3d') {
      map.once('styledata', () => {
        map.setPitch(60);
        add3DBuildings();
      });
    } else {
      map.once('styledata', () => {
        map.setPitch(0);
      });
    }
  });
});