// Konfigurasi
const CONFIG = {
  MAPBOX_TOKEN: "pk.eyJ1IjoiYWRlbWlhbmRvIiwiYSI6ImNtYXF1YWx6NjAzdncya3B0MDc5cjhnOTkifQ.RhVpan3rfXY0fiix3HMszg",
  OPENWEATHER_API_KEY: "3187c49861f858e524980ea8dd0d43c6"
};

// Fungsi utama saat dokumen dimuat
document.addEventListener('DOMContentLoaded', function() {
  // Inisialisasi tab
  initTabs();
  
  // Simulasi data cuaca
  setTimeout(() => {
    document.getElementById('temp').textContent = '18°C';
    document.getElementById('weather').textContent = 'Partly Cloudy';
    document.getElementById('wind').textContent = '12 km/h NE';
    document.getElementById('humidity').textContent = '65%';
  }, 1500);
});

// Fungsi untuk mengelola tab
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Hapus kelas aktif dari semua tab dan konten
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Tambahkan kelas aktif ke tab yang diklik dan konten terkait
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}