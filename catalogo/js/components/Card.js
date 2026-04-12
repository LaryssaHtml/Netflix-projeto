import { getYouTubeId, getRandomMatchScore, getRandomDuration, getRandomAgeBadge } from '../utils.js';

export function createCard(item) {
    const nomePerfil = localStorage.getItem('perfilAtivoNome') || 'default';
    const listaIds = JSON.parse(localStorage.getItem(`lista_${nomePerfil}`)) || [];
    const likesIds = JSON.parse(localStorage.getItem(`likes_${nomePerfil}`)) || [];
    
    const chaveProgresso = `progress_${nomePerfil}_${item.id}`;
    const savedProgress = item.id ? localStorage.getItem(chaveProgresso) : null;
    let progressEstatico = savedProgress !== null ? parseInt(savedProgress) : (item.progress || 0); 
    
    const estaNaLista = listaIds.includes(item.id);
    const deuLike = likesIds.includes(item.id);
    
    // Detectar se é DVD
    const isDVD = item.id && item.id.toLowerCase().startsWith('dvd-');

    const card = document.createElement('div');
    card.className = isDVD ? 'movie-card dvd-card' : 'movie-card';

    // Clique para Mobile (comportamento diferente para DVDs)
    card.onclick = (e) => {
        if (isDVD) {
            // DVDs abrem modal em qualquer tamanho de tela (PC e Mobile)
            window.abrirDVDImagem(item);
        } else {
            // Outros conteúdos abrem modal apenas no mobile
            if (window.innerWidth <= 768) {
                window.abrirModal(item, 'info');
            }
        }
    };

    const pbContainer = document.createElement('div');
    pbContainer.className = 'progress-bar-container';
    pbContainer.style.display = (progressEstatico > 0 && progressEstatico < 100) ? 'block' : 'none';
    
    const pbValue = document.createElement('div');
    pbValue.className = 'progress-value-neon';
    pbValue.style.width = `${progressEstatico}%`;
    pbContainer.appendChild(pbValue);

    const img = document.createElement('img');
    // Se tiver imgVertical no data.js, usa no mobile
    img.src = (window.innerWidth <= 768 && item.imgVertical) ? item.imgVertical : item.img;
    img.alt = item.title || "Movie cover";
    img.loading = "lazy";
    
    // Para DVDs, adicionar classe dvd-capa
    if (isDVD) {
        img.className = 'dvd-capa';
    }

    const iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    const videoId = getYouTubeId(item.youtube || item.video || item.trailer);

    card.appendChild(iframe);
    card.appendChild(img);
    
    // Se for DVD, criar imagem do disco
    if (isDVD && item.imgDisco) {
        const imgDisco = document.createElement('img');
        imgDisco.src = item.imgDisco;
        imgDisco.alt = `${item.title} - Disco`;
        imgDisco.className = 'dvd-disco';
        imgDisco.loading = "lazy";
        card.appendChild(imgDisco);
    }
    
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
                <button class="btn-icon ${estaNaLista ? 'active' : ''}" onclick="event.stopPropagation(); toggleMinhaLista('${item.id}', this)">
                    <i class="fas ${estaNaLista ? 'fa-check' : 'fa-plus'}"></i>
                </button>
                <button class="btn-icon btn-like-main" style="color: ${deuLike ? '#a855f7' : 'white'}" onclick="event.stopPropagation(); toggleLike('${item.id}', this)">
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

    // Adicionar classe para mostrar gêneros no mobile
    if (window.innerWidth <= 768) {
        details.classList.add('mobile-genre-visible');
    }

    const btnPlayCard = details.querySelector('.btn-play-icon');
    const btnInfoCard = details.querySelector('.btn-info-icon');
    
    if (btnPlayCard) btnPlayCard.onclick = (e) => { e.stopPropagation(); window.abrirModal(item, 'assistir'); };
    if (btnInfoCard) btnInfoCard.onclick = (e) => { e.stopPropagation(); window.abrirModal(item, 'info'); };

    // --- LÓGICA DE PC (HOVER) ---
    let playTimeout;
    let liveProgressInterval;
    let tempProgress = 0; 

    card.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            // DVDs: Sem lógica de hover, apenas CSS faz a animação
            if (isDVD) {
                return;
            }
            
            const rect = card.getBoundingClientRect();
            if (rect.left < 100) card.classList.add('origin-left');
            else if (rect.right > window.innerWidth - 100) card.classList.add('origin-right');

            tempProgress = 0;
            pbValue.style.width = '0%';
            pbContainer.style.display = 'block';

            playTimeout = setTimeout(() => {
                if (videoId) {
                    // Parâmetros para autoplay funcionar: mute=1 obrigatório para autoplay sem interação
                    // origin é adicionado para evitar bloqueios de segurança do navegador
                    const origin = window.location.origin;
                    const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}&fs=0&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
                    iframe.src = youtubeUrl;
                    iframe.classList.add('playing');
                    img.classList.add('playing-video');
                    
                    // Adicionar botão de mute/unmute via postMessage
                    if (!card.querySelector('.preview-mute-button')) {
                        const muteButton = document.createElement('button');
                        muteButton.className = 'preview-mute-button';
                        muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
                        muteButton.style.position = 'absolute';
                        muteButton.style.top = '10px';
                        muteButton.style.right = '10px';
                        muteButton.style.background = 'rgba(0,0,0,0.7)';
                        muteButton.style.color = '#aaa';
                        muteButton.style.border = 'none';
                        muteButton.style.padding = '8px 10px';
                        muteButton.style.borderRadius = '4px';
                        muteButton.style.fontSize = '14px';
                        muteButton.style.cursor = 'pointer';
                        muteButton.style.zIndex = '45';
                        muteButton.style.transition = 'all 0.2s ease';
                        muteButton.style.display = 'flex';
                        muteButton.style.alignItems = 'center';
                        muteButton.style.justifyContent = 'center';
                        
                        let isMuted = true; // Começa mutado
                        
                        muteButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            isMuted = !isMuted;
                            
                            // Tentar capturar o tempo atual do vídeo via postMessage
                            try {
                                iframe.contentWindow.postMessage({
                                    event: 'command',
                                    func: 'getCurrentTime'
                                }, '*');
                            } catch (error) {
                                console.warn('Não conseguiu capturar tempo do vídeo');
                            }
                            
                            // Usar o tempo capturado (com fallback de 2 segundos)
                            const syncTime = Math.floor(lastVideoTime) || 2;
                            
                            // Aguardar um pouco e recarregar o iframe
                            setTimeout(() => {
                                const origin = window.location.origin;
                                let newUrl;
                                
                                if (!isMuted) {
                                    // Usuário quer SOM: remover mute, iniciar do tempo capturado
                                    newUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1&loop=1&playlist=${videoId}&fs=0&rel=0&enablejsapi=1&start=${syncTime}&origin=${encodeURIComponent(origin)}`;
                                } else {
                                    // Usuário quer MUDO: voltar ao padrão
                                    newUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}&fs=0&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
                                }
                                
                                // Recarregar o iframe com nova URL
                                iframe.src = newUrl;
                                
                                // Atualizar visual do botão
                                if (isMuted) {
                                    muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
                                    muteButton.style.color = '#aaa';
                                    muteButton.style.background = 'rgba(0,0,0,0.7)';
                                } else {
                                    muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                                    muteButton.style.color = '#a855f7';
                                    muteButton.style.background = 'rgba(168, 85, 247, 0.2)';
                                }
                            }, 50);
                        });
                        
                        muteButton.addEventListener('mouseenter', () => {
                            muteButton.style.background = isMuted ? 'rgba(255, 255, 255, 0.15)' : 'rgba(168, 85, 247, 0.35)';
                        });
                        
                        muteButton.addEventListener('mouseleave', () => {
                            muteButton.style.background = isMuted ? 'rgba(0,0,0,0.7)' : 'rgba(168, 85, 247, 0.2)';
                        });
                        
                        card.appendChild(muteButton);
                    }
                    
                    // Fallback: se o iframe não carregar, manter a imagem visível
                    iframe.load_error = (e) => {
                        iframe.classList.remove('playing');
                        img.classList.remove('playing-video');
                    };

                    liveProgressInterval = setInterval(() => {
                        tempProgress = (tempProgress >= 100) ? 0 : tempProgress + 1;
                        pbValue.style.width = `${tempProgress}%`;
                        localStorage.setItem(chaveProgresso, tempProgress);
                    }, 1000); 
                }
            }, 600);
        }
    });

    card.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
            // DVDs: Sem lógica de hover, apenas CSS faz a animação
            if (isDVD) {
                return;
            }

            clearTimeout(playTimeout);
            clearInterval(liveProgressInterval); 
            iframe.classList.remove('playing');
            img.classList.remove('playing-video');
            iframe.src = "";
            card.classList.remove('origin-left');
            card.classList.remove('origin-right');
            
            // Remover botão de mute
            const muteButton = card.querySelector('.preview-mute-button');
            if (muteButton) muteButton.remove();

            const finalProgress = localStorage.getItem(chaveProgresso) || progressEstatico;
            pbValue.style.width = `${finalProgress}%`;
            if (parseInt(finalProgress) === 0) pbContainer.style.display = 'none';
        }
    });

    return card;
}

// Variável global para armazenar o tempo atual do vídeo
let lastVideoTime = 2;

// Listener global para receber mensagens do YouTube via postMessage
window.addEventListener('message', (event) => {
    try {
        // YouTube pode responder com diferentes formatos
        if (event.data.event === 'onReady' || event.data.event === 'onStateChange') {
            // Ignorar eventos do player que não nos interessam
            return;
        }
        
        // Se a resposta contém currentTime
        if (event.data && typeof event.data.currentTime === 'number') {
            lastVideoTime = event.data.currentTime;
        }
        // Se é uma string JSON com currentTime
        else if (typeof event.data === 'string' && event.data.includes('currentTime')) {
            try {
                const data = JSON.parse(event.data);
                if (data.currentTime) {
                    lastVideoTime = data.currentTime;
                }
            } catch (e) {
                // Não é JSON válido, ignorar
            }
        }
    } catch (error) {
        console.warn('Erro ao processar postMessage do YouTube:', error);
    }
});