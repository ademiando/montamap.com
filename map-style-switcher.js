// ===== AUTO MAP STYLE SWITCHER =====
// Buat tombol map style otomatis di pojok kanan atas #map
// Tidak perlu otak-atik HTML, cukup include file ini setelah script.js

(function() {
  // Daftar style
  const mapStyles = [
    { label: "Outdoors",   value: "mapbox://styles/mapbox/outdoors-v12" },
    { label: "Satellite",  value: "mapbox://styles/mapbox/satellite-v9" },
    { label: "Satellite 3D", value: "mapbox://styles/mapbox/satellite-streets-v12" },
    { label: "Dark",       value: "mapbox://styles/mapbox/dark-v11" },
    { label: "Streets",    value: "mapbox://styles/mapbox/streets-v12" },
    { label: "Terrain 3D", value: "mapbox://styles/mapbox/outdoors-v12" }
  ];

  // Style tombol & container
  const style = document.createElement('style');
  style.textContent = `
    .map-style-switcher-box {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      background: rgba(255,255,255,0.96);
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.10);
      padding: 9px 14px 9px 10px;
      display: flex;
      gap: 5px;
      align-items: center;
      font-family: inherit;
      border: 1px solid #e0e0e0;
      user-select: none;
    }
    .map-style-switcher-box button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px 13px;
      border-radius: 5px;
      font-size: 13px;
      color: #356859;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
    }
    .map-style-switcher-box button.active,
    .map-style-switcher-box button:hover {
      background: #356859;
      color: #fff;
    }
    @media (max-width:600px) {
      .map-style-switcher-box {
        top: 7px; right: 7px; padding: 5px 7px 5px 5px;
      }
      .map-style-switcher-box button {
        font-size: 11px; padding: 3px 7px;
      }
    }
  `;
  document.head.appendChild(style);

  // Fungsi untuk membuat & inject tombol
  function injectSwitcher() {
    // Pastikan map ada & hanya inject sekali
    if (!window.map || document.querySelector('.map-style-switcher-box')) return;
    const mapboxMapDiv = document.getElementById('map');
    if (!mapboxMapDiv) return;

    // Buat container switcher
    const box = document.createElement('div');
    box.className = 'map-style-switcher-box';

    // Buat tombol2 style
    mapStyles.forEach(({label, value}, i) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.setAttribute('data-style', value);
      if (i === 0) btn.classList.add('active');
      btn.onclick = function() {
        window.map.setStyle(value);
        // Highlight yang aktif
        box.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      box.appendChild(btn);
    });

    // Inject ke map container
    mapboxMapDiv.appendChild(box);

    // Sync tombol aktif jika ganti style lewat cara lain
    window.map.on('style.load', function() {
      const current = window.map.getStyle().sprite?.replace(/\/sprite$/, '');
      let found = false;
      box.querySelectorAll('button').forEach(btn => {
        if (btn.getAttribute('data-style') === window.map.getStyle().sprite?.replace(/\/sprite$/, '')) {
          btn.classList.add('active'); found = true;
        } else {
          btn.classList.remove('active');
        }
      });
      // Atau fallback ke style URL
      if (!found) {
        const styleUrl = window.map.getStyle().sprite?.replace(/\/sprite$/, '') ||
                         window.map.getStyle().metadata?.['mapbox:origin'] ||
                         '';
        box.querySelectorAll('button').forEach(btn => {
          if (btn.getAttribute('data-style') === styleUrl) btn.classList.add('active');
        });
      }
    });
  }

  // Tunggu MAP siap, lalu inject tombol
  function waitForMapbox() {
    if (window.map && window.map.loaded()) {
      injectSwitcher();
    } else if (window.map) {
      window.map.once('load', injectSwitcher);
    } else {
      setTimeout(waitForMapbox, 300);
    }
  }
  waitForMapbox();
})();
