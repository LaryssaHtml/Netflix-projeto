import { getYouTubeId, getRandomMatchScore, getRandomDuration, getRandomAgeBadge } from '../utils.js';

export function createCard(item) {
    // 1. Buscamos o estado atual do perfil e das listas
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    const listaIds = JSON.parse(localStorage.getItem(`lista_${nomePerfil}`)) || [];
    const likesIds = JSON.parse(localStorage.getItem(`likes_${nomePerfil}`)) || [];
    
    // 2. Verificamos se ESTE item específico está na lista ou tem like
    const estaNaLista = listaIds.includes(item.id);
    const deuLike = likesIds.includes(item.id);

    const card = document.createElement('div');
    card.className = 'movie-card';
    if (item.progress) {
        card.classList.add('has-progress');
    }

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = `Movie cover`;

    const iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media";

    const videoId = getYouTubeId(item.youtube);

    card.appendChild(iframe);
    card.appendChild(img);

    const ageBadge = getRandomAgeBadge();

    const details = document.createElement('div');
    details.className = 'card-details';
    
    // 3. Aplicamos as cores e ícones dinamicamente com base nas constantes acima
    details.innerHTML = `
        <div class="details-buttons">
            <div class="left-buttons">
                <button class="btn-icon btn-play-icon">
                    <i class="fas fa-play" style="margin-left:2px;"></i>
                </button>
                
                <button class="btn-icon ${estaNaLista ? 'active' : ''}" onclick="toggleMinhaLista('${item.id}', this)">
                    <i class="fas ${estaNaLista ? 'fa-check' : 'fa-plus'}"></i>
                </button>

                <button class="btn-icon" style="color: ${deuLike ? '#46d369' : 'white'}" onclick="toggleLike('${item.id}', this)">
                    <i class="fas fa-thumbs-up"></i>
                </button>
            </div>
            <div class="right-buttons">
                <button class="btn-icon"><i class="fas fa-chevron-down"></i></button>
            </div>
        </div>
        <div class="details-info">
            <span class="match-score">${getRandomMatchScore()}% relevante</span>
            <span class="age-badge ${ageBadge.class}">${ageBadge.text}</span>
            <span class="duration">${getRandomDuration(item.progress)}</span>
            <span class="resolution">HD</span>
        </div>
        <div class="details-tags">
            <span>Empolgante</span>
            <span>Aventura</span>
            <span>Ficção</span>
            <span>Família</span>
        </div>
    `;
    card.appendChild(details);

    if (item.progress) {
        const pbContainer = document.createElement('div');
        pbContainer.className = 'progress-bar-container';
        const pbValue = document.createElement('div');
        pbValue.className = 'progress-value';
        pbValue.style.width = `${item.progress}%`;
        pbContainer.appendChild(pbValue);
        card.appendChild(pbContainer);
    }

    let playTimeout;
    card.addEventListener('mouseenter', () => {
        const rect = card.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        if (rect.left < 100) {
            card.classList.add('origin-left');
        } else if (rect.right > windowWidth - 100) {
            card.classList.add('origin-right');
        }

        playTimeout = setTimeout(() => {
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1&loop=1&playlist=${videoId}`;
            iframe.classList.add('playing');
            img.classList.add('playing-video');
        }, 600);
    });

    card.addEventListener('mouseleave', () => {
        clearTimeout(playTimeout);
        iframe.classList.remove('playing');
        img.classList.remove('playing-video');
        iframe.src = "";
        card.classList.remove('origin-left');
        card.classList.remove('origin-right');
    });

    return card;
}