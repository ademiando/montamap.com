let map; // Simpan global biar bisa diakses ulang
let mapInitialized = false;

function initMap() {
  if (mapInitialized) return; // Jangan inisialisasi ulang

  mapboxgl.accessToken = 'pk.eyJ1IjoibW9udGFtYXBwIiwiYSI6ImNsamM0aGNkZDAxM3Mza3FuZzhid2plcHAifQ.nZ_xTAcBW0sNHi0Utyh9Kg';

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [116.4575, -8.4111],
    zoom: 9
  });

  map.addControl(new mapboxgl.NavigationControl());

  // Ganti style saat dropdown dipilih
  const styleSelector = document.getElementById('styleSelector');
  styleSelector.addEventListener('change', function () {
    const selected = styleSelector.value;
    const styles = {
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      outdoors3d: 'mapbox://styles/mapbox/outdoors-v12',
      satellite3d: 'mapbox://styles/mapbox/satellite-streets-v12',
      dark: 'mapbox://styles/mapbox/dark-v11'
    };
    map.setStyle(styles[selected]);
  });

  mapInitialized = true;
}

// Pantau klik tab Maps
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab === 'Maps') {
        setTimeout(() => {
          initMap();
        }, 100); // Delay sedikit agar #map sempat dimunculkan
      }
    });
  });
});