import { categories } from './data.js';
import { createCarousel } from './components/Carousel.js';

// Função Auxiliar: Limpa acentos e evita erros se o texto for nulo
function normalizarTexto(texto) {
    if (!texto) return ""; // Se o texto for undefined ou null, retorna vazio em vez de quebrar
    return texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

document.addEventListener('DOMContentLoaded', () => {
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    const imagemPerfil = localStorage.getItem('perfilAtivoImagem');

    if (nomePerfil && imagemPerfil) {
        const kidsLink = document.querySelector('.kids-link');
        const profileIcon = document.querySelector('.profile-icon');
        if (kidsLink) kidsLink.textContent = nomePerfil;
        if (profileIcon) profileIcon.src = imagemPerfil;
    }

    renderizarConteudo();
});

function renderizarConteudo(filtroBusca = "") {
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    const interesseAtual = localStorage.getItem(`interesse_${nomePerfil}`) || 'todos';
    const container = document.getElementById('main-content');
    
    if (!container) return;
    container.innerHTML = ''; 

    // --- LÓGICA DE BUSCA ---
    if (filtroBusca) {
        const termo = normalizarTexto(filtroBusca);
        const todosOsItens = categories.flatMap(cat => cat.items);
        
        const resultados = todosOsItens.filter(item => {
            // SEGURANÇA: Verificamos se o campo existe antes de tentar tratar
            const titulo = item.title ? normalizarTexto(item.title) : "";
            
            // Aqui corrigimos o erro do console: garantimos que item.id existe
            const idBruto = item.id ? item.id : ""; 
            const idLimpo = normalizarTexto(idBruto.replace(/-/g, ' '));
            
            const genero = item.genero ? normalizarTexto(item.genero) : "";

            return titulo.includes(termo) || idLimpo.includes(termo) || genero.includes(termo);
        });

        const buscaUnica = Array.from(new Map(resultados.map(item => [item.id, item])).values());

        if (buscaUnica.length > 0) {
            container.appendChild(createCarousel({ 
                title: `Resultados para: ${filtroBusca}`, 
                items: buscaUnica 
            }));
        } else {
            container.innerHTML = `<div style="padding: 100px; text-align: center; color: white;">
                <h2>Nenhum resultado para "${filtroBusca}"</h2>
                <p>Verifique se os IDs e Titles estão corretos no seu arquivo de dados.</p>
            </div>`;
        }
        return; 
    }

    // --- LÓGICA NORMAL ---
    const listaIds = JSON.parse(localStorage.getItem(`lista_${nomePerfil}`)) || [];
    
    if (listaIds.length > 0 && (interesseAtual === 'todos' || interesseAtual === 'minha-lista')) {
        const todos = categories.flatMap(cat => cat.items);
        const itensLista = todos.filter(item => item && item.id && listaIds.includes(item.id));
        const listaUnica = Array.from(new Map(itensLista.map(i => [i.id, i])).values());
        
        container.appendChild(createCarousel({ title: "Minha Lista", items: listaUnica }));
    }

    if (interesseAtual === 'minha-lista') return;

    categories.forEach(categoriaOriginal => {
        const filtrados = categoriaOriginal.items.filter(item => {
            if (!item) return false;
            let passaPrivacidade = !item.perfil || (nomePerfil && item.perfil.toLowerCase() === nomePerfil.toLowerCase());
            let passaInteresse = (interesseAtual === 'todos' || 
                (item.genero && normalizarTexto(item.genero) === normalizarTexto(interesseAtual)));
            
            return passaPrivacidade && passaInteresse;
        });

        if (filtrados.length > 0) {
            container.appendChild(createCarousel({ ...categoriaOriginal, items: filtrados }));
        }
    });
}

// Funções globais (Lupa e Filtros) - Mantive as mesmas que você já tem
window.toggleSearch = () => {
    const box = document.querySelector('.search-box');
    const input = document.getElementById('search-input');
    box.classList.toggle('active');
    if (box.classList.contains('active')) {
        input.focus();
    } else {
        input.value = '';
        renderizarConteudo();
    }
};

window.executarBusca = () => {
    const input = document.getElementById('search-input');
    renderizarConteudo(input.value);
};

window.mudarFiltro = (genero) => {
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    localStorage.setItem(`interesse_${nomePerfil}`, genero);
    location.reload();
};

window.toggleMinhaLista = (idFilme, botao) => {
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    let lista = JSON.parse(localStorage.getItem(`lista_${nomePerfil}`)) || [];
    const icone = botao.querySelector('i');

    if (lista.includes(idFilme)) {
        lista = lista.filter(id => id !== idFilme);
        if(icone) icone.className = 'fas fa-plus';
    } else {
        lista.push(idFilme);
        if(icone) icone.className = 'fas fa-check';
    }
    localStorage.setItem(`lista_${nomePerfil}`, JSON.stringify(lista));
};

window.toggleLike = (idFilme, botao) => {
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    let likes = JSON.parse(localStorage.getItem(`likes_${nomePerfil}`)) || [];
    if (likes.includes(idFilme)) {
        likes = likes.filter(id => id !== idFilme);
        botao.style.color = 'white';
    } else {
        likes.push(idFilme);
        botao.style.color = '#46d369';
    }
    localStorage.setItem(`likes_${nomePerfil}`, JSON.stringify(likes));
};