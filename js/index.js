/* ============================================ */
/* ========== SPLASH SCREEN LOGIC ========== */
/* ============================================ */

function initSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    
    if (!splashScreen) return;
    
    // Aguarda 3 segundos, depois faz fade-out
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        
        // Remove do DOM após a animação (0.8s de fade-out)
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 800);
    }, 3000);
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', initSplashScreen);

/* ============================================ */
/* ========== THEME TOGGLE LOGIC ========== */
/* ============================================ */

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


