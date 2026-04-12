function isMobile() {
    return window.innerWidth <= 768;
}

import { categories, heroList } from './data.js';

// FUNÇÃO: Extrair gêneros únicos do data.js
function extrairGenerosUnicos() {
    const generosSet = new Set();
    categories.forEach(cat => {
        cat.items.forEach(item => {
            if (item.genero) {
                // Separar por vírgula primeiro
                let generos = item.genero.split(',').map(g => g.trim());
                // Se houver espaços após a normalização, considerar também como separador
                generos = generos.flatMap(g => {
                    // Se houver vírgula, mantém como está
                    // Se não houver vírgula mas tiver espaço, pode ser múltiplos gêneros
                    if (!item.genero.includes(',') && g.includes(' ')) {
                        return g.split(' ').map(s => s.trim()).filter(s => s);
                    }
                    return [g];
                });
                generos.forEach(g => {
                    if (g) generosSet.add(g.toLowerCase());
                });
            }
        });
    });
    return Array.from(generosSet).sort();
}

// FUNÇÃO: Atualizar menu de gêneros no PC
function atualizarMenuGenerosPC() {
    const generos = extrairGenerosUnicos();
    const genreContent = document.querySelector('.genre-content');
    if (!genreContent) return;
    
    genreContent.innerHTML = `<a href="#" onclick="mudarFiltro('todos')">Tudo</a>`;
    generos.forEach(genero => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = genero.charAt(0).toUpperCase() + genero.slice(1);
        link.onclick = () => { mudarFiltro(genero); return false; };
        genreContent.appendChild(link);
    });
}

// FUNÇÃO: Atualizar menu de gêneros no Mobile
function atualizarMenuGenerosMobile(menu) {
    const generos = extrairGenerosUnicos();
    let html = `<div class="nav-dropdown-content">
        <span style="color:#a855f7;font-weight:bold;border-bottom:2px solid rgba(168,85,247,0.5);position:sticky;top:0;background:#141414;z-index:2;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;"><i class="fas fa-filter"></i><span>FILTROS</span><span onclick="this.closest('.nav-dropdown-mobile').remove()" style="cursor:pointer;color:red;font-size:18px;">✕</span></span>
        
        <div class="dropdown-section">
            <p class="dropdown-section-title">Categorias</p>
            <div class="dropdown-items-container">
                <div class="dropdown-item" onclick="window.mudarFiltro('dvd'); this.closest('.nav-dropdown-mobile').remove()">DVD</div>
                <div class="dropdown-item" onclick="window.mudarFiltro('bombando'); this.closest('.nav-dropdown-mobile').remove()">Bombando</div>
                <div class="dropdown-item" onclick="window.mudarFiltro('minha-lista'); this.closest('.nav-dropdown-mobile').remove()">Minha Lista</div>
            </div>
        </div>
        
        <div class="dropdown-section">
            <p class="dropdown-section-title">Gêneros</p>
            <div class="generos-grid">`;
    
    generos.forEach(genero => {
        const genCapitalizado = genero.charAt(0).toUpperCase() + genero.slice(1);
        html += `<div class="genre-chip" onclick="window.mudarFiltro('${genero}'); this.closest('.nav-dropdown-mobile').remove()">${genCapitalizado}</div>`;
    });
    
    html += `</div>
        </div>
    </div>`;
    menu.innerHTML = html;
}

// FUNÇÃO: Mostrar menu de gêneros do mobile (chamada pelo bottom nav)
window.mostrarGeneros = function() {
    const box = document.createElement('div');
    box.className = 'nav-dropdown-mobile';
    const menu = document.createElement('div');
    atualizarMenuGenerosMobile(menu);
    box.appendChild(menu);
    document.body.appendChild(box);
    box.onclick = (e) => { if(e.target === box) box.remove(); };
};

import { createCarousel } from './components/Carousel.js';
import { getRandomElenco, getRandomClassificacao, removerDuplicatasElenco } from './utils.js';

let tempoInicioAssistir = 0;
let filmeAtualId = null;
let heroIntervalId = null; // Armazena o intervalo do hero para pausar/retomar

const normalizarTexto = (texto) => !texto ? "" : texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const getPerfilData = () => ({ nome: localStorage.getItem('perfilAtivoNome') || 'default', lista: JSON.parse(localStorage.getItem(`lista_${localStorage.getItem('perfilAtivoNome') || 'default'}`)) || [], likes: JSON.parse(localStorage.getItem(`likes_${localStorage.getItem('perfilAtivoNome') || 'default'}`)) || [] });

function pausarHero() {
    if (heroIntervalId) {
        clearInterval(heroIntervalId);
        heroIntervalId = null;
    }
}

