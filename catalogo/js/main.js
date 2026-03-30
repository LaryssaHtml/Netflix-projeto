function isMobile() {
    return window.innerWidth <= 768;
}

import { categories, heroList } from './data.js';
import { createCarousel } from './components/Carousel.js';
import { getRandomElenco, getRandomClassificacao } from './utils.js';

let tempoInicioAssistir = 0;
let filmeAtualId = null;

const normalizarTexto = (texto) => !texto ? "" : texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const getPerfilData = () => ({ nome: localStorage.getItem('perfilAtivoNome') || 'default', lista: JSON.parse(localStorage.getItem(`lista_${localStorage.getItem('perfilAtivoNome') || 'default'}`)) || [], likes: JSON.parse(localStorage.getItem(`likes_${localStorage.getItem('perfilAtivoNome') || 'default'}`)) || [] });

function fecharModal() {
    const modal = document.getElementById('modal');
    const modalVideoPc = document.getElementById('modal-video-pc');
    const modalVideoTablet = document.querySelector('#tab-trailer iframe');

    if (filmeAtualId && tempoInicioAssistir > 0) {
        const nomePerfilAtivo = localStorage.getItem('perfilAtivoNome') || 'default';
        const chaveLocal = `progress_${nomePerfilAtivo}_${filmeAtualId}`;
        const segundos = (Date.now() - tempoInicioAssistir) / 1000;
        let progressoGanhado = Math.floor(segundos / 5) * 2; // 2% a cada 5 segundos
        const itemData = categories.flatMap(c => c.items).find(i => i.id === filmeAtualId);
        let baseInicial = parseInt(localStorage.getItem(chaveLocal)) || (itemData ? itemData.progress : 0) || 0;

        // Melhorar o cálculo do progresso (máximo 98%)
        if (progressoGanhado > 0) {
            const novoProgresso = Math.min(baseInicial + progressoGanhado, 98);
            localStorage.setItem(chaveLocal, novoProgresso);
            
            // Marcar como parcialmente assistido
            const tempoVisualizacao = parseInt(localStorage.getItem(`tempo_${nomePerfilAtivo}_${filmeAtualId}`)) || 0;
            localStorage.setItem(`tempo_${nomePerfilAtivo}_${filmeAtualId}`, tempoVisualizacao + segundos);
        }
    }

    if (isMobile()) {
        modal.classList.remove('active-mobile');
    }

    modal.style.display = 'none';
    if (modalVideoPc) modalVideoPc.src = "";
    if (modalVideoTablet) modalVideoTablet.src = "";
    filmeAtualId = null;
    tempoInicioAssistir = 0;
    renderizarConteudo(document.getElementById('search-input')?.value, false);
}

// HELPER: Preencher informações do modal (reduz duplicação)
const preencherModalInfo = (filme, isMobileMode) => {
    const { nome, lista, likes } = getPerfilData();
    const suffix = isMobileMode ? '' : '-pc';
    const elenco = filme.elenco || getRandomElenco();
    const classificacao = filme.classificacao || getRandomClassificacao();
    const estaNaLista = lista.includes(filme.id);
    const deuLike = likes.includes(filme.id);
    
    const titleEl = document.getElementById(`modal-title${suffix}`);
    const synopsisEl = document.getElementById(`modal-synopsis${suffix}`);
    const metaEl = document.getElementById(`modal-meta${suffix}`);
    
    if (titleEl) titleEl.textContent = filme.title || "";
    if (synopsisEl) synopsisEl.textContent = filme.description || filme.sinopse || "Sem sinopse";
    
    if (metaEl) {
        const buttons = isMobileMode ? `<div class="modal-mobile-actions" style="display:flex; gap:20px; margin-top:15px;">
            <button class="btn-icon" onclick="toggleMinhaLista('${filme.id}', this)"><i class="fas ${estaNaLista ? 'fa-check' : 'fa-plus'}"></i><span style="display:block;font-size:10px;">Minha Lista</span></button>
            <button class="btn-icon" style="color:${deuLike ? '#a855f7' : 'white'} !important" onclick="toggleLike('${filme.id}', this)"><i class="fas fa-thumbs-up"></i><span style="display:block;font-size:10px;">Classificar</span></button></div>` : '';
        metaEl.innerHTML = `<li><strong>Elenco:</strong> ${elenco}</li><li><strong>Gêneros:</strong> ${filme.genero || 'N/A'}</li><li><strong>Classificação:</strong> ${classificacao}</li>${buttons}`;
    }
};

