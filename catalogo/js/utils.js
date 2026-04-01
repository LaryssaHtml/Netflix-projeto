export function getYouTubeId(url) {
    if (!url) return "7RUA0IOfar8";
    if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
    return url.split('/').pop();
}

/**
 * Remove nomes duplicados do elenco
 * @param {string} elenco - String com nomes separados por vírgula
 * @returns {string} - String com nomes únicos
 */
export function removerDuplicatasElenco(elenco) {
    if (!elenco) return "";
    const nomes = elenco.split(',').map(nome => nome.trim());
    const nomesUnicos = [...new Set(nomes)];
    return nomesUnicos.join(', ');
}

const RANDOM_DATA = {
    atores: [['Ncuti Gatwa', 'Millie Gibson', 'Jinkx Monsoon'], ['Pearl Mackie', 'Matt Smith', 'Karen Gillan'], ['Peter Capaldi', 'Jenna Coleman', 'Michelle Gomez'], ['David Tennant', 'Catherine Tate', 'Freema Agyeman'], ['Jodie Whittaker', 'Tosin Cole', 'Mandip Gill'], ['Sylvester McCoy', 'Sophie Aldred', 'Andrew Cartmel']],
    classificacoes: ['L', '10', '12', '14', '16', '18'],
    badges: [{ text: 'A16', class: 'red-accent' }, { text: '16', class: '' }],
    getRandomElenco() { return this.atores[Math.floor(Math.random() * this.atores.length)].join(', '); },
    getRandomClassificacao() { return this.classificacoes[Math.floor(Math.random() * this.classificacoes.length)]; },
    getRandomBadge() { return this.badges[Math.random() > 0.5 ? 0 : 1]; }
};

export const getRandomMatchScore = () => Math.floor(Math.random() * 20 + 80);
export const getRandomDuration = (hasProgress) => hasProgress ? '3 temporadas' : '1h' + Math.floor(Math.random() * 59) + 'm';
export const getRandomAgeBadge = () => RANDOM_DATA.getRandomBadge();
export const getRandomElenco = () => RANDOM_DATA.getRandomElenco();
export const getRandomClassificacao = () => RANDOM_DATA.getRandomClassificacao();