function retomarHero() {
    pausarHero(); // Parar intervalo anterior para evitar duplicatas
    const heroSection = document.querySelector('.hero');
    if (heroSection && heroList.length > 0) {
        let heroIndex = heroList.findIndex(item => item.title === document.querySelector('.hero-title')?.textContent) || 0;
        heroIntervalId = setInterval(() => {
            heroIndex = (heroIndex + 1) % heroList.length;
            if (window.atualizarHero) window.atualizarHero(heroIndex);
        }, 15000);
    }
}

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
    
    // Retomar hero quando modal fecha
    retomarHero();
    
    renderizarConteudo(document.getElementById('search-input')?.value, false);
}

// HELPER: Preencher informações do modal (reduz duplicação)
const preencherModalInfo = (filme, isMobileMode) => {
    const { nome, lista, likes } = getPerfilData();
    const suffix = isMobileMode ? '' : '-pc';
    const elenco = removerDuplicatasElenco(filme.elenco) || getRandomElenco();
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

    // Pausar hero quando modal abre
    pausarHero();

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
    
    if (modo === 'assistir' || modo === 'info') {
        filmeAtualId = filme.id;
        tempoInicioAssistir = Date.now();
        
        // No mobile, sempre começa com trailer
        if (isMobileMode) {
            mudarAbaModal('trailer');
            if (link) {
                const containerVideo = document.getElementById('container-video');
                if (containerVideo) containerVideo.style.display = 'block';
                const trailer = document.querySelector('#tab-trailer iframe');
                if (trailer) {
                    // Otimizar carregamento do trailer: usar YouTube com parâmetros e permissão de autoplay
                    trailer.src = `${link}${separator}autoplay=1&rel=0&modestbranding=1&fs=1&controls=1`;
                }
            }
            // Preencher informações no background (tab-info)
            const capa = document.getElementById('modal-poster-capa');
            if (capa) capa.src = filme.imgVertical || filme.img;
            preencherModalInfo(filme, true);
        } else {
            // No PC, comportamento original
            if (modo === 'assistir') {
                if (containerVideoPc) containerVideoPc.style.display = 'block';
                if (link) {
                    const videoPc = document.getElementById('modal-video-pc');
                    if (videoPc) videoPc.src = `${link}${separator}autoplay=1&rel=0&modestbranding=1&fs=1&controls=1`;
                }
            } else {
                if (containerInfoPc) containerInfoPc.style.display = 'block';
                const poster = document.getElementById('modal-poster-pc');
                if (poster) poster.src = filme.img || filme.imgVertical;
            }
            preencherModalInfo(filme, false);
        }
    }
};

