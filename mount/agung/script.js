// ============================
// 1. LOAD CONFIGURATION
// ============================
const CONFIG = {
  MAPBOX_TOKEN: "pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg",
  OPENWEATHER_API_KEY: "3187c49861f858e524980ea8dd0d43c6"
};

// ============================
// 2. DOMContentLoaded: UI LOGIC
// ============================
document.addEventListener('DOMContentLoaded', () => {
  // 2.1 Tab switching
  const tabs        = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
      // Jika tab peta dipilih, inisialisasi map
      if (tab.dataset.tab === 'map') initMap();
    });
  });

  // 2.2 Simulasi data cuaca
  setTimeout(() => {
    document.getElementById('temp').textContent     = '18°C';
    document.getElementById('weather').textContent  = 'Partly Cloudy';
    document.getElementById('wind').textContent     = '12 km/h NE';
    document.getElementById('humidity').textContent = '65%';
  }, 1500);

  // Jika halaman langsung buka map tab
  if (document.querySelector('.tab[data-tab="map"].active')) {
    initMap();
  }
});

// ============================
// 3. MAPBOX INITIALIZATION
// ============================
let map, mapInitialized = false;

function enableMapboxTerrain3D(map) {
  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb',
      tileSize: 512,
      maxzoom: 14
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.4 });
    map.addLayer({ id: 'hillshading', source: 'mapbox-dem', type: 'hillshade' });
  }
}

function disableMapboxTerrain3D(map) {
  if (map.getLayer('hillshading')) map.removeLayer('hillshading');
  if (map.getSource('mapbox-dem')) map.removeSource('mapbox-dem');
  map.setTerrain(null);
}

