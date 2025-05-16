const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Reset all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Activate selected
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Cuaca lengkap Gunung Rinjani
const apiKey = '3187c49861f858e524980ea8dd0d43c6';
const lat = -8.41;
const lon = 116.46;

fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById('temp').textContent = `${data.main.temp.toFixed(1)}°C`;
    document.getElementById('weather').textContent = data.weather[0].description;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const iconEl = document.getElementById('weather-icon');
    iconEl.src = iconUrl;
    iconEl.style.display = 'block';
  })
  .catch(err => {
    console.error('Weather fetch error:', err);
    document.getElementById('weather').textContent = 'Unavailable';
  });