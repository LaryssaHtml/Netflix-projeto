const modal = document.getElementById('modal');
const modalVideo = document.getElementById('modal-video');
const modalPoster = document.getElementById('modal-poster');
const innerPlay = document.getElementById('inner-play');

const btnInfo = document.querySelector('.btn-info');
const btnPlay = document.querySelector('.btn-play');
const closeBtn = document.querySelector('.close-btn');

const URL_VIDEO = "https://www.youtube.com/embed/uw72J3WYxLI?autoplay=1";

// FUNÇÃO PARA FECHAR (Limpa tudo)
function fecharTudo() {
  modal.style.display = 'none';
  modalVideo.src = ""; // Para o som
  modalVideo.style.display = 'none';
  modalPoster.style.display = 'none';
  innerPlay.style.display = 'none';
}

// Evento do botão X
closeBtn.addEventListener('click', fecharTudo);

// Fechar ao clicar fora da caixa preta
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    fecharTudo();
  }
});

// CLICOU EM MAIS INFORMAÇÕES
btnInfo.addEventListener('click', () => {
  modal.style.display = 'flex';
  modalVideo.style.display = 'none';
  modalVideo.src = ""; 
  
  modalPoster.style.display = 'block';
  innerPlay.style.display = 'block';
});

// CLICOU EM ASSISTIR
function abrirVideo() {
  modal.style.display = 'flex';
  modalPoster.style.display = 'none';
  innerPlay.style.display = 'none';
  
  modalVideo.style.display = 'block';
  modalVideo.src = URL_VIDEO;
}

btnPlay.addEventListener('click', abrirVideo);
innerPlay.addEventListener('click', abrirVideo);