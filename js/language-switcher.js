// File: /js/language-switcher.js
let translations = null;

// 1) Load JSON
fetch('/lang/translations.json')
  .then(res => res.json())
  .then(data => {
    translations = data;
    initLanguage();
  })
  .catch(err => console.error('Load translation failed:', err));

// 2) Apply translations by matching original English text
function applyLanguage(lang) {
  if (!translations || !translations[lang]) return;
  const dict = translations[lang];
  document.querySelectorAll('body *').forEach(el => {
    // only text nodes
    if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
      const text = el.textContent.trim();
      if (dict[text]) el.textContent = dict[text];
    }
    // inputs placeholders
    if (el.placeholder && dict[el.placeholder]) {
      el.placeholder = dict[el.placeholder];
    }
  });
}

// 3) Initialize language selector
function initLanguage() {
  const select = document.getElementById('language');
  const saved = localStorage.getItem('montamap_lang') || select.value;
  select.value = saved;
  applyLanguage(saved);

  select.addEventListener('change', () => {
    const lang = select.value;
    localStorage.setItem('montamap_lang', lang);
    applyLanguage(lang);
  });
}

// 4) Fallback: if selector not found, default en
function init() {
  document.addEventListener('DOMContentLoaded', () => {
    if (translations) initLanguage();
  });
}
init();
