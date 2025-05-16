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

// --- Hero slider ---
const slides = document.querySelectorAll('.overview-hero.slider .slide');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

prevBtn.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
});

nextBtn.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
});

// Auto slide every 5 seconds
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}, 5000);

// --- Weather Fetch ---
const apiKey = '3187c49861f858e524980ea8dd0d43c6';
const lat = -8.41; // Rinjani latitude
const lon = 116.46; // Rinjani longitude

async function fetchWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather data fetch failed');
    const data = await res.json();

    document.getElementById('temp').textContent = `${Math.round(data.main.temp)} °C`;
    document.getElementById('weather').textContent = data.weather[0].description.replace(/\b\w/g, c => c.toUpperCase());
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;

    // Set weather icon
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const iconImg = document.getElementById('weather-icon');
    iconImg.src = iconUrl;
    iconImg.style.display = 'inline-block';

  } catch (error) {
    console.error('Error fetching weather:', error);
    document.getElementById('weather').textContent = 'Unable to load weather data';
  }
}

// Jalankan fetch cuaca saat halaman siap
document.addEventListener('DOMContentLoaded', fetchWeather);