import { createCard } from './Card.js';

export function createCarousel(category) {
    // Se não houver itens na categoria, não renderiza nada para evitar erros
    if (!category.items || category.items.length === 0) return document.createElement('div');

    const section = document.createElement('div');
    section.className = 'slider-section';

    // 1. Header para Título e Indicadores
    const header = document.createElement('div');
    header.className = 'slider-header';

    const title = document.createElement('h2');
    title.className = 'slider-title';
    title.innerText = category.title;

    const indicators = document.createElement('div');
    indicators.className = 'slider-indicators';

    header.appendChild(title);
    header.appendChild(indicators);
    section.appendChild(header);

    // 2. Wrapper para setas e row (essencial para posicionar as setas)
    const wrapper = document.createElement('div');
    wrapper.className = 'carousel-wrapper';

    // 3. A Row de Filmes (Criada antes para ser usada no onclick das setas)
    const row = document.createElement('div');
    row.className = 'movie-row';

    // 4. Botão Esquerdo (Handle Prev)
    const btnPrev = document.createElement('button');
    btnPrev.className = 'handle handle-prev';
    btnPrev.setAttribute('aria-label', 'Rolar para esquerda');
    btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    // Mágica do Scroll: Move 70% da largura da tela do usuário
    btnPrev.onclick = () => {
        row.scrollBy({ left: -window.innerWidth * 0.7, behavior: 'smooth' });
    };

    // 5. Botão Direito (Handle Next)
    const btnNext = document.createElement('button');
    btnNext.className = 'handle handle-next';
    btnNext.setAttribute('aria-label', 'Rolar para direita');
    btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    btnNext.onclick = () => {
        row.scrollBy({ left: window.innerWidth * 0.7, behavior: 'smooth' });
    };

    // 6. Adiciona os cards na Row
    category.items.forEach(item => {
        const card = createCard(item);
        row.appendChild(card);
    });

    // 7. Montagem Final da Estrutura (Ordem correta: Seta Esq -> Row -> Seta Dir)
    wrapper.appendChild(btnPrev);
    wrapper.appendChild(row);
    wrapper.appendChild(btnNext);
    
    section.appendChild(wrapper);

    return section;
}