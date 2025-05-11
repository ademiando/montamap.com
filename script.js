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

if (languageSelect && title && description) {
  languageSelect.addEventListener('change', () => {
    const selectedLanguage = languageSelect.value;
    title.textContent = translations[selectedLanguage]?.title || "Default Title";
    description.textContent = translations[selectedLanguage]?.description || "Default Description";
  });
}

// Theme Toggle
if (lightBtn) {
  lightBtn.addEventListener('click', () => {
    document.body.classList.remove('dark');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  });
}
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

document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.tab.active');
  if (defaultTab) {
    defaultTab.click();
  }
});

// Mountain Data
const mountainData = [
  {
    name: "Everest",
    region: "Nepal / Tibet",
    status: "Open",
    elevation: "8,848 m",
    weather: "-35°C sunny🌤",
    image: "mountain-image/everest.jpg",
    link: "everest"
  },
  {
    name: "K2",
    region: "Pakistan / China",
    status: "Closed",
    elevation: "8,611 m",
    weather: "-40°C Snow❄️",
    image: "mountain-image/k2.jpg",
    link: "k2"
  },
  {
    name: "Kangchenjunga",
    region: "Nepal / India",
    status: "Open",
    elevation: "8,586 m",
    weather: "-30°C Cloudy🌥",
    image: "mountain-image/kangchenjunga.jpg",
    link: "kangchenjunga"
  },
  {
    name: "Lhotse",
    region: "Nepal / Tibet",
    status: "Open",
    elevation: "8,516 m",
    weather: "-28°C Sunny☀️",
    image: "mountain-image/lhotse.jpg",
    link: "lhotse"
  },
  {
    name: "Rinjani",
    region: "Lombok, Indonesia",
    status: "Open",
    elevation: "3,726 meters",
    weather: "8°C Cloudy 🌥",
    image: "mountain-image/rinjani.jpg",
    link: "rinjani",
    lat: -8.4115,
    lon: 116.4572
  },
  {
    name: "Carstensz Pyramid",
    region: "Papua, Indonesia",
    status: "Open",
    elevation: "4,884 meters",
    weather: "-2°C Rainy 🌨",
    image: "mountain-image/carstensz.jpg",
    link: "carstensz"
  },
  {
    name: "Raung",
    region: "East Java, Indonesia",
    status: "Open",
    elevation: "3,344 meters",
    weather: "10°C Windy 🌥",
    image: "mountain-image/raung.jpg",
    link: "raung"
  },
  {
    name: "Agung",
    region: "Bali, Indonesia",
    status: "Closed",
    elevation: "3,031 meters",
    weather: "12°C Sunny ☀️",
    image: "mountain-image/agung.jpg",
    link: "agung"
  },
  {
    name: "Batur",
    region: "Bali, Indonesia",
    status: "Open",
    elevation: "1,717 meters",
    weather: "14°C Partly Cloudy ⛅️",
    image: "mountain-image/batur.jpg",
    link: "batur"
  },
  {
    name: "Semeru",
    region: "East Java, Indonesia",
    status: "Open",
    elevation: "3,676 meters",
    weather: "7°C Sunny ☀️",
    image: "mountain-image/semeru.jpg",
    link: "semeru"
  },
  {
    name: "Slamet",
    region: "Central Java, Indonesia",
    status: "Open",
    elevation: "3,428 meters",
    weather: "9°C Windy🌥",
    image: "mountain-image/slamet.jpg",
    link: "slamet"
  },
  {
    name: "Sindoro",
    region: "Central Java, Indonesia",
    status: "Open",
    elevation: "3,153 meters",
    weather: "11°C Clear 🌤",
    image: "mountain-image/sindoro.jpg",
    link: "sindoro"
  },
  {
    name: "Sumbing",
    region: "Central Java, Indonesia",
    status: "Open",
    elevation: "3,371 meters",
    weather: "10°C Partly Cloudy ⛅️",
    image: "mountain-image/sumbing.jpg",
    link: "sumbing"
  },
  {
    name: "Kerinci",
    region: "Sumatra, Indonesia",
    status: "Open",
    elevation: "3,805 meters",
    weather: "6°C Cloudy 🌥",
    image: "mountain-image/kerinci.jpg",
    link: "kerinci"
  }
];

let loaded = 0;
const batch = 5;

function renderMountains() {
  const container = document.getElementById("mountainContainer");
  const slice = mountainData.slice(loaded, loaded + batch);

  slice.forEach((m) => {
    const card = document.createElement("div");
    card.className = "mountain-card";
    card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
    card.innerHTML = `
      <img src="${m.image}" alt="${m.name}" class="mountain-image" />
      <div class="gradient-overlay"></div>
      <div class="mountain-info">
        <h3>${m.name}</h3>
        <p>${m.region}</p>
        <p><strong>${m.status}</strong> | ${m.elevation} | ${m.weather}</p>
      </div>
    `;
    container.appendChild(card);
  });

  loaded += batch;
  if (loaded >= mountainData.length) {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) {
      loadMoreBtn.style.display = "none";
    }
  }
}

// Event for Load More button
document.addEventListener('DOMContentLoaded', () => {
  renderMountains();
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", renderMountains);
  }
});