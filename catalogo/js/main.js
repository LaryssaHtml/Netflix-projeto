function isMobile() {
    return window.innerWidth <= 768;
}

import { categories, heroList } from './data.js';
import { createCarousel } from './components/Carousel.js';

let tempoInicioAssistir = 0;
let filmeAtualId = null;

function normalizarTexto(texto) {
    if (!texto) return ""; 
    return texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// 🔥 NOVO: função central de fechar modal (sem quebrar nada)
function fecharModal() {
    const modal = document.getElementById('modal');
    const modalVideo = document.getElementById('modal-video');

    if (filmeAtualId && tempoInicioAssistir > 0) {
        const nomePerfilAtivo = localStorage.getItem('perfilAtivoNome') || 'default';
        const chaveLocal = `progress_${nomePerfilAtivo}_${filmeAtualId}`;

        const segundos = (Date.now() - tempoInicioAssistir) / 1000;
        let progressoGanhado = Math.floor(segundos / 5) * 2;

        const itemData = categories.flatMap(c => c.items).find(i => i.id === filmeAtualId);
        let baseInicial = parseInt(localStorage.getItem(chaveLocal)) || (itemData ? itemData.progress : 0) || 0;

        if (progressoGanhado > 0) {
            localStorage.setItem(chaveLocal, Math.min(baseInicial + progressoGanhado, 98));
        }
    }

    // 🔥 MOBILE vs DESKTOP
    if (isMobile()) {
        modal.classList.remove('active-mobile');
    }

    modal.style.display = 'none';
    modalVideo.src = "";

    filmeAtualId = null;
    tempoInicioAssistir = 0;

    renderizarConteudo(document.getElementById('search-input')?.value, false);
}

// 1. MODAL
window.abrirModal = function(filme, modo) {
    const modal = document.getElementById('modal');
    const containerVideo = document.getElementById('container-video');
    const containerInfo = document.getElementById('container-info');
    const modalVideo = document.getElementById('modal-video');

    if (!modal || !modalVideo) return;

    modalVideo.src = "";
    containerVideo.style.display = 'none';
    containerInfo.style.display = 'none';

    // 🔥 MOBILE vs DESKTOP (sem quebrar seu display original)
    if (isMobile()) {
        modal.style.display = 'flex';
        modal.classList.add('active-mobile');
    } else {
        modal.style.display = 'flex';
    }

    if (modo === 'assistir') {
        const link = filme.video || filme.trailer || filme.youtube;
        if (link) {
            filmeAtualId = filme.id;
            tempoInicioAssistir = Date.now(); 
            containerVideo.style.display = 'block';
            const separator = link.includes('?') ? '&' : '?';
            modalVideo.src = `${link}${separator}autoplay=1&rel=0&modestbranding=1`;
        } else {
            alert("Vídeo indisponível.");
            fecharModal();
        }
    } else {
        containerInfo.style.display = 'block';
        document.getElementById('modal-title').textContent = filme.title || "";
        document.getElementById('modal-synopsis').textContent = filme.description || filme.sinopse || "Sem sinopse disponível.";
        document.getElementById('modal-poster').src = filme.img;
        const modalMeta = document.getElementById('modal-meta');
        if (modalMeta) {
            modalMeta.innerHTML = `
                <li><strong>Gêneros:</strong> ${filme.genero || 'N/A'}</li>
                <li><strong>Categoria:</strong> ${filme.categoria || 'Destaque'}</li>
            `;
        }
    }
};

// 2. ANIMAÇÃO DE LIKE
function animacaoLikeSocial(elemento) {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const particle = document.createElement('i');
            particle.className = 'fas fa-heart social-particle';
            const xMovement = (Math.random() - 0.5) * 60;
            particle.style.setProperty('--x', `${xMovement}px`);
            elemento.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }, i * 100); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    const imagemPerfil = localStorage.getItem('perfilAtivoImagem');
    if (nomePerfil) {
        const kidsLink = document.querySelector('.kids-link');
        const profileImg = document.querySelector('.profile-icon');
        if (kidsLink) kidsLink.textContent = nomePerfil;
        if (profileImg) profileImg.src = imagemPerfil;
    }

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = fecharModal; // 🔥 agora usa função global
    }

    // 🔥 NOVO: fechar clicando fora (SÓ MOBILE)
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (isMobile() && e.target === modal) {
                fecharModal();
            }
        });
    }

    // 🔥 NOVO: ESC fecha (não afeta mobile negativamente)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });

    // --- HERO ---
    const heroSection = document.querySelector('.hero');
    if (heroSection && heroList.length > 0) {
        let heroIndex = 0; 
        const atualizarHero = (index) => {
            const item = heroList[index];
            if (!item) return;
            heroSection.style.transition = "opacity 0.8s ease";
            heroSection.style.opacity = '0.3'; 
            setTimeout(() => {
                heroSection.style.backgroundImage = `linear-gradient(to top, #111 10%, transparent 90%), url('${item.img}')`;
                const hTitle = document.querySelector('.hero-title');
                const hDesc = document.querySelector('.hero-description');
                if (hTitle) hTitle.textContent = item.title;
                if (hDesc) hDesc.textContent = item.description;
                
                const btnPlay = document.querySelector('.btn-play');
                const btnInfo = document.querySelector('.btn-info');
                if (btnPlay) btnPlay.onclick = () => window.abrirModal(item, 'assistir');
                if (btnInfo) btnInfo.onclick = () => window.abrirModal(item, 'info');
                
                heroSection.style.opacity = '1';
            }, 800);
        };
        atualizarHero(heroIndex);
        setInterval(() => {
            heroIndex = (heroIndex + 1) % heroList.length;
            atualizarHero(heroIndex);
        }, 15000);
    }

    renderizarConteudo();
});

