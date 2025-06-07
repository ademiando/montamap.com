(function() {
  const mapStyles = [
    { label: "Outdoors",   value: "mapbox://styles/mapbox/outdoors-v12" },
    { label: "Satellite",  value: "mapbox://styles/mapbox/satellite-v9" },
    { label: "Satellite 3D", value: "mapbox://styles/mapbox/satellite-streets-v12" },
    { label: "Dark",       value: "mapbox://styles/mapbox/dark-v11" },
    { label: "Streets",    value: "mapbox://styles/mapbox/streets-v12" },
    { label: "Terrain 3D", value: "mapbox://styles/mapbox/outdoors-v12" }
  ];

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

  function injectSwitcher() {
    if (!window.map || document.querySelector('.map-style-switcher-box')) return;
    const mapboxMapDiv = document.getElementById('map');
    if (!mapboxMapDiv) return;

    const box = document.createElement('div');
    box.className = 'map-style-switcher-box';

    mapStyles.forEach(({label, value}, i) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.setAttribute('data-style', value);
      if (i === 0) btn.classList.add('active');
      btn.onclick = function() {
        window.map.setStyle(value);
        box.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      box.appendChild(btn);
    });

    mapboxMapDiv.appendChild(box);

    window.map.on('style.load', function() {
      const cur = window.map.getStyle().sprite;
      box.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-style') === window.map.getStyle().sprite?.replace(/\/sprite$/, ''));
      });
    });
  }

  function waitForMapbox() {
    if (window.map && window.map.isStyleLoaded && window.map.isStyleLoaded()) {
      injectSwitcher();
    } else if (window.map) {
      window.map.once('load', injectSwitcher);
    } else {
      setTimeout(waitForMapbox, 300);
    }
  }
  waitForMapbox();
})();