// FUNÇÃO PARA ABRIR IMAGEM DE DVD (Modal com infografia)
window.abrirDVDImagem = function(dvd) {
    // Criar modal simples para DVD
    const modal = document.createElement('div');
    modal.id = 'dvd-image-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
        position: relative;
        width: 90%;
        max-width: 400px;
        background: #1a1a1a;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(168, 85, 247, 0.3);
    `;
    
    const title = document.createElement('h2');
    title.textContent = dvd.title;
    title.style.cssText = `
        color: white;
        padding: 16px;
        margin: 0;
        font-size: 1.3rem;
        text-align: center;
        border-bottom: 2px solid rgba(168, 85, 247, 0.3);
    `;
    
    const image = document.createElement('img');
    // Usar imgInfografia se disponível, senão usar img (frente do DVD)
    image.src = dvd.imgInfografia || dvd.img || '#';
    image.alt = dvd.title;
    image.style.cssText = `
        width: 100%;
        height: auto;
        display: block;
        object-fit: cover;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        border: 2px solid white;
        color: white;
        font-size: 28px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 10000;
    `;
    
    closeBtn.onmouseover = () => {
        closeBtn.style.background = 'rgba(0, 0, 0, 0.9)';
        closeBtn.style.transform = 'scale(1.1)';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.background = 'rgba(0, 0, 0, 0.6)';
        closeBtn.style.transform = 'scale(1)';
    };
    
    closeBtn.onclick = () => {
        modal.remove();
    };
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    container.appendChild(title);
    container.appendChild(image);
    container.appendChild(closeBtn);
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    // Animar entrada
    container.style.animation = 'slideUp 0.4s ease';
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
                    <span onclick="mudarFiltro('series'); this.parentElement.parentElement.remove()">Séries</span>
                    <span onclick="mudarFiltro('filmes'); this.parentElement.parentElement.remove()">Filmes</span>
                    <span onclick="mudarFiltro('dvd'); this.parentElement.parentElement.remove()">DVD</span>
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
        const atualizarHero = window.atualizarHero = (index) => {
            const item = heroList[index];
            if (!item) return;
            
            // Só faz fade se já tem conteúdo (troca de filme)
            if (heroSection.style.backgroundImage && heroSection.textContent) {
                heroSection.style.transition = "opacity 0.6s ease";
                heroSection.style.opacity = '0.2';
                
                setTimeout(() => {
                    const imgHero = (isMobile() && item.imgVertical) ? item.imgVertical : item.img;
                    heroSection.style.backgroundImage = `linear-gradient(to top, #111 10%, transparent 90%), url('${imgHero}')`;
                    heroSection.style.transition = "opacity 0.6s ease";
                    heroSection.style.opacity = '1';
                }, 600);
            } else {
                // Primeira vez: não faz fade
                const imgHero = (isMobile() && item.imgVertical) ? item.imgVertical : item.img;
                heroSection.style.backgroundImage = `linear-gradient(to top, #111 10%, transparent 90%), url('${imgHero}')`;
                heroSection.style.opacity = '1';
                heroSection.style.transition = 'none';
            }
            
            const hTitle = document.querySelector('.hero-title');
            const hDesc = document.querySelector('.hero-description');
            if (hTitle) hTitle.textContent = item.title;
            if (hDesc) hDesc.textContent = item.description;
            const btnPlay = document.querySelector('.btn-play');
            const btnInfo = document.querySelector('.btn-info');
            if (btnPlay) btnPlay.onclick = () => window.abrirModal(item, 'assistir');
            if (btnInfo) btnInfo.onclick = () => window.abrirModal(item, 'info');
            
            // Sincronizar botões do hero com localStorage
            const sincronizarBotoesHero = () => {
                const { lista, likes } = getPerfilData();
                const estaNaLista = lista.includes(item.id);
                const deuLike = likes.includes(item.id);
                
                const btnHeroList = document.querySelector('.btn-hero-list');
                const btnHeroLike = document.querySelector('.btn-hero-like');
                
                if (btnHeroList) {
                    estaNaLista ? btnHeroList.classList.add('active') : btnHeroList.classList.remove('active');
                    btnHeroList.onclick = (e) => {
                        e.preventDefault();
                        window.toggleMinhaLista(item.id, btnHeroList);
                        setTimeout(sincronizarBotoesHero, 50);
                    };
                }
                
                if (btnHeroLike) {
                    deuLike ? btnHeroLike.classList.add('active') : btnHeroLike.classList.remove('active');
                    btnHeroLike.onclick = (e) => {
                        e.preventDefault();
                        window.toggleLike(item.id, btnHeroLike);
                        setTimeout(sincronizarBotoesHero, 50);
                    };
                }
            };
            sincronizarBotoesHero();
        };
        atualizarHero(heroIndex);
        heroIntervalId = setInterval(() => {
            heroIndex = (heroIndex + 1) % heroList.length;
            atualizarHero(heroIndex);
        }, 15000);
    }
    
    // Atualizar menus de gêneros
    atualizarMenuGenerosPC();
    
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
    
    // Se filtro for "minha-lista", só mostrar itens da lista
    if (interesseAtual === 'minha-lista') {
        if (listaIds.length > 0) {
            const itensLista = categories.flatMap(cat => cat.items).filter(item => item && item.id && listaIds.includes(item.id));
            if(itensLista.length > 0) {
                container.appendChild(createCarousel({ title: "Minha Lista", items: itensLista }));
                realizarScroll();
            } else {
                container.innerHTML = `<div class="no-results-container"><div class="no-results-content"><i class="fas fa-heart"></i><h2>Sua lista está vazia</h2><p>Comece a adicionar filmes e séries à sua lista!</p></div></div>`;
            }
        } else {
            container.innerHTML = `<div class="no-results-container"><div class="no-results-content"><i class="fas fa-heart"></i><h2>Sua lista está vazia</h2><p>Comece a adicionar filmes e séries à sua lista!</p></div></div>`;
        }
        return;
    }
    
    // Mostrar minha lista apenas quando filtro for "todos"
    if (listaIds.length > 0 && interesseAtual === 'todos') {
        const itensLista = categories.flatMap(cat => cat.items).filter(item => item && item.id && listaIds.includes(item.id));
        if(itensLista.length > 0) container.appendChild(createCarousel({ title: "Minha Lista", items: itensLista }));
    }

    // Se filtro for "dvd", mostrar apenas coleção DVD
    if (interesseAtual === 'dvd') {
        const dvdCategory = categories.find(cat => cat.title && normalizarTexto(cat.title).includes('dvd'));
        console.log('DVD - Procurando categoria:', dvdCategory?.title, 'Items:', dvdCategory?.items?.length);
        if (dvdCategory && dvdCategory.items.length > 0) {
            container.appendChild(createCarousel(dvdCategory));
            realizarScroll();
        } else {
            container.innerHTML = `<div class="no-results-container"><div class="no-results-content"><i class="fas fa-disc"></i><h2>Nenhum DVD disponível</h2><p>Confira as outras categorias!</p></div></div>`;
        }
        return;
    }

    categories.forEach(cat => {
        // Excluir categoria DVD da renderização geral (mostrar apenas quando filtro for 'dvd')
        if (cat.title && normalizarTexto(cat.title).includes('dvd')) return;
        
        const filtrados = cat.items.filter(item => {
            if (!item) return false;
            let passaPrivacidade = !item.perfil || (item.perfil.toLowerCase() === nomePerfil.toLowerCase());
            let passaInteresse = false;
            
            if (interesseAtual === 'todos') {
                passaInteresse = true;
            } else if (interesseAtual === 'serie' || interesseAtual === 'series' || interesseAtual === 'série') {
                passaInteresse = item.tipo && normalizarTexto(item.tipo) === 'serie';
            } else if (interesseAtual === 'filme' || interesseAtual === 'filmes') {
                passaInteresse = item.tipo && normalizarTexto(item.tipo) === 'filme';
            } else {
                // Filtro por gênero - busca parcial/includes
                passaInteresse = item.genero && normalizarTexto(item.genero).includes(normalizarTexto(interesseAtual));
            }
            
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
    const filme = categories.flatMap(c => c.items).find(i => i.id === id);
    const wasLiked = likes.includes(id);
    
    if (wasLiked) { 
        likes = likes.filter(i => i !== id); 
        if (btn) btn.style.setProperty('color', 'white', 'important');
    }
    else { 
        likes.push(id); 
        if (btn) btn.style.setProperty('color', '#a855f7', 'important');
        animacaoLikeSocial(btn);
        // Notificar quando dá like
        if (filme) {
            adicionarNotificacao(
                '❤️ Você classificou',
                `"${filme.title}" foi classificado!`,
                'fa-thumbs-up'
            );
        }
    }
    StorageMgr.setLikes(likes);
    
    // Sincronizar hero se este filme estiver no hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && filme && heroTitle.textContent === filme.title) {
        const btnHeroLike = document.querySelector('.btn-hero-like');
        if (btnHeroLike) {
            if (!wasLiked) {
                btnHeroLike.classList.add('active');
            } else {
                btnHeroLike.classList.remove('active');
            }
        }
    }
};

window.toggleMinhaLista = (id, btn) => {
    let lista = StorageMgr.getLista();
    const icon = btn ? btn.querySelector('i') : null;
    const filme = categories.flatMap(c => c.items).find(i => i.id === id);
    let adicionou = false;
    
    if (lista.includes(id)) { 
        lista = lista.filter(i => i !== id); 
        if(icon) icon.className = 'fas fa-plus'; 
    } else { 
        lista.push(id); 
        if(icon) icon.className = 'fas fa-check'; 
        adicionou = true;
        // Notificar quando adiciona à lista
        if (filme) {
            adicionarNotificacao(
                '✓ Adicionado com sucesso',
                `"${filme.title}" foi adicionado à sua lista!`,
                'fa-list'
            );
        }
    }
    StorageMgr.setLista(lista);
    
    // Sincronizar hero se este filme estiver no hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && filme && heroTitle.textContent === filme.title) {
        const btnHeroList = document.querySelector('.btn-hero-list');
        if (btnHeroList) {
            if (adicionou) {
                btnHeroList.classList.add('active');
                const heroIcon = btnHeroList.querySelector('i');
                if (heroIcon) heroIcon.className = 'fas fa-check';
            } else {
                btnHeroList.classList.remove('active');
                const heroIcon = btnHeroList.querySelector('i');
                if (heroIcon) heroIcon.className = 'fas fa-plus';
            }
        }
    }
    
    // Mostrar notificação se adicionou
    if (adicionou) {
        mostrarNotificacaoLista();
    }
};

// Função para mostrar notificação de "Adicionado à lista"
window.mostrarNotificacaoLista = () => {
    const notif = document.createElement('div');
    notif.className = 'notificacao-lista';
    notif.innerHTML = `<i class="fas fa-check"></i> <span>Adicionado a sua lista!</span>`;
    document.body.appendChild(notif);
    
    // Aparecer com animação
    setTimeout(() => notif.classList.add('visible'), 10);
    
    // Desaparecer após 3 segundos
    setTimeout(() => {
        notif.classList.remove('visible');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
};
// 1. Função global de filtro (Conserta o scroll do PC)
window.mudarFiltro = (g) => {
    console.log('Mudando filtro para:', g);
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
        atualizarMenuGenerosMobile(menu);
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
    const navSelect = document.querySelector('.mobile-nav-select');
    box.classList.toggle('active');
    if (box.classList.contains('active')) {
        input.focus();
        // Esconder "Navegar" quando pesquisa abre no mobile
        if (navSelect && window.innerWidth <= 768) {
            navSelect.style.display = 'none';
        }
    } else {
        // Mostrar "Navegar" quando pesquisa fecha
        if (navSelect && window.innerWidth <= 768) {
            navSelect.style.display = 'flex';
        }
    }
};

window.executarBusca = () => { const input = document.getElementById('search-input'); if (input) renderizarConteudo(input.value, true); };

document.getElementById('search-input')?.addEventListener('input', () => window.executarBusca());
document.getElementById('search-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const box = document.querySelector('.search-box');
        const navSelect = document.querySelector('.mobile-nav-select');
        box.classList.remove('active');
        box.querySelector('input').value = '';
        renderizarConteudo('', false);
        // Mostrar "Navegar" novamente
        if (navSelect && window.innerWidth <= 768) {
            navSelect.style.display = 'flex';
        }
    }
});

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES 🔔
// ============================================================================

// 📦 Gerar notificações automáticas de novos filmes do data.js
function gerarNotificacoesAutomaticas() {
    const todosFilmes = categories.flatMap(cat => cat.items);
    const filmesComBadge = todosFilmes.filter(f => f.badge && (f.badge.toLowerCase().includes('novo') || f.badge.toLowerCase().includes('novidade')));
    
    filmesComBadge.forEach(filme => {
        if (!localStorage.getItem(`notif_seen_${filme.id}`)) {
            adicionarNotificacao(
                `🎬 ${filme.badge.toUpperCase()}`,
                `${filme.title} já está disponível!`,
                'fa-film'
            );
            localStorage.setItem(`notif_seen_${filme.id}`, 'true');
        }
    });
}

// 📦 ARRAY DE NOTIFICAÇÕES
let notificacoes = JSON.parse(localStorage.getItem('notificacoes_app')) || [];

// Gerar notificações ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (notificacoes.length === 0) {
        gerarNotificacoesAutomaticas();
    }
});

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
function limparTodosNotificacoes() {
    notificacoes = [];
    StorageMgr.set('notificacoes', []);
    renderizarNotificacoes();
    atualizarBadgeNotificacoes();
}

