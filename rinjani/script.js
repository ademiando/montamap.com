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