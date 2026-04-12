/* ============================================ */
/* ========== SPLASH SCREEN LOGIC ========== */
/* ============================================ */

let splashIntervalId = null;

function initSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const splashSubtitle = document.querySelector('.splash-subtitle');
    
    if (!splashScreen) return;
    
    // Frases especiais que disparam animação blink vermelha
    const SPECIAL_PHRASES = ['NÃO PISQUE!', 'EXTERMINAR!', 'Allons-y!'];
    
    // Lista de frases (incluindo as especiais)
    const frases = [
        "A TARDIS é tecnicamente viva e tem consciência própria.",
        "Não pisque! Os Anjos Lamentáveis se movem quando você fecha os olhos.",
        "A palavra 'TARDIS' significa Time And Relative Dimension In Space.",
        "NÃO PISQUE!",
        "EXTERMINAR!",
        "Allons-y!",
        "[Easter Egg] Este projeto foi criado por uma única motivação: uma pessoa especial através do tempo e espaço.",
        "[Easter Egg] A criadora acredita que todo filme merece um site incrível. O DoctorFlix é a prova disso."
    ];
    
    // Função para embaralhar array (Fisher-Yates Shuffle)
    const shuffle = (arr) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };
    
    // Embaralhar frases no início
    const frasesEmbaralhadas = shuffle(frases);
    let indiceAtual = 0;
    
    // Exibir primeira frase imediatamente
    if (splashSubtitle && frasesEmbaralhadas.length > 0) {
        const frase = frasesEmbaralhadas[indiceAtual];
        splashSubtitle.textContent = frase;
        splashSubtitle.style.opacity = '1';
        
        // Adicionar classe especial se for uma frase especial
        if (SPECIAL_PHRASES.includes(frase)) {
            splashSubtitle.classList.add('special-phrase');
        } else {
            splashSubtitle.classList.remove('special-phrase');
        }
        
        indiceAtual++;
    }
    
    // Mudar frases sequencialmente a cada 4 segundos (2.5s + 1.5s extras)
    splashIntervalId = setInterval(() => {
        if (splashSubtitle && indiceAtual < frasesEmbaralhadas.length) {
            splashSubtitle.style.opacity = '0';
            splashSubtitle.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                const frase = frasesEmbaralhadas[indiceAtual];
                splashSubtitle.textContent = frase;
                splashSubtitle.style.opacity = '1';
                
                // Adicionar classe especial se for uma frase especial
                if (SPECIAL_PHRASES.includes(frase)) {
                    splashSubtitle.classList.add('special-phrase');
                } else {
                    splashSubtitle.classList.remove('special-phrase');
                }
                
                indiceAtual++;
            }, 300);
        }
    }, 4000);  // Intervalo de 4 segundos (2.5s + 1.5s)
    
    // Aguarda 9 segundos (duração total aumentada), depois faz fade-out
    setTimeout(() => {
        // Limpar o intervalo das frases
        if (splashIntervalId !== null) {
            clearInterval(splashIntervalId);
            splashIntervalId = null;
        }
        
        splashScreen.classList.add('fade-out');
        
        // Remove do DOM após a animação (0.8s de fade-out)
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 800);
    }, 9000);  // Total de 9 segundos (aumentado de 7s)
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

/* ============================================ */
/* ========== CONFIRMATION MODAL LOGIC ========== */
/* ============================================ */

// Função global para mostrar modal de confirmação
window.showConfirmation = function(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('confirmation-modal');
    const titleEl = document.getElementById('confirmation-title');
    const messageEl = document.getElementById('confirmation-message');
    const confirmBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');
    
    if (!modal) return;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Limpar listeners anteriores
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
    
    // Adicionar novos listeners
    confirmBtn.onclick = () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm();
    };
    
    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
        if (onCancel) onCancel();
    };
    
    // Mostrar modal
    modal.classList.remove('hidden');
};

/* ============================================ */
/* ========== NO PROFILES MODAL LOGIC ========== */
/* ============================================ */

// Função global para mostrar modal "Nenhum perfil criado"
window.showNoProfilesModal = function() {
    const modal = document.getElementById('no-profiles-modal');
    const btnUnderstood = document.getElementById('no-profiles-btn');
    
    if (!modal) return;
    
    // Limpar listeners anteriores
    btnUnderstood.onclick = null;
    
    // Adicionar novo listener
    btnUnderstood.onclick = () => {
        modal.classList.add('hidden');
    };
    
    // Mostrar modal
    modal.classList.remove('hidden');
};

/* ============================================ */
/* ========== EASTER EGG - CONFETTI ========== */
/* ============================================ */

function lançarConfetes() {
    // Cores do DoctorFlix: Azul TARDIS (#0D47A1) e Roxo (#8A2BE2)
    const cores = ['#0D47A1', '#8A2BE2', '#1976D2', '#A855F7'];
    
    // Configurações do confete
    const configuracoes = {
        particleCount: 100,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        colors: cores,
        ticks: 300,
        gravity: 0.8,
        decay: 0.95,
        startVelocity: 45,
        scalar: 1.2
    };
    
    // Lançar confetes múltiplas vezes para efeito de chuva
    confetti(configuracoes);
    
    // Executar mais 2 explosões em tempo intervals para efeito prolongado
    setTimeout(() => {
        confetti({
            ...configuracoes,
            particleCount: 80,
            startVelocity: 30
        });
    }, 200);
    
    setTimeout(() => {
        confetti({
            ...configuracoes,
            particleCount: 60,
            startVelocity: 20
        });
    }, 400);
}

// Inicializar easter egg ao carregar página
document.addEventListener('DOMContentLoaded', () => {
    const logoElement = document.querySelector('.logo-text');
    
    if (logoElement) {
        logoElement.style.cursor = 'pointer';
        logoElement.addEventListener('click', (e) => {
            e.preventDefault();
            lançarConfetes();
        });
        
        // Adicionar dica visual (optional)
        logoElement.title = 'Clique para ativar confetes! 🎉';
    }
}, { once: false });

