// Konfigurasi
const CONFIG = {
    MAPBOX_TOKEN: "pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg"
};

// Inisialisasi variabel peta
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
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
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
        container: 'agung-overview-map',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [115.508, -8.342], // Gunung Agung coordinates
        zoom: 11,
        pitch: 45,
        bearing: -17.6,
        antialias: true
    });

    // ========== CSS untuk kontrol kustom ==========
    if (!document.getElementById('custom-map-btn-css')) {
        const style = document.createElement('style');
        style.id = 'custom-map-btn-css';
        style.textContent = `
            /* CSS sudah dipindahkan ke styles.css */
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
            <path d="M11 4v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 11l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <rect x="4" y="18" width="14" height="2" rx="1" fill="currentColor"/>
        </svg>
    `;
    downloadBtn.onclick = () => {
        map.getCanvas().toBlob(blob => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'montamap-gunung-agung.jpg';
            a.click();
        });
    };
    document.getElementById('agung-overview-map').appendChild(downloadBtn);

    // ========== TOMBOL MAP STYLE (KANAN ATAS) ==========
    const fab = document.createElement('button');
    fab.className = 'switcher-fab';
    fab.type = 'button';
    fab.title = 'Switch Map Style';
    fab.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="4" rx="2" fill="currentColor"/>
            <rect x="4" y="13" width="16" height="4" rx="2" fill="currentColor"/>
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
            icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><ellipse cx="10" cy="10" rx="8" ry="6"/><ellipse cx="10" cy="10" rx="5" ry="3" fill="#fff" opacity="0.3"/></svg>`,
            isTerrain: false
        },
        {
            label: "Satellite 3D",
            value: "mapbox://styles/mapbox/satellite-streets-v12",
            icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><ellipse cx="10" cy="10" rx="8" ry="6"/><rect x="7" y="7" width="6" height="6" fill="#fff" opacity="0.3"/></svg>`,
            isTerrain: true
        },
        {
            label: "Outdoors",
            value: "mapbox://styles/mapbox/outdoors-v12",
            icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><rect x="3" y="15" width="14" height="3" rx="1.5"/><rect x="5" y="11" width="10" height="3" rx="1.5"/></svg>`,
            isTerrain: false
        },
        {
            label: "Dark",
            value: "mapbox://styles/mapbox/dark-v11",
            icon: `<svg class="switcher-icon" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8"/><circle cx="13" cy="7" r="4" fill="#fff" opacity="0.22"/></svg>`,
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

    document.getElementById('agung-overview-map').appendChild(fab);
    document.getElementById('agung-overview-map').appendChild(dropdown);

    // ========== KANAN BAWAH: TOMBOL VERTICAL STACK ==========
    const stack = document.createElement('div');
    stack.className = 'custom-map-btn-stack';

    // Geolocate control
    const geoCtrl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
    });

    // Fullscreen control
    const fullscreenCtrl = new mapboxgl.FullscreenControl();

    // Reset view button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'custom-map-btn';
    resetBtn.type = 'button';
    resetBtn.title = 'Reset View';
    resetBtn.innerHTML = `
        <svg viewBox="0 0 22 22" fill="none">
            <path d="M4 11a7 7 0 1 1 2 5.2" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M4 16v-5h5" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
    `;
    resetBtn.onclick = () => {
        map.flyTo({ center: [115.508, -8.342], zoom: 11, pitch: 45, bearing: -17.6 });
    };

    // Kompas button
    const compassBtn = document.createElement('button');
    compassBtn.className = 'custom-map-btn';
    compassBtn.type = 'button';
    compassBtn.title = 'Reset North';
    compassBtn.innerHTML = `
        <svg viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
            <polygon points="11,4 13,13 11,11 9,13" fill="currentColor"/>
        </svg>
    `;
    compassBtn.onclick = () => {
        map.resetNorth({ animate: true });
    };

    // Navigation control
    const navCtrl = new mapboxgl.NavigationControl({ showCompass: false });

    // Urutan: geoCtrl, fullscreen, reset, compass, navCtrl
    stack.appendChild(geoCtrl.onAdd(map));
    stack.appendChild(fullscreenCtrl.onAdd(map));
    stack.appendChild(resetBtn);
    stack.appendChild(compassBtn);
    stack.appendChild(navCtrl.onAdd(map));

    document.getElementById('agung-overview-map').appendChild(stack);

    // ========== LOAD GEOJSON & ROUTES ==========
    map.on('load', () => {
        // Aktifkan terrain 3D
        enableMapboxTerrain3D(map);
        
        // Tambahkan GeoJSON source untuk basecamps
        map.addSource('agung-points', {
            type: 'geojson',
            data: 'https://montamap.com/data/agung_points.geojson'
        });

        // Tambahkan basecamp markers
        map.addLayer({
            id: 'basecamps',
            type: 'circle',
            source: 'agung-points',
            paint: {
                'circle-radius': 8,
                'circle-color': '#5a8d7b',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });

        // Tambahkan label basecamps
        map.addLayer({
            id: 'basecamp-labels',
            type: 'symbol',
            source: 'agung-points',
            layout: {
                'text-field': ['get', 'name'],
                'text-size': 12,
                'text-offset': [0, 1.5],
                'text-anchor': 'top'
            },
            paint: {
                'text-color': '#3c6b58',
                'text-halo-color': 'rgba(255,255,255,0.8)',
                'text-halo-width': 2
            }
        });

        // Tambahkan layer rute
        map.addSource('route-line', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            }
        });
        
        map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route-line',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#e74c3c',
                'line-width': 4,
                'line-opacity': 0.7
            }
        });

        // Tambahkan marker puncak
        new mapboxgl.Marker({ color: '#e74c3c' })
            .setLngLat([115.508, -8.342])
            .setPopup(new mapboxgl.Popup().setHTML('<h3>Puncak Agung</h3><p>Elevation: 3,031 m</p>'))
            .addTo(map);

        // ========== ROUTE BUTTON FUNCTIONALITY ==========
        const routeBtns = document.querySelectorAll('.route-btn');
        routeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                routeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const routeType = this.getAttribute('data-route');
                let coordinates;

                switch(routeType) {
                    case 'besakih':
                        coordinates = [
                            [115.448, -8.372], // Besakih start
                            [115.455, -8.365],
                            [115.465, -8.358],
                            [115.475, -8.352],
                            [115.485, -8.348],
                            [115.495, -8.345],
                            [115.505, -8.343]  // Summit
                        ];
                        break;
                    case 'pura-pasar':
                        coordinates = [
                            [115.535, -8.325], // Pura Pasar Agung start
                            [115.525, -8.330],
                            [115.515, -8.335],
                            [115.505, -8.338],
                            [115.505, -8.343]  // Summit
                        ];
                        break;
                }

                // Update garis rute
                map.getSource('route-line').setData({
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates
                    }
                });

                // Fit peta ke rute
                const bounds = coordinates.reduce((bounds, coord) => {
                    return bounds.extend(coord);
                }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

                map.fitBounds(bounds, {
                    padding: 50,
                    duration: 2000
                });
            });
        });
    });
}

// Panggil initMap saat dokumen siap
document.addEventListener('DOMContentLoaded', initMap);