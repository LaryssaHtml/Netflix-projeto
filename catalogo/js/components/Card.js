import { getYouTubeId, getRandomMatchScore, getRandomDuration, getRandomAgeBadge } from '../utils.js';

export function createCard(item) {
    const nomePerfil = localStorage.getItem('perfilAtivoNome') || 'default';
    const listaIds = JSON.parse(localStorage.getItem(`lista_${nomePerfil}`)) || [];
    const likesIds = JSON.parse(localStorage.getItem(`likes_${nomePerfil}`)) || [];
    
    // CHAVE ÚNICA POR PERFIL: Dinâmica para qualquer nome de usuário
    const chaveProgresso = `progress_${nomePerfil}_${item.id}`;
    
    const savedProgress = item.id ? localStorage.getItem(chaveProgresso) : null;
    let progressEstatico = savedProgress !== null ? parseInt(savedProgress) : (item.progress || 0); 
    
    const estaNaLista = listaIds.includes(item.id);
    const deuLike = likesIds.includes(item.id);

    const card = document.createElement('div');
    card.className = 'movie-card';

    // --- ESTRUTURA DA BARRA DE PROGRESSO ---
    const pbContainer = document.createElement('div');
    pbContainer.className = 'progress-bar-container';
    pbContainer.style.display = (progressEstatico > 0 && progressEstatico < 100) ? 'block' : 'none';
    
    const pbValue = document.createElement('div');
    pbValue.className = 'progress-value-neon';
    pbValue.style.width = `${progressEstatico}%`;
    
    pbContainer.appendChild(pbValue);

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.title || "Movie cover";

    const iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media";

    const videoId = getYouTubeId(item.youtube || item.video || item.trailer);

    card.appendChild(iframe);
    card.appendChild(img);
    card.appendChild(pbContainer);

    const ageBadge = getRandomAgeBadge();
    const details = document.createElement('div');
    details.className = 'card-details';
    
    details.innerHTML = `
        <div class="details-buttons">
            <div class="left-buttons">
                <button class="btn-icon btn-play-icon">
                    <i class="fas fa-play" style="margin-left:2px;"></i>
                </button>
                <button class="btn-icon ${estaNaLista ? 'active' : ''}" onclick="toggleMinhaLista('${item.id}', this)">
                    <i class="fas ${estaNaLista ? 'fa-check' : 'fa-plus'}"></i>
                </button>
                <button class="btn-icon btn-like-main" style="color: ${deuLike ? '#a855f7' : 'white'}" onclick="toggleLike('${item.id}', this)">
                    <i class="fas fa-thumbs-up"></i>
                </button>
            </div>
            <div class="right-buttons">
                <button class="btn-icon btn-info-icon">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
        </div>
        <div class="details-info">
            <span class="match-score">${getRandomMatchScore()}% relevante</span>
            <span class="age-badge ${ageBadge.class}">${ageBadge.text}</span>
            <span class="duration">${getRandomDuration(progressEstatico > 0)}</span>
            <span class="resolution">HD</span>
        </div>
        <div class="details-tags">
            <span>${item.genero || 'Destaque'}</span>
            <span>Empolgante</span>
        </div>
    `;
    card.appendChild(details);

    const btnPlayCard = details.querySelector('.btn-play-icon');
    const btnInfoCard = details.querySelector('.btn-info-icon');
    
    if (btnPlayCard) btnPlayCard.onclick = () => window.abrirModal(item, 'assistir');
    if (btnInfoCard) btnInfoCard.onclick = () => window.abrirModal(item, 'info');

    // --- LÓGICA DE PROGRESSO AO VIVO (PREVIEW) ---
    let playTimeout;
    let liveProgressInterval;
    let tempProgress = 0; 

    card.addEventListener('mouseenter', () => {
        const rect = card.getBoundingClientRect();
        if (rect.left < 100) card.classList.add('origin-left');
        else if (rect.right > window.innerWidth - 100) card.classList.add('origin-right');

        // Sincronização: Zera a barra visual para começar junto com o vídeo do YT
        tempProgress = 0;
        pbValue.style.width = '0%';
        pbContainer.style.display = 'block';

        playTimeout = setTimeout(() => {
            if (videoId) {
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}&mute=0`;
                iframe.classList.add('playing');
                img.classList.add('playing-video');

                liveProgressInterval = setInterval(() => {
                    if (tempProgress >= 100) {
                        tempProgress = 0; // Reset fiel ao loop do vídeo
                    } else {
                        tempProgress += 1; 
                    }

                    pbValue.style.width = `${tempProgress}%`;
                    localStorage.setItem(chaveProgresso, tempProgress);
                }, 1000); 
            }
        }, 600);
    });

    card.addEventListener('mouseleave', () => {
        clearTimeout(playTimeout);
        clearInterval(liveProgressInterval); 
        iframe.classList.remove('playing');
        img.classList.remove('playing-video');
        iframe.src = "";
        card.classList.remove('origin-left');
        card.classList.remove('origin-right');

        // Restaura a exibição baseada no último progresso salvo para este perfil
        const finalProgress = localStorage.getItem(chaveProgresso) || progressEstatico;
        pbValue.style.width = `${finalProgress}%`;
        if (parseInt(finalProgress) === 0) pbContainer.style.display = 'none';
    });

    return card;
}