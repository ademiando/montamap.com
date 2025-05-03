// Elements
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
const languageSelect = document.getElementById('language');
const themeSwitch = document.getElementById('themeSwitch');
const title = document.getElementById('title');
const description = document.getElementById('description');

// Toggle Dropdown Menu
menuToggle.addEventListener('click', () => {
  dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

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
languageSelect.addEventListener('change', () => {
  const selectedLanguage = languageSelect.value;
  title.textContent = translations[selectedLanguage].title;
  description.textContent = translations[selectedLanguage].description;
});

// Toggle Theme (Light/Dark)
themeSwitch.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark');
  themeSwitch.textContent = isDarkMode ? "Theme: Dark Mode" : "Theme: Light Mode";
});
