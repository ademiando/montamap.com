// Elements
const menuToggle = document.getElementById('hamburger');
const dropdownMenu = document.getElementById('menu');
const loginButton = document.getElementById('loginButton');
const loginDropdown = document.getElementById('loginDropdown');
const languageSelect = document.getElementById('language');
const lightBtn = document.getElementById('lightBtn');
const darkBtn = document.getElementById('darkBtn');
const title = document.getElementById('title');
const description = document.getElementById('description');

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

// Language Translations
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

// Update Language Content
if (languageSelect && title && description) {
  languageSelect.addEventListener('change', () => {
    const selectedLanguage = languageSelect.value;
    title.textContent = translations[selectedLanguage]?.title || "Default Title";
    description.textContent = translations[selectedLanguage]?.description || "Default Description";
  });
}

// Function to Switch to Light Theme
if (lightBtn) {
  lightBtn.addEventListener('click', () => {
    document.body.classList.remove('dark');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  });
}

// Function to Switch to Dark Theme
if (darkBtn) {
  darkBtn.addEventListener('click', () => {
    document.body.classList.add('dark');
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
  });
}

// Tab Navigation
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

// Default Tab Activation
document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.tab.active');
  if (defaultTab) {
    defaultTab.click();
  }
});

// Mountain Data (Updated with nearest city)
const mountainData = [
  {
    name: "Everest",
    city: "Namche Bazaar, Nepal",
    lat: 27.9881,
    lon: 86.9250,
    status: "Closed",
    elevation: "8,848 m",
    weather: "-35°C Windy",
    icon: "01d", // OpenWeatherMap Icon ID
    image: "mountain-image/everest.jpg",
    link: "everest"
  },
  {
    name: "K2",
    city: "Skardu, Pakistan",
    lat: 35.3,
    lon: 75.6,
    status: "Closed",
    elevation: "8,611 m",
    weather: "-40°C Snow",
    icon: "13d", // Snowy Icon
    image: "mountain-image/k2.jpg",
    link: "k2"
  },
  {
    name: "Kangchenjunga",
    city: "Taplejung, Nepal",
    lat: 27.7000,
    lon: 88.2000,
    status: "Closed",
    elevation: "8,586 m",
    weather: "-30°C Cloudy",
    icon: "04d", // Cloudy Icon
    image: "mountain-image/kangchenjunga.jpg",
    link: "kangchenjunga"
  },
  {
    name: "Lhotse",
    city: "Namche Bazaar, Nepal",
    lat: 27.9617,
    lon: 86.9333,
    status: "Open",
    elevation: "8,516 m",
    weather: "-28°C Sunny",
    icon: "01d", // Clear Icon
    image: "mountain-image/lhotse.jpg",
    link: "lhotse"
  },
  {
    name: "Makalu",
    city: "Sankhuwasabha, Nepal",
    lat: 27.8881,
    lon: 87.0773,
    status: "Closed",
    elevation: "8,485 m",
    weather: "-31°C Foggy",
    icon: "50d", // Mist Icon
    image: "mountain-image/makalu.jpg",
    link: "makalu"
  },
  {
    name: "Cho Oyu",
    city: "Tingri, Tibet",
    lat: 28.0944,
    lon: 86.6600,
    status: "Open",
    elevation: "8,188 m",
    weather: "-25°C Clear",
    icon: "01d", // Clear Icon
    image: "mountain-image/cho-oyu.jpg",
    link: "cho-oyu"
  },
  {
    name: "Dhaulagiri I",
    city: "Pokhara, Nepal",
    lat: 28.6961,
    lon: 83.4875,
    status: "Open",
    elevation: "8,167 m",
    weather: "-23°C Sunny",
    icon: "01d", // Clear Icon
    image: "mountain-image/dhaulagiri.jpg",
    link: "dhaulagiri"
  },
  {
    name: "Manaslu",
    city: "Gorkha, Nepal",
    lat: 28.5494,
    lon: 84.5611,
    status: "Closed",
    elevation: "8,163 m",
    weather: "-26°C Snow",
    icon: "13d", // Snow Icon
    image: "mountain-image/manaslu.jpg",
    link: "manaslu"
  },
  {
    name: "Annapurna I",
    city: "Pokhara, Nepal",
    lat: 28.5950,
    lon: 83.8203,
    status: "Closed",
    elevation: "8,091 m",
    weather: "-29°C Windy",
    icon: "02d", // Partly Cloudy Icon
    image: "mountain-image/annapurna.jpg",
    link: "annapurna"
  }
];

// Fetch weather data from OpenWeather API
const apiKey = '3187c49861f858e524980ea8dd0d43c6';

async function fetchWeather(lat, lon) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    
    if (data.main) {
      return {
        temperature: `${Math.round(data.main.temp)}°C`,
        weather: data.weather[0].main || 'N/A',
        icon: data.weather[0].icon // Get weather icon code
      };
    } else {
      return { temperature: 'N/A', weather: 'N/A', icon: '' };
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    return { temperature: 'N/A', weather: 'N/A', icon: '' };
  }
}

let loaded = 0;
const batch = 4;

async function renderMountains() {
  const container = document.getElementById("mountainContainer");
  const slice = mountainData.slice(loaded, loaded + batch);

  for (let m of slice) {
    const weather = await fetchWeather(m.lat, m.lon);
    
    const card = document.createElement("div");
    card.className = "mountain-card";
    card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
    card.innerHTML = `
      <img src="${m.image}" alt="${m.name}" class="mountain-image" />
      <div class="gradient-overlay"></div>
      <div class="mountain-info">
        <div class="mountain-name">${m.name}</div>
        <div class="mountain-details">
          ${m.city}<br />
          <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">Status: ${m.status}</span><br />
          Elevation: ${m.elevation}<br />



         

  



<img src="https://openweathermap.org/img/wn/${weather.icon}" alt="${weather.weather}" style="vertical-align: middle;" />
${weather.temperature}<br />
${weather.weather}




        </div>
      </div>
    `;
    container.appendChild(card);
  }

  loaded += batch;

  if (loaded >= mountainData.length) {
    document.getElementById("loadMoreBtn").style.display = "none";
  }
}

document.getElementById("loadMoreBtn").addEventListener("click", renderMountains);

// Initial load
renderMountains();