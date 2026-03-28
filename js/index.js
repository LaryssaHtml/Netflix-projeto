const body = document.body;
const toggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
    body.classList.remove('light', 'dark');
    body.classList.add(theme);
    toggle.textContent = theme === 'dark' ? '🌞 Modo claro' : '🌗 Modo escuro';
    localStorage.setItem('theme', theme);
}

toggle.addEventListener('click', () => {
    const current = body.classList.contains('light') ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
});

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);