window.abrirModal = function(filme, modo) {
    const modal = document.getElementById('modal');
    if (!modal) return;

    const isMobileMode = isMobile();
    const link = filme.video || filme.trailer || filme.youtube;
    const separator = link?.includes('?') ? '&' : '?';
    
    modal.style.display = 'flex';
    
    // Setup abas e containers
    const modalTabs = document.getElementById('modal-tabs');
    if (modalTabs) modalTabs.style.display = isMobileMode ? 'flex' : 'none';
    
    const containerVideoPc = document.getElementById('container-video-pc');
    const containerInfoPc = document.getElementById('container-info-pc');
    if (containerVideoPc) containerVideoPc.style.display = 'none';
    if (containerInfoPc) containerInfoPc.style.display = 'none';
    
    if (modo === 'assistir') {
        filmeAtualId = filme.id;
        tempoInicioAssistir = Date.now();
        if (link) {
            if (isMobileMode) {
                mudarAbaModal('trailer');
                const containerVideo = document.getElementById('container-video');
                if (containerVideo) containerVideo.style.display = 'block';
                const trailer = document.querySelector('#tab-trailer iframe');
                if (trailer) trailer.src = `${link}${separator}autoplay=1&rel=0&modestbranding=1`;
            } else {
                if (containerVideoPc) containerVideoPc.style.display = 'block';
                const videoPc = document.getElementById('modal-video-pc');
                if (videoPc) videoPc.src = `${link}${separator}autoplay=1&rel=0&modestbranding=1`;
            }
        } else alert("Vídeo indisponível.");
    } else {
        if (isMobileMode) {
            mudarAbaModal('info');
            const capa = document.getElementById('modal-poster-capa');
            if (capa) capa.src = filme.imgVertical || filme.img;
        } else {
            if (containerInfoPc) containerInfoPc.style.display = 'block';
            const poster = document.getElementById('modal-poster-pc');
            if (poster) poster.src = filme.imgVertical || filme.img;
        }
        preencherModalInfo(filme, isMobileMode);
        if (isMobileMode) {
            const poster = document.getElementById('modal-poster');
            if (poster) poster.src = filme.imgVertical || filme.img;
        }
    }
};

