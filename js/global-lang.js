document.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('lang') || 'en';

  fetch('/lang/about-multilanguage.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const translations = data[lang]; // Ambil bagian sesuai bahasa

      Object.keys(translations).forEach(key => {
        const el = document.querySelector(`[data-i18n="${key}"]`);
        if (el) {
          const value = translations[key];
          if (Array.isArray(value)) {
            el.innerHTML = value.join('<br>'); // Boleh juga pakai <p> per elemen
          } else {
            el.innerHTML = value;
          }
        }
      });
    })
    .catch(err => {
      console.error('Load translation failed:', err);
    });
});