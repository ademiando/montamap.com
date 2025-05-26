// File: /js/language-switcher.js
let translations = null;

fetch('/lang/translations.json')
  .then(res => {
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    return res.json();
  })
  .then(data => {
    translations = data;
    initLanguage();
  })
  .catch(err => console.error('Load translation failed:', err));

function applyLanguage(lang) {
  if (!translations || !translations[lang]) {
    console.warn('Language not found:', lang);
    return;
  }

  const dict = translations[lang];

  const allowedTags = ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BUTTON', 'LABEL', 'A', 'LI', 'DIV', 'OPTION'];

  document.querySelectorAll('body *').forEach(el => {
    if (!allowedTags.includes(el.tagName)) return;

    // Replace text content
    if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
      const original = el.textContent.trim();
      if (dict[original]) el.textContent = dict[original];
    }

    // Replace placeholder (for inputs)
    if (el.placeholder && dict[el.placeholder]) {
      el.placeholder = dict[el.placeholder];
    }
  });
}

function initLanguage() {
  const select = document.getElementById('language');
  const savedLang = localStorage.getItem('montamap_lang') || select?.value || 'en';

  if (select) select.value = savedLang;
  applyLanguage(savedLang);

  select?.addEventListener('change', () => {
    const lang = select.value;
    localStorage.setItem('montamap_lang', lang);
    applyLanguage(lang);
  });
}