// FUNÇÃO PARA MUDAR ABA NO MODAL (Mobile)
window.mudarAbaModal = function(nomeAba) {
    if (!isMobile()) return;

    // Esconder todos os conteúdos
    document.querySelectorAll('.modal-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remover classe ativa de todos os botões
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar aba selecionada COM DELAY para transição suave
    setTimeout(() => {
        const tabContent = document.getElementById(`tab-${nomeAba}`);
        if (tabContent) {
            tabContent.classList.add('active');
        }

        // Ativar botão clicado
        const tabBtn = document.querySelector(`[data-tab="${nomeAba}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
    }, 10);
};

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
    // --- FUNÇÃO NAVEGAR (MOBILE) ---
    const navSelect = document.querySelector('.mobile-nav-select');
    if (navSelect) {
        navSelect.onclick = () => {
            const box = document.createElement('div');
            box.className = 'nav-dropdown-mobile';
            box.innerHTML = `
                <div class="nav-dropdown-content">
                    <span onclick="mudarFiltro('todos'); this.parentElement.parentElement.remove()">Início</span>
                    <span onclick="mudarFiltro('série'); this.parentElement.parentElement.remove()">Séries</span>
                    <span onclick="mudarFiltro('filme'); this.parentElement.parentElement.remove()">Filmes</span>
                    <span onclick="this.parentElement.parentElement.remove()">Bombando</span>
                    <span onclick="mudarFiltro('minha-lista'); this.parentElement.parentElement.remove()">Minha Lista</span>
                </div>
            `;
            document.body.appendChild(box);
            box.onclick = (e) => { if(e.target === box) box.remove(); };
        };
    }

    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    const imagemPerfil = localStorage.getItem('perfilAtivoImagem');
    if (nomePerfil) {
        const kidsLink = document.querySelector('.kids-link');
        const profileImg = document.querySelector('.profile-icon');
        if (kidsLink) kidsLink.textContent = nomePerfil;
        if (profileImg) profileImg.src = imagemPerfil;
    }

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.onclick = fecharModal;

    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (isMobile() && e.target === modal) fecharModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
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
                const imgHero = (isMobile() && item.imgVertical) ? item.imgVertical : item.img;
                heroSection.style.backgroundImage = `linear-gradient(to top, #111 10%, transparent 90%), url('${imgHero}')`;
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

// 3. RENDERIZAÇÃO (Mantida Original)
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
            container.innerHTML = `<div class="no-results-container"><div class="no-results-content"><i class="fas fa-search"></i><h2>Nenhum resultado para "${filtroBusca}"</h2><p>Não encontramos nada com esse termo. Tente outro!</p><ul><li>Verifique a ortografia</li><li>Tente com termos diferentes</li><li>Navegue pelas categorias</li></ul></div></div>`;
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
}

// HELPERS: LocalStorage centralizados
const StorageMgr = {
    getLikes: () => JSON.parse(localStorage.getItem(`likes_${localStorage.getItem('perfilAtivoNome')}`)) || [],
    setLikes: (likes) => localStorage.setItem(`likes_${localStorage.getItem('perfilAtivoNome')}`, JSON.stringify(likes)),
    getLista: () => JSON.parse(localStorage.getItem(`lista_${localStorage.getItem('perfilAtivoNome')}`)) || [],
    setLista: (lista) => localStorage.setItem(`lista_${localStorage.getItem('perfilAtivoNome')}`, JSON.stringify(lista))
};

// 4. FUNÇÕES GLOBAIS
window.toggleLike = (id, btn) => {
    let likes = StorageMgr.getLikes();
    if (likes.includes(id)) { 
        likes = likes.filter(i => i !== id); 
        btn.style.setProperty('color', 'white', 'important');
    }
    else { 
        likes.push(id); 
        btn.style.setProperty('color', '#a855f7', 'important');
        animacaoLikeSocial(btn); 
    }
    StorageMgr.setLikes(likes);
};

window.toggleMinhaLista = (id, btn) => {
    let lista = StorageMgr.getLista();
    const icon = btn.querySelector('i');
    if (lista.includes(id)) { lista = lista.filter(i => i !== id); if(icon) icon.className = 'fas fa-plus'; }
    else { lista.push(id); if(icon) icon.className = 'fas fa-check'; }
    StorageMgr.setLista(lista);
};
// 1. Função global de filtro (Conserta o scroll do PC)
window.mudarFiltro = (g) => {
    localStorage.setItem(`interesse_${localStorage.getItem('perfilAtivoNome')}`, g);
    renderizarConteudo("", true);
    setTimeout(() => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) window.scrollTo({ top: mainContent.offsetTop - 100, behavior: 'smooth' });
    }, 100);
    const dropdown = document.querySelector('.nav-dropdown-mobile');
    if (dropdown) dropdown.remove();
};

// 2. Mobile menu unificado
const setupMobileMenu = () => {
    const navBtn = document.querySelector('.mobile-nav-select');
    if (!navBtn) return;
    navBtn.onclick = (e) => {
        e.stopPropagation();
        const existing = document.querySelector('.nav-dropdown-mobile');
        if (existing) { existing.remove(); return; }
        const menu = document.createElement('div');
        menu.className = 'nav-dropdown-mobile';
        menu.innerHTML = `<div class="nav-dropdown-content"><p style="color:gray;font-size:12px;">NAVEGAR</p>
            <span onclick="window.mudarFiltro('todos')">Início</span><span onclick="window.mudarFiltro('series')">Séries</span>
            <span onclick="window.mudarFiltro('filmes')">Filmes</span><span onclick="window.mudarFiltro('minha-lista')">Minha Lista</span>
            <hr style="border:none;border-top:1px solid #333;margin:10px 0;"><p style="color:gray;font-size:12px;">GÊNEROS</p>
            <span onclick="window.mudarFiltro('sci-fi')">Sci-Fi</span><span onclick="window.mudarFiltro('aventura')">Aventura</span>
            <span onclick="window.mudarFiltro('romance')">Romance</span><span onclick="window.mudarFiltro('terror')">Terror</span>
            <span style="color:red;margin-top:10px;font-weight:bold;" onclick="this.parentElement.parentElement.remove()">SAIR</span></div>`;
        document.body.appendChild(menu);
        menu.onclick = (ev) => { if (ev.target === menu) menu.remove(); };
    };
};

// 3. Consolidar listeners globais
document.addEventListener('click', (e) => { if (e.target.closest('.close-btn')) fecharModal(); });
document.addEventListener('DOMContentLoaded', () => { setupMobileMenu(); });


// Busca e notificações
window.toggleSearch = () => {
    const box = document.querySelector('.search-box');
    const input = document.getElementById('search-input');
    box.classList.toggle('active');
    if (box.classList.contains('active')) input.focus();
};

window.executarBusca = () => { const input = document.getElementById('search-input'); if (input) renderizarConteudo(input.value, true); };

document.getElementById('search-input')?.addEventListener('input', () => window.executarBusca());
document.getElementById('search-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const box = document.querySelector('.search-box');
        box.classList.remove('active');
        box.querySelector('input').value = '';
        renderizarConteudo('', false);
    }
});

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES 🔔
// ============================================================================

// 📦 ARRAY DE NOTIFICAÇÕES - Aqui ficam armazenadas as notificações
// EDITE ESTE ARRAY PARA MUDAR AS NOTIFICAÇÕES PADRÃO:
let notificacoes = JSON.parse(localStorage.getItem('notificacoes_app')) || [
    {
        id: 1,
        titulo: "Novo episódio disponível!",
        mensagem: "The Crown - Temporada 5 já está disponível",
        icone: "fa-star",  // 🎬 Ícone mostrado na notificação
        lido: false,       // false = não lido (mostrar badge)
        tempo: "Há 2 horas"
    },
    {
        id: 2,
        titulo: "Recomendação personalizada",
        mensagem: "Você pode gostar de 'Stranger Things'",
        icone: "fa-heart",
        lido: false,
        tempo: "Há 5 horas"
    },
    {
        id: 3,
        titulo: "Filme chegando em breve",
        mensagem: "O episódio final sai em 3 dias!",
        icone: "fa-calendar",
        lido: true,  // true = já foi lido (sem badge)
        tempo: "Há 1 dia"
    }
];

/** 
 * 💾 SALVA AS NOTIFICAÇÕES NO localStorage
 * Chamada automaticamente quando houver mudanças
 */
function salvarNotificacoes() {
    localStorage.setItem('notificacoes_app', JSON.stringify(notificacoes));
}

/** 
 * 🔴 ATUALIZA O BADGE DO SINO (número de notificações não lidas)
 * Mostra/esconde o número no canto do sino
 */
function atualizarBadgeNotificacoes() {
    // Contar quantas notificações NÃO foram lidas
    const naoLidas = notificacoes.filter(n => !n.lido).length;
    const badge = document.querySelector('.notification-badge');
    
    if (badge) {
        // Mostrar o número ou esconder se não há não-lidas
        badge.textContent = naoLidas > 0 ? naoLidas : '';
        if (naoLidas === 0) {
            badge.style.display = 'none';  // Esconder badge
        } else {
            badge.style.display = 'flex';  // Mostrar badge com número
        }
    }
}

/** 
 * 📋 RENDERIZA O DROPDOWN COM TODAS AS NOTIFICAÇÕES
 * Cria o HTML de cada notificação quando o usuário clica no sino
 */
function renderizarNotificacoes() {
    const dropdown = document.querySelector('.notification-dropdown');
    if (!dropdown) return;

    // CABEÇALHO DO DROPDOWN
    let html = `<div class="notification-header">
        <span>Notificações</span>
        <button onclick="marcarTodasComoLidas()">Marcar tudo como lido</button>
    </div>`;

    // SE NÃO HÁ NOTIFICAÇÕES
    if (notificacoes.length === 0) {
        html += `<div class="notification-empty">
            <i class="fas fa-bell-slash"></i>
            <p>Nenhuma notificação</p>
        </div>`;
    } else {
        // LISTAGEM DE NOTIFICAÇÕES
        notificacoes.forEach(notif => {
            // Se não foi lida, adiciona classe 'unread' que muda a cor de fundo
            const classe = notif.lido ? '' : 'unread';
            html += `<div class="notification-item ${classe}" onclick="abrirNotificacao(${notif.id})">
                <div class="notification-icon">
                    <i class="fas ${notif.icone}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.titulo}</div>
                    <div class="notification-text">${notif.mensagem}</div>
                    <div class="notification-time">${notif.tempo}</div>
                </div>
            </div>`;
        });
    }

    dropdown.innerHTML = html;
}

/** 
 * 🔔 ABRE/FECHA O DROPDOWN DE NOTIFICAÇÕES
 * Chamada quando clica no sino
 */
function toggleNotificacoes() {
    let dropdown = document.querySelector('.notification-dropdown');
    
    // Se o dropdown não existe, criar
    if (!dropdown) {
        const navNot = document.querySelector('.nav-notification');
        if (!navNot) return;
        
        const newDropdown = document.createElement('div');
        newDropdown.className = 'notification-dropdown';
        navNot.appendChild(newDropdown);
        dropdown = newDropdown;
    }

    // Alternar visibilidade
    dropdown.classList.toggle('active');
    
    // Se abriu, renderizar e marcar como lidas
    if (dropdown.classList.contains('active')) {
        renderizarNotificacoes();
        marcarTodasComoLidas();
    }
}

/** 
 * ✅ MARCA TODAS AS NOTIFICAÇÕES COMO LIDAS
 * Remove o badge vermelho
 */
function marcarTodasComoLidas() {
    // Trocar status de todas para 'lido'
    notificacoes.forEach(n => n.lido = true);
    
    // Salvar mudanças
    salvarNotificacoes();
    
    // Atualizar o badge (será escondido)
    atualizarBadgeNotificacoes();
    
    // Redesenhar o dropdown
    renderizarNotificacoes();
}

/** 
 * 👁️ ABRE UMA NOTIFICAÇÃO ESPECÍFICA
 * Marca como lida e executa ação
 * 
 * @param {number} id - ID da notificação a abrir
 */
function abrirNotificacao(id) {
    const notif = notificacoes.find(n => n.id === id);
    
    if (notif) {
        // Marcar como lida
        notif.lido = true;
        
        // Salvar
        salvarNotificacoes();
        
        // Atualizar badges e dropdown
        atualizarBadgeNotificacoes();
        console.log("📱 Notificação aberta:", notif);
        
        // 🔧 AQUI VOCÊ PODE ADICIONAR AÇÕES:
        // Por exemplo, redirecionar para um filme específico:
        // if (notif.titulo.includes('episódio')) {
        //     window.mudarFiltro('series');  // Ir para série recomendada
        // }
    }
}

/** 
 * ➕ ADICIONA UMA NOVA NOTIFICAÇÃO
 * Use isto em outro código para disparar notificações
 * 
 * Exemplo:
 *   adicionarNotificacao('Nova série!', 'Veja The Last of Us', 'fa-heart');
 * 
 * @param {string} titulo - Título da notificação
 * @param {string} mensagem - Descrição/mensagem
 * @param {string} icone - Ícone FontAwesome (ex: 'fa-star', 'fa-heart')
 */
function adicionarNotificacao(titulo, mensagem, icone = "fa-bell") {
    const novaNotif = {
        id: Date.now(),           // ID único usando timestamp
        titulo,
        mensagem,
        icone,
        lido: false,              // Automaticamente não lida
        tempo: "Agora"            // Marca como acabada de chegar
    };
    
    // Adicionar no INÍCIO do array (aparece primeiro)
    notificacoes.unshift(novaNotif);
    
    // Salvar e atualizar UI
    salvarNotificacoes();
    atualizarBadgeNotificacoes();
}

/** 
 * 🚀 INICIALIZAÇÃO DO SISTEMA DE NOTIFICAÇÕES
 * Executado quando o DOM carrega
 */
document.addEventListener('DOMContentLoaded', () => {
    // Atualizar badge na primeira carga
    atualizarBadgeNotificacoes();
    
    // Adicionar evento ao sino para abrir/fechar
    const navNotif = document.querySelector('.nav-notification');
    if (navNotif) {
        navNotif.onclick = toggleNotificacoes;
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.notification-dropdown');
        const navNotif = document.querySelector('.nav-notification');
        
        // Se clicou em algo fora do sino e do dropdown
        if (dropdown && navNotif && !navNotif.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});