function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;
  mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;

  // 3.1 Create map
  map = new mapboxgl.Map({
    container: 'map',
    style:     'mapbox://styles/mapbox/outdoors-v12',
    center:    [116.4575, -8.4111],
    zoom:      9,
    pitch:     45,
    bearing:   -17.6,
    antialias: true
  });
  window.map = map;

  // 3.2 Inject CSS for custom controls
  if (!document.getElementById('custom-map-btn-css')) {
    const style = document.createElement('style');
    style.id = 'custom-map-btn-css';
    style.textContent = `
      /* DOWNLOAD BUTTON (TOP-LEFT) */
      .custom-map-btn-download { position:absolute; top:12px; left:12px; z-index:15;
        width:25px;height:25px; background:transparent; border:1.5px solid #e0e0e0;
        border-radius:8px; box-shadow:0 2px 12px rgba(53,104,89,0.08);
        display:flex; align-items:center; justify-content:center; cursor:pointer;
        transition:box-shadow .18s, border-color .15s, background .15s; padding:0; }
      .custom-map-btn-download:hover, .custom-map-btn-download:focus-visible {
        border-color:#356859; background:#f0faf6; box-shadow:0 4px 18px rgba(53,104,89,0.13); }
      .custom-map-btn-download svg { width:18px;height:18px;color:#356859;pointer-events:none; }

      /* STYLE SWITCHER (TOP-RIGHT) */
      .switcher-fab { position:absolute; top:16px; right:16px; z-index:30;
        width:46px;height:46px; background:#fff; border-radius:50%;
        border:1.5px solid #e0e0e0; box-shadow:0 2px 12px rgba(53,104,89,0.08);
        display:flex; align-items:center; justify-content:center; cursor:pointer;
        transition:box-shadow .18s; }
      .switcher-fab:hover { box-shadow:0 2.5px 18px rgba(53,104,89,0.13); }
      .switcher-dropdown { display:none; position:absolute; top:54px; right:0;
        background:#fff; border-radius:10px; box-shadow:0 2.5px 16px rgba(53,104,89,0.13);
        min-width:155px; padding:8px 0; z-index:200; border:1.5px solid #e0e0e0;
        font-family:inherit; }
      .switcher-dropdown.open { display:block; animation:fadeIn .19s; }
      @keyframes fadeIn { from{ opacity:0; transform:translateY(-8px);} to{ opacity:1;} }
      .switcher-dropdown button { background:none; border:none; width:100%;
        text-align:left; padding:9px 18px 9px 35px; color:#356859; font-size:15px;
        cursor:pointer; display:flex; align-items:center; gap:7px; outline:none; }
      .switcher-dropdown button.active { background:#f0faf6; color:#1d3d32; font-weight:bold; }
      .switcher-dropdown button:hover { background:#e3f4ee; }
      .switcher-icon { width:18px;height:18px;opacity:.8; }

      /* STACKED CONTROLS (BOTTOM-RIGHT) */
      .custom-map-btn-stack { position:absolute; bottom:18px; right:18px; z-index:30;
        display:flex; flex-direction:column-reverse; gap:10px; align-items:flex-end; }
      .custom-map-btn-stack .custom-map-btn,
      .custom-map-btn-stack .mapboxgl-ctrl { width:40px!important; height:40px!important;
        min-width:40px!important; min-height:40px!important; border-radius:8px!important;
        margin:0!important; box-shadow:0 2px 12px rgba(53,104,89,0.08);
        background:#fff!important; border:1.5px solid #e0e0e0!important;
        display:flex!important; align-items:center!important; justify-content:center!important;
        cursor:pointer!important; }
      .custom-map-btn-stack svg, .custom-map-btn-stack .mapboxgl-ctrl-icon,
      .custom-map-btn-stack .mapboxgl-ctrl-compass-arrow { width:21px!important; height:21px!important; color:#356859!important; }
      .mapboxgl-ctrl-group { flex-direction:column!important; gap:0!important; background:none!important; border:none!important; box-shadow:none!important; }
      .mapboxgl-ctrl-group > button { border-radius:8px!important; }

      /* TOOLTIP */
      .custom-map-btn[title]:hover::after,
      .custom-map-btn-download[title]:hover::after {
        content: attr(title); position:absolute; left:50%; top:-32px;
        transform:translateX(-50%); background:#356859; color:#fff;
        font-size:12px; padding:2px 10px; border-radius:5px; z-index:1001;
        box-shadow:0 2px 10px rgba(53,104,89,0.12); pointer-events:none;
      }

      /* GLASSMORPHISM & DARK MODE */
      .custom-map-btn-download, .switcher-fab {
        background:rgba(255,255,255,0.2)!important; backdrop-filter:blur(6px)!important; border:1px solid rgba(255,255,255,0.3)!important; }
      body.dark .custom-map-btn-download, body.dark .switcher-fab {
        background:rgba(0,0,0,0.2)!important; border:1px solid rgba(255,255,255,0.2)!important; }
        
      /* PERBAIKAN: TOMBOL RUTE BARU */
      .route-buttons-container {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        z-index: 20;
      }
      .route-btn {
        background: #fff;
        border: 1.5px solid #e0e0e0;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 14px;
        color: #356859;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(53,104,89,0.08);
        transition: all 0.18s;
      }
      .route-btn:hover {
        background: #f0faf6;
        border-color: #356859;
      }
      .route-btn.active {
        background: #e3f4ee;
        border-color: #356859;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }

  // 3.3 Add Download Button (Top-Left)
  const dlBtn = document.createElement('button');
  dlBtn.className = 'custom-map-btn-download';
  dlBtn.title     = 'Download Map';
  dlBtn.innerHTML = `
    <svg viewBox="0 0 22 22"><path d="M11 4v10" stroke="#356859" stroke-width="2" stroke-linecap="round"/>
    <path d="M7 11l4 4 4-4" stroke="#356859" stroke-width="2" stroke-linecap="round"/>
    <rect x="4" y="18" width="14" height="2" rx="1" fill="#356859"/></svg>`;
  dlBtn.onclick = () => {
    map.getCanvas().toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href     = url;
      a.download = 'montamap-map.jpg';
      a.click();
    });
  };
  document.getElementById('map').appendChild(dlBtn);

  // 3.4 Style Switcher (Top-Right)
  const fab      = document.createElement('button');
  fab.className  = 'switcher-fab';
  fab.title      = 'Switch Map Style';
  fab.innerHTML  = `<svg viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="4" rx="2" fill="#356859"/>
    <rect x="4" y="13" width="16" height="4" rx="2" fill="#B5CDA3"/>
  </svg>`;

  const mapStyles = [
    { label:"Terrain 3D", value:"mapbox://styles/mapbox/outdoors-v12", icon:`<svg class="switcher-icon" viewBox="0 0 20 20"><rect x="2" y="13" width="16" height="5" rx="2"/><rect x="4" y="7" width="12" height="5" rx="2"/></svg>`, isTerrain:true },
    { label:"Satellite", value:"mapbox://styles/mapbox/satellite-v9", icon:`<svg class="switcher-icon" viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="8" ry="6"/><ellipse cx="10" cy="10" rx="5" ry="3" fill="#fff"/></svg>`, isTerrain:false },
    { label:"Satellite 3D", value:"mapbox://styles/mapbox/satellite-streets-v12", icon:`<svg class="switcher-icon" viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="8" ry="6"/><rect x="7" y="7" width="6" height="6" fill="#fff"/></svg>`, isTerrain:true },
    { label:"Outdoors", value:"mapbox://styles/mapbox/outdoors-v12", icon:`<svg class="switcher-icon" viewBox="0 0 20 20"><rect x="3" y="15" width="14" height="3" rx="1.5"/><rect x="5" y="11" width="10" height="3" rx="1.5"/></svg>`, isTerrain:false },
    { label:"Streets", value:"mapbox://styles/mapbox/streets-v12", icon:`<svg class="switcher-icon" viewBox="0 0 20 20"><rect x="4" y="9" width="12" height="2" rx="1"/><rect x="6" y="13" width="8" height="2" rx="1"/></svg>`, isTerrain:false },
    { label:"Dark", value:"mapbox://styles/mapbox/dark-v11", icon:`<svg class="switcher-icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><circle cx="13" cy="7" r="4" fill="#fff" opacity=".22"/></svg>`, isTerrain:false }
  ];

  const dropdown = document.createElement('div');
  dropdown.className = 'switcher-dropdown';
  mapStyles.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.innerHTML = s.icon + s.label;
    btn.dataset.style = s.value;
    if (i===0) btn.classList.add('active');
    btn.onclick = () => {
      map.setStyle(s.value);
      map.once('style.load', () => {
        map.jumpTo({ pitch:45, bearing:-17.6 });
        s.isTerrain ? enableMapboxTerrain3D(map) : disableMapboxTerrain3D(map);
      });
      dropdown.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      dropdown.classList.remove('open');
    };
    dropdown.appendChild(btn);
  });
  fab.onclick = e => { e.stopPropagation(); dropdown.classList.toggle('open'); };
  document.addEventListener('click', () => dropdown.classList.remove('open'));
  document.getElementById('map').appendChild(fab);
  document.getElementById('map').appendChild(dropdown);

  // 3.5 Stacked Controls (Bottom-Right)
  const stack = document.createElement('div');
  stack.className = 'custom-map-btn-stack';

  // Geolocate
  const geoCtrl = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy:true },
    trackUserLocation:true,
    showUserHeading:true
  });
  stack.appendChild(geoCtrl.onAdd(map));

  // Fullscreen
  const fullCtrl = new mapboxgl.FullscreenControl();
  stack.appendChild(fullCtrl.onAdd(map));

  // Reset view button
  const resetBtn = document.createElement('button');
  resetBtn.className = 'custom-map-btn';
  resetBtn.innerHTML = `<svg viewBox="0 0 22 22"><path d="M4 11a7 7 0 1 1 2 5.2" stroke="#356859" stroke-width="2" fill="none"/><path d="M4 16v-5h5" stroke="#356859" stroke-width="2" fill="none"/></svg>`;
  resetBtn.onclick = () => map.flyTo({ center:[116.4575,-8.4111], zoom:9, pitch:45, bearing:-17.6 });
  stack.appendChild(resetBtn);

  // Compass reset
  const compassBtn = document.createElement('button');
  compassBtn.className = 'custom-map-btn';
  compassBtn.innerHTML = `<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" stroke="#356859" stroke-width="2" fill="none"/><polygon points="11,4 13,13 11,11 9,13" fill="#356859"/></svg>`;
  compassBtn.onclick = () => map.resetNorth({ animate:true });
  stack.appendChild(compassBtn);

  // Navigation without compass
  const navCtrl = new mapboxgl.NavigationControl({ showCompass:false });
  stack.appendChild(navCtrl.onAdd(map));

  document.getElementById('map').appendChild(stack);

  // 3.6 Default terrain on load
  map.on('style.load', () => {
    const active = dropdown.querySelector('button.active');
    const styleObj = mapStyles.find(x => x.value === active.dataset.style);
    styleObj.isTerrain ? enableMapboxTerrain3D(map) : disableMapboxTerrain3D(map);
  });
  map.on('load', () => enableMapboxTerrain3D(map));

  // ============================
  // 4. GEOJSON SOURCES & LAYERS
  // ============================
  map.on('load', () => {
    map.addSource('agung-points', {
      type: 'geojson',
      data: 'https://montamap.com/data/agung_points.geojson'
    });
    map.addLayer({
      id: 'basecamps',
      type: 'circle',
      source: 'agung-points',
      paint: {
        'circle-radius':      8,
        'circle-color':       '#5a8d7b',
        'circle-stroke-width':2,
        'circle-stroke-color':'#ffffff'
      }
    });
    map.addLayer({
      id: 'basecamp-labels',
      type: 'symbol',
      source: 'agung-points',
      layout: {
        'text-field':  ['get','name'],
        'text-size':   12,
        'text-offset':[0,1.5],
        'text-anchor':'top'
      },
      paint: {
        'text-color':      '#3c6b58',
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 2
      }
    });
    // Summit marker
    new mapboxgl.Marker({ color:'#e74c3c' })
      .setLngLat([115.508, -8.342])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Puncak Agung</h3><p>Elevation: 3,031 m</p>'))
      .addTo(map);
    // Route line empty source
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: { type:'geojson', data:{ type:'Feature', geometry:{ type:'LineString', coordinates:[] } } },
      layout:{ 'line-join':'round','line-cap':'round' },
      paint:{ 'line-color':'#e74c3c','line-width':4,'line-opacity':0.7 }
    });
  });

  // ============================
  // 5. DYNAMIC ROUTING LOGIC (DIPERBAIKI)
  // ============================
  // Buat container baru untuk tombol rute
  const routeButtonsContainer = document.createElement('div');
  routeButtonsContainer.className = 'route-buttons-container';
  document.getElementById('map').appendChild(routeButtonsContainer);

  // Hanya dua rute yang tersisa (Besakih dan Pura Pasar)
  const routes = [
    { id: 'besakih', label: 'Rute Besakih' },
    { id: 'pura-pasar', label: 'Rute Pura Pasar' }
  ];

  // Buat tombol untuk setiap rute
  routes.forEach(route => {
    const btn = document.createElement('button');
    btn.className = 'route-btn';
    btn.textContent = route.label;
    btn.dataset.route = route.id;
    routeButtonsContainer.appendChild(btn);
  });

  // Tambahkan event listener ke tombol rute
  const routeBtns = document.querySelectorAll('.route-btn');
  routeBtns.forEach(btn => {
    btn.addEventListener('click', function(){
      routeBtns.forEach(x=>x.classList.remove('active'));
      this.classList.add('active');
      const type = this.dataset.route;
      let coords = [];
      switch(type){
        case 'besakih':
          coords = [[115.448,-8.372],[115.455,-8.365],[115.465,-8.358],[115.475,-8.352],[115.485,-8.348],[115.495,-8.345],[115.505,-8.343]];
          break;
        case 'pura-pasar':
          coords = [[115.535,-8.325],[115.525,-8.330],[115.515,-8.335],[115.505,-8.338],[115.505,-8.343]];
          break;
      }
      map.getSource('route-line').setData({ type:'Feature', geometry:{ type:'LineString', coordinates:coords } });
      const bounds = coords.reduce((b,c)=>b.extend(c), new mapboxgl.LngLatBounds(coords[0],coords[0]));
      map.fitBounds(bounds,{ padding:50, duration:2000 });
    });
  });
}