function renderizarNotificacoes() {
    const dropdown = document.querySelector('.notification-dropdown');
    if (!dropdown) return;

    // CABEÇALHO DO DROPDOWN
    let html = `<div class="notification-header">
        <span>Notificações</span>
        <div class="notification-header-buttons">
            <button onclick="marcarTodasComoLidas()" title="Marcar tudo como lido">Marcar tudo como lido</button>
            <button onclick="limparTodosNotificacoes()" title="Limpar todas as notificações" class="btn-delete-notifications">
                <i class="fas fa-trash"></i>
            </button>
        </div>
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
            html += `<div class="notification-item ${classe}" data-id="${notif.id}" onclick="abrirNotificacao(${notif.id})">
                <div class="notification-icon">
                    <i class="fas ${notif.icone}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.titulo}</div>
                    <div class="notification-text">${notif.mensagem}</div>
                    <div class="notification-time">${notif.tempo}</div>
                </div>
                <button class="notification-delete-btn" data-id="${notif.id}" title="Excluir notificação">
                    <i class="fas fa-times"></i>
                </button>
            </div>`;
        });
    }

    dropdown.innerHTML = html;
    
    // Adicionar event listeners para botões de exclusão
    document.querySelectorAll('.notification-delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            excluirNotificacao(id);
        });
    });
}

/** 
 * �️ EXCLUI UMA NOTIFICAÇÃO ESPECÍFICA
 * Removido do array de notificações quando usuário clica no X
 * 
 * @param {number} id - ID da notificação a excluir
 */
function excluirNotificacao(id) {
    // Remover a notificação do array
    notificacoes = notificacoes.filter(n => n.id !== id);
    
    // Salvar e atualizar UI
    salvarNotificacoes();
    atualizarBadgeNotificacoes();
    renderizarNotificacoes();
}

/** 
 * �🔔 ABRE/FECHA O DROPDOWN DE NOTIFICAÇÕES
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