// 3. RENDERIZAÇÃO
function renderizarConteudo(filtroBusca = "", deveRolar = true) {
    const container = document.getElementById('main-content');
    if (!container) return;
    container.innerHTML = ''; 
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    const interesseAtual = localStorage.getItem(`interesse_${nomePerfil}`) || 'todos';
    const termo = normalizarTexto(filtroBusca);

    const realizarScroll = () => {
        if (!deveRolar) return;
        const yOffset = -100; 
        const y = container.offsetTop + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    };

    if (termo) {
        const resultados = categories.flatMap(cat => cat.items).filter(item => 
            item && (normalizarTexto(item.title).includes(termo) || (item.genero && normalizarTexto(item.genero).includes(termo)))
        );
        
        if (resultados.length > 0) {
            container.appendChild(createCarousel({ title: `Resultados para "${filtroBusca}"`, items: resultados }));
            realizarScroll();
        } else {
            container.innerHTML = `
                <div class="no-results-container">
                    <div class="no-results-content">
                        <i class="fas fa-search"></i>
                        <h2>Nenhum resultado para "${filtroBusca}"</h2>
                        <ul>
                            <li>Verifique a ortografia das palavras.</li>
                            <li>Tente usar nomes de atores ou gêneros.</li>
                            <li>Tente um título de filme ou série.</li>
                        </ul>
                    </div>
                </div>`;
            realizarScroll();
        }
        return;
    }

    const listaIds = JSON.parse(localStorage.getItem(`lista_${nomePerfil}`)) || [];
    if (listaIds.length > 0 && (interesseAtual === 'todos' || interesseAtual === 'minha-lista')) {
        const itensLista = categories.flatMap(cat => cat.items).filter(item => item && item.id && listaIds.includes(item.id));
        if(itensLista.length > 0) container.appendChild(createCarousel({ title: "Minha Lista", items: itensLista }));
    }

    categories.forEach(cat => {
        const filtrados = cat.items.filter(item => {
            if (!item) return false;
            let passaPrivacidade = !item.perfil || (item.perfil.toLowerCase() === nomePerfil.toLowerCase());
            let passaInteresse = (interesseAtual === 'todos' || (item.genero && normalizarTexto(item.genero) === normalizarTexto(interesseAtual)));
            return passaPrivacidade && passaInteresse;
        });
        if (filtrados.length > 0) container.appendChild(createCarousel({ ...cat, items: filtrados }));
    });

    if (interesseAtual !== 'todos') {
        realizarScroll();
    }
}

// 4. FUNÇÕES GLOBAIS
window.mudarFiltro = (g) => {
    localStorage.setItem(`interesse_${localStorage.getItem('perfilAtivoNome')}`, g);
    if(g === 'todos') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    renderizarConteudo();
};

window.toggleLike = (id, b) => {
    let likes = JSON.parse(localStorage.getItem(`likes_${localStorage.getItem('perfilAtivoNome')}`)) || [];
    if (likes.includes(id)) { likes = likes.filter(i => i !== id); b.style.color = 'white'; }
    else { likes.push(id); b.style.color = '#a855f7'; animacaoLikeSocial(b); }
    localStorage.setItem(`likes_${localStorage.getItem('perfilAtivoNome')}`, JSON.stringify(likes));
};

window.toggleMinhaLista = (id, b) => {
    let lista = JSON.parse(localStorage.getItem(`lista_${localStorage.getItem('perfilAtivoNome')}`)) || [];
    if (lista.includes(id)) { lista = lista.filter(i => i !== id); b.querySelector('i').className = 'fas fa-plus'; }
    else { lista.push(id); b.querySelector('i').className = 'fas fa-check'; }
    localStorage.setItem(`lista_${localStorage.getItem('perfilAtivoNome')}`, JSON.stringify(lista));
};

window.toggleSearch = () => {
    const box = document.querySelector('.search-box');
    const input = document.getElementById('search-input');
    if (box) box.classList.toggle('active');
    if (input && box.classList.contains('active')) input.focus();
};

window.executarBusca = () => {
    renderizarConteudo(document.getElementById('search-input').value);
};