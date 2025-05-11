// API Key untuk OpenWeatherMap
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

// Elemen DOM
const menuToggle = document.getElementById('hamburger');
const dropdownMenu = document.getElementById('menu');
const loginButton = document.getElementById('loginButton');
const loginDropdown = document.getElementById('loginDropdown');
const languageSelect = document.getElementById('language');
const lightBtn = document.getElementById('lightBtn');
const darkBtn = document.getElementById('darkBtn');
const title = document.getElementById('title');
const description = document.getElementById('description');
const mountainContainer = document.getElementById("mountainContainer");
const loadMoreBtn = document.getElementById("loadMoreBtn");

// Toggle Dropdown Menu
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('menu-visible');
  });

  document.addEventListener('click', (event) => {
    if (!menuToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove('menu-visible');
    }
  });
}

// Toggle Login Dropdown
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () => {
    loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (event) => {
    if (!loginButton.contains(event.target) && !loginDropdown.contains(event.target)) {
      loginDropdown.style.display = 'none';
    }
  });
}

// Terjemahan Bahasa
const translations = {
  en: {
    title: "Welcome to Xcapeak",
    description: "This is your mountain tracker and ticket website."
  },
  id: {
    title: "Selamat Datang di Xcapeak",
    description: "Ini adalah situs pelacak gunung dan tiket Anda."
  },
  zh: {
    title: "欢迎来到 Xcapeak",
    description: "这是您的山地追踪和票务网站。"
  },
  hi: {
    title: "Xcapeak में आपका स्वागत है",
    description: "यह आपका पर्वत ट्रैकर और टिकट वेबसाइट है।"
  },
  ru: {
    title: "Добро пожаловать в Xcapeak",
    description: "Это ваш сайт для отслеживания гор и билетов."
  }
};

// Update Konten Bahasa
if (languageSelect && title && description) {
  languageSelect.addEventListener('change', () => {
    const selectedLanguage = languageSelect.value;
    title.textContent = translations[selectedLanguage]?.title || "Default Title";
    description.textContent = translations[selectedLanguage]?.description || "Default Description";
  });
}

// Fungsi untuk Mengubah ke Tema Terang
if (lightBtn) {
  lightBtn.addEventListener('click', () => {
    document.body.classList.remove('dark');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  });
}

// Fungsi untuk Mengubah ke Tema Gelap
if (darkBtn) {
  darkBtn.addEventListener('click', () => {
    document.body.classList.add('dark');
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
  });
}

// Navigasi Tab
function openTab(event, tabName) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach((content) => {
    content.style.display = 'none';
    content.classList.remove('active');
  });

  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.classList.remove('active');
  });

  const selectedTabContent = document.getElementById(tabName);
  if (selectedTabContent) {
    selectedTabContent.style.display = 'block';
    selectedTabContent.classList.add('active');
  }

  if (event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
}

// Aktivasi Tab Default
document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.tab.active');
  if (defaultTab) {
    defaultTab.click();
  }
});

// Data Gunung
const mountainData = [
  {
    name: "Everest",
    region: "Nepal / Tibet",
    status: "Closed",
    elevation: "8,848 m",
    image: "mountain-image/everest.jpg",
    link: "everest"
  },
  {
    name: "K2",
    region: "Pakistan / China",
    status: "Closed",
    elevation: "8,611 m",
    image: "mountain-image/k2.jpg",
    link: "k2"
  },
  {
    name: "Kangchenjunga",
    region: "Nepal / India",
    status: "Closed",
    elevation: "8,586 m",
    image: "mountain-image/kangchenjunga.jpg",
    link: "kangchenjunga"
  },
  {
    name: "Lhotse",
    region: "Nepal / Tibet",
    status: "Open",
    elevation: "8,516 m",
    image: "mountain-image/lhotse.jpg",
    link: "lhotse"
  },
  {
    name: "Makalu",
    region: "Nepal / Tibet",
    status: "Closed",
    elevation: "8,485 m",
    image: "mountain-image/makalu.jpg",
    link: "makalu"
  },
  {
    name: "Cho Oyu",
    region: "Nepal / Tibet",
    status: "Open",
    elevation: "8,188 m",
    image: "mountain-image/cho-oyu.jpg",
    link: "cho-oyu"
  },
  {
    name: "Dhaulagiri I",
    region: "Nepal",
    status: "Open",
    elevation: "8,167 m",
    image: "mountain-image/dhaulagiri.jpg",
    link: "dhaulagiri"
  },
  {
    name: "Manaslu",
    region: "Nepal",
    status: "Closed",
    elevation: "8,163 m",
    image: "mountain-image/manaslu.jpg",
    link: "manaslu"
  },
  {
    name: "Nanga Parbat",
    region: "Pakistan",
    status: "Open",
    elevation: "8,126 m",
    image: "mountain-image/nanga-parbat.jpg",
    link: "nanga-parbat"
  },
  {
    name: "Annapurna I",
    region: "Nepal",
    status: "Closed",
    elevation: "8,091 m",
    image: "mountain-image/annapurna.jpg",
    link: "annapurna"
  }
];

let loaded = 0;
const batch = 4;

// Fungsi untuk Mengambil Data Cuaca
async function fetchWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    if (data.cod === 200) {
      return {
        temp: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      };
    } else {
      return {
        temp: 'N/A',
        description: 'Data tidak tersedia',
        icon: null
      };
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temp: 'N/A',
      description: 'Data tidak tersedia',
      icon: null
    };
  }
}

// Fungsi untuk Merender Kartu Gunung
async function renderMountains() {
  const slice = mountainData.slice(loaded, loaded + batch);

  for (const m of slice) {
    const weather = await fetchWeather(m.name);

    const card = document.createElement("div");
    card.className = "mountain-card";
    card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
    card.innerHTML = `
      <img src="${m.image}" alt="${m.name}" class="mountain-image" />
      <div class="gradient-overlay"></div>
      <div class="mountain-info">
        <div class="mountain-name">${m.name}</div>
        <div class="mountain-details">
          ${m.region}<br />
          <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">Status: ${m.status}</span><br />
          Elevation: ${m.elevation}<br />
          Weather: ${weather.temp}°C, ${weather.description}
        </div>
        ${weather.icon ? `<img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}" class="weather-icon" />` : ''}
      </div>
    `;
    mountainContainer.appendChild(card);
  }

  loaded += batch;

  if (loaded >= mountainData.length) {
    loadMoreBtn.style.display = "none";
  }
}

// Event Listener untuk Tombol "Load More"
loadMoreBtn.addEventListener("click", renderMountains);

// Load Awal
renderMountains();