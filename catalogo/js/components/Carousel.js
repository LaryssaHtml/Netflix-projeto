import { createCard } from './Card.js';

export function createCarousel(category) {
    if (!category.items || category.items.length === 0) return document.createElement('div');

    const section = document.createElement('div');
    section.className = 'slider-section';

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

    const wrapper = document.createElement('div');
    wrapper.className = 'carousel-wrapper';

    const row = document.createElement('div');
    row.className = 'movie-row';

    const getScrollStep = () => Math.max(row.clientWidth * 0.85, 240);

    const btnPrev = document.createElement('button');
    btnPrev.className = 'handle handle-prev';
    btnPrev.setAttribute('aria-label', 'Rolar para esquerda');
    btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    btnPrev.onclick = () => {
        row.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    };

    const btnNext = document.createElement('button');
    btnNext.className = 'handle handle-next';
    btnNext.setAttribute('aria-label', 'Rolar para direita');
    btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
    btnNext.onclick = () => {
        row.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    };

    category.items.forEach(item => {
        const card = createCard(item);
        row.appendChild(card);
    });

    wrapper.appendChild(btnPrev);
    wrapper.appendChild(row);
    wrapper.appendChild(btnNext);

    section.appendChild(wrapper);

    return section;
}