document.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('lang') || 'en';

  fetch(`/lang/${lang}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(translations => {
      // Loop semua key dari JSON
      Object.keys(translations).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
          el.textContent = translations[key];
        }
      });
    })
    .catch(err => {
      console.error('Load translation failed:', err);
    });
});