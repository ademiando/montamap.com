// Elements
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
const languageSwitch = document.getElementById('languageSwitch');
const themeSwitch = document.getElementById('themeSwitch');

// Toggle Dropdown Menu
menuToggle.addEventListener('click', () => {
  dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Switch Language (English and Indonesian for demonstration)
let currentLanguage = 'en';
languageSwitch.addEventListener('click', () => {
  if (currentLanguage === 'en') {
    document.body.innerHTML = document.body.innerHTML.replace(/Welcome to Xcapeak/, 'Selamat Datang di Xcapeak')
                                                      .replace(/This is your mountain tracker and ticket website./, 'Ini adalah situs pelacak gunung dan tiket Anda.');
    currentLanguage = 'id';
  } else {
    document.body.innerHTML = document.body.innerHTML.replace(/Selamat Datang di Xcapeak/, 'Welcome to Xcapeak')
                                                      .replace(/Ini adalah situs pelacak gunung dan tiket Anda./, 'This is your mountain tracker and ticket website.');
    currentLanguage = 'en';
  }
});

// Toggle Theme (Dark/Light)
themeSwitch.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
