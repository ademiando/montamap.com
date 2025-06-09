// 1. Initiation MapboxGL
let map;
let mapInitialized = false;

function enableMapboxTerrain3D(map) {
  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.terrain-rgb',
      'tileSize': 512,
      'maxzoom': 14
    });
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.4 });
    map.addLayer({
      'id': 'hillshading',
      'source': 'mapbox-dem',
      'type': 'hillshade'
    });
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
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [116.4575, -8.4111],
    zoom: 9,
    pitch: 45,
    bearing: -17.6,
    antialias: true
  });

  window.map = map;

  // ========== CSS ==========

  if (!document.getElementById('custom-map-btn-css')) {
    const style = document.createElement('style');
    style.id = 'custom-map-btn-css';
    style.textContent = `
      /* KIRI ATAS */
      .custom-map-btn-download {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 15;
        width: 25px;
        height: 25px;
        background: transparent;
        border: 1.5px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(53,104,89,0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: box-shadow 0.18s, border-color 0.15s, background 0.15s;
        padding: 0;
        outline: none;
      }
      .custom-map-btn-download:hover, .custom-map-btn-download:focus-visible {
        border-color: #356859;
        background: #f0faf6;
        box-shadow: 0 4px 18px rgba(53,104,89,0.13);
      }
      .custom-map-btn-download svg {
        width: 18px;
        height: 18px;
        color: #356859;
        pointer-events: none;
      }

      /* KANAN ATAS */
      .switcher-fab {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 30;
        width: 46px;
        height: 46px;
        background: #fff;
        border-radius: 50%;
        border: 1.5px solid #e0e0e0;
        box-shadow: 0 2px 12px rgba(53,104,89,0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: box-shadow .18s;
      }
      .switcher-fab:hover {
        box-shadow: 0 2.5px 18px rgba(53,104,89,0.13);
      }
      .switcher-fab svg {
        width: 26px;
        height: 26px;
        color: #356859;
      }
      .switcher-dropdown {
        display: none;
        position: absolute;
        top: 54px;
        right: 0;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 2.5px 16px rgba(53,104,89,0.13);
        min-width: 155px;
        padding: 8px 0;
        z-index: 200;
        border: 1.5px solid #e0e0e0;
        font-family: inherit;
      }
      .switcher-dropdown.open {
        display: block;
        animation: fadeIn .19s;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-8px);}
        to { opacity: 1; transform: none;}
      }
      .switcher-dropdown button {
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        padding: 9px 18px 9px 35px;
        color: #356859;
        font-size: 15px;
        cursor: pointer;
        border-radius: 0;
        position: relative;
        transition: background .13s;
        outline: none;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .switcher-dropdown button.active {
        background: #f0faf6;
        color: #1d3d32;
        font-weight: bold;
      }
      .switcher-dropdown button:hover {
        background: #e3f4ee;
      }
      .switcher-dropdown .switcher-icon {
        width: 18px;
        height: 18px;
        opacity: .8;
      }

      /* KANAN BAWAH */
      .custom-map-btn-stack {
        position: absolute;
        bottom: 18px;
        right: 18px;
        z-index: 30;
        display: flex;
        flex-direction: column-reverse;
        gap: 10px;
        align-items: flex-end;
      }
      .custom-map-btn-stack .custom-map-btn,
      .custom-map-btn-stack .mapboxgl-ctrl {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        min-height: 40px !important;
        border-radius: 8px !important;
        margin: 0 !important;
        box-shadow: 0 2px 12px rgba(53,104,89,0.08);
        background: #fff !important;
        border: 1.5px solid #e0e0e0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 !important;
        cursor: pointer !important;
      }
      .custom-map-btn-stack .custom-map-btn svg,
      .custom-map-btn-stack .mapboxgl-ctrl-icon,
      .custom-map-btn-stack .mapboxgl-ctrl-compass-arrow {
        width: 21px !important;
        height: 21px !important;
        color: #356859 !important;
      }
      .custom-map-btn-stack .mapboxgl-ctrl-group {
        flex-direction: column !important;
        gap: 0 !important;
        border-radius: 8px !important;
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
        background: none !important;
      }
      .custom-map-btn-stack .mapboxgl-ctrl-group > button {
        border-radius: 8px !important;
        border: none !important;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }

      /* Tooltip custom */
      .custom-map-btn[title]:hover::after, .custom-map-btn[title]:focus::after,
      .custom-map-btn-download[title]:hover::after, .custom-map-btn-download[title]:focus::after {
        content: attr(title);
        position: absolute;
        left: 50%;
        top: -32px;
        transform: translateX(-50%);
        white-space: nowrap;
        background: #356859;
        color: #fff;
        font-size: 12px;
        padding: 2px 10px;
        border-radius: 5px;
        z-index: 1001;
        box-shadow: 0 2px 10px rgba(53,104,89,0.12);
        pointer-events: none;
      }


/* Glassmorphism style */
.custom-map-btn-download,
.switcher-fab {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Versi gelap untuk dark mode */
body.dark .custom-map-btn-download,
body.dark .switcher-fab {
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.custom-map-btn-stack .custom-map-btn,
.custom-map-btn-stack .mapboxgl-ctrl {
  background: rgba(255, 255, 255, 0.2) !important; /* putih transparan */
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* efek mengambang */
}
      
@media (max-width:600px) {
  .custom-map-btn-download {
    width: 26px;
    height: 26px;
    top: 7px;
    left: 7px;
  }
  .switcher-fab {
    width: 38px;
    height: 38px;
    top: 7px;
    right: 7px;
  }
  .custom-map-btn-stack {
    right: 7px;
    bottom: 7px;
    gap: 5px;
  }
  .switcher-dropdown {
    min-width: 120px;
  }
  .switcher-dropdown button {
    font-size: 12px;
    padding: 7px 10px 7px 28px;
    gap: 3px;
  }
  .switcher-dropdown .switcher-icon {
    width: 13px;
    height: 13px;
  }
}

    `;
    document.head.appendChild(style);
  }

  // ========== TOMBOL DOWNLOAD (KIRI ATAS) ==========
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'custom-map-btn-download';
  downloadBtn.type = 'button';
  downloadBtn.title = 'Download Map';
  downloadBtn.innerHTML = `
    <svg viewBox="0 0 22 22" fill="none">
      <path d="M11 4v10" stroke="#356859" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 11l4 4 4-4" stroke="#356859" stroke-width="2" stroke-linecap="round"/>
      <rect x="4" y="18" width="14" height="2" rx="1" fill="#356859"/>
    </svg>
  `;
  downloadBtn.onclick = () => {
    map.getCanvas().toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'montamap-map.jpg';
      a.click();
    });
  };
  document.getElementById('map').appendChild(downloadBtn);

  // ========== TOMBOL MAP STYLE (KANAN ATAS) ==========
  const fab = document.createElement('button');
  fab.className = 'switcher-fab';
  fab.type = 'button';
  fab.title = 'Switch Map Style';
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="4" rx="2" fill="#356859"/>
      <rect x="4" y="13" width="16" height="4" rx="2" fill="#B5CDA3"/>
    </svg>
  `;

  // Dropdown isi
  const mapStyles = [
    {
      label: "Terrain 3D",
      value: "mapbox://styles/mapbox/outdoors-v12",
      icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="13" width="16" height="5" rx="2"/><rect x="4" y="7" width="12" height="5" rx="2"/></svg>`,
      isTerrain: true
    },
    {
      label: "Satellite",
      value: "mapbox://styles/mapbox/satellite-v9",
      icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><ellipse cx="10" cy="10" rx="8" ry="6"/><ellipse cx="10" cy="10" rx="5" ry="3" fill="#fff"/></svg>`,
      isTerrain: false
    },
    {
      label: "Satellite 3D",
      value: "mapbox://styles/mapbox/satellite-streets-v12",
      icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><ellipse cx="10" cy="10" rx="8" ry="6"/><rect x="7" y="7" width="6" height="6" fill="#fff"/></svg>`,
      isTerrain: true
    },
    {
      label: "Outdoors",
      value: "mapbox://styles/mapbox/outdoors-v12",
      icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><rect x="3" y="15" width="14" height="3" rx="1.5"/><rect x="5" y="11" width="10" height="3" rx="1.5"/></svg>`,
      isTerrain: false
    },
    {
      label: "Streets",
      value: "mapbox://styles/mapbox/streets-v12",
      icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><rect x="4" y="9" width="12" height="2" rx="1"/><rect x="6" y="13" width="8" height="2" rx="1"/></svg>`,
      isTerrain: false
    },
    {
      label: "Dark",
      value: "mapbox://styles/mapbox/dark-v11",
      icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="#222"><circle cx="10" cy="10" r="8"/><circle cx="13" cy="7" r="4" fill="#fff" opacity="0.22"/></svg>`,
      isTerrain: false
    }
  ];

  const dropdown = document.createElement('div');
  dropdown.className = 'switcher-dropdown';
  mapStyles.forEach((style, idx) => {
    const btn = document.createElement('button');
    btn.innerHTML = style.icon + style.label;
    btn.setAttribute('data-style', style.value);
    if (idx === 0) btn.classList.add('active');
    btn.onclick = function() {
      map.setStyle(style.value);
      map.once('style.load', function() {
        map.jumpTo({ pitch: 45, bearing: -17.6 });
        if (style.isTerrain) enableMapboxTerrain3D(map);
        else disableMapboxTerrain3D(map);
      });
      dropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dropdown.classList.remove('open');
    };
    dropdown.appendChild(btn);
  });

  fab.onclick = function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  };
  document.addEventListener('click', function() {
    dropdown.classList.remove('open');
  });

  document.getElementById('map').appendChild(fab);
  document.getElementById('map').appendChild(dropdown);

  // ========== KANAN BAWAH: TOMBOL VERTICAL STACK ==========

  const stack = document.createElement('div');
  stack.className = 'custom-map-btn-stack';

  // 1.1) Geolocate (lokasi) MapboxGL
  const geoCtrl = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  });

  // 1.2) Fullscreen MapboxGL
  const fullscreenCtrl = new mapboxgl.FullscreenControl();

  // 1.3) Reset View (custom)
  const resetBtn = document.createElement('button');
  resetBtn.className = 'custom-map-btn';
  resetBtn.type = 'button';
  resetBtn.innerHTML = `
    <svg viewBox="0 0 22 22" fill="none">
      <path d="M4 11a7 7 0 1 1 2 5.2" stroke="#356859" stroke-width="2" fill="none"/>
      <path d="M4 16v-5h5" stroke="#356859" stroke-width="2" fill="none"/>
    </svg>
  `;
  resetBtn.onclick = () => {
    map.flyTo({ center: [116.4575, -8.4111], zoom: 9, pitch: 45, bearing: -17.6 });
  };

  // 1.4) Kompas (custom, trigger compass reset)
  const compassBtn = document.createElement('button');
  compassBtn.className = 'custom-map-btn';
  compassBtn.type = 'button';
  compassBtn.innerHTML = `
    <svg viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke="#356859" stroke-width="2" fill="none"/>
      <polygon points="11,4 13,13 11,11 9,13" fill="#356859"/>
    </svg>
  `;
  compassBtn.onclick = () => {
    map.resetNorth({ animate: true });
  };

  // 1.5) Zoom MapboxGL (tanpa kompas)
  const navCtrl = new mapboxgl.NavigationControl({ showCompass: false });

  // Masuk Urutan: geoCtrl (paling bawah), fullscreen, reset, compass, navCtrl (paling atas)
  stack.appendChild(mapboxgl.GeolocateControl.prototype._createButton ? geoCtrl.onAdd(map) : geoCtrl.onAdd(map));
  stack.appendChild(fullscreenCtrl.onAdd(map));
  stack.appendChild(resetBtn);
  stack.appendChild(compassBtn);
  stack.appendChild(navCtrl.onAdd(map));

  document.getElementById('map').appendChild(stack);

  // ========== TERAIN AKTIF DEFAULT ==========
  map.on('style.load', function() {
    const activeBtn = [...dropdown.querySelectorAll('button')].find(btn => btn.classList.contains('active'));
    const styleObj = mapStyles.find(s => s.value === (activeBtn?.getAttribute('data-style')));
    if (styleObj?.isTerrain) enableMapboxTerrain3D(map);
    else disableMapboxTerrain3D(map);
  });
  map.on('load', function() {
    enableMapboxTerrain3D(map);
  });
}
