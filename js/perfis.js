document.addEventListener('DOMContentLoaded', () => {

  const PERFIS_KEY = 'doctorflix_perfis_criados';

  const listaPerfis = document.querySelector('.listas-perfis');
  const addPerfil = document.querySelector('.add-profile');

  const modal = document.getElementById('modal-perfil');
  const btnCancelar = document.getElementById('cancelar');
  const btnSalvar = document.getElementById('salvar');
  const inputNome = document.getElementById('nome-perfil-input');
  const avatarOptions = document.querySelectorAll('.avatar-option');

  let avatarSelecionado = '';

  // 🧠 carregar perfis salvos
  function carregarPerfis() {
    try {
      return JSON.parse(sessionStorage.getItem(PERFIS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function salvarPerfis(perfis) {
    sessionStorage.setItem(PERFIS_KEY, JSON.stringify(perfis));
  }

  // 🎯 SALVAR PERFIL ATIVO (SEU SISTEMA ORIGINAL)
  function salvarPerfilAtivo(nome, imagem) {
    localStorage.setItem('perfilAtivoNome', nome);
    localStorage.setItem('perfilAtivoImagem', imagem);
  }

  // 🧩 criar perfil visual
  function criarCardPerfil(perfil) {
    const li = document.createElement('li');
    li.className = 'profile profile-dinamico';

    li.innerHTML = `
      <a href="../catalogo/catalogo.html" class="profile-link">
        <figure>
          <img src="${perfil.imagem}" width="128" height="128">
          <figcaption>${perfil.nome}</figcaption>
        </figure>
      </a>
    `;

    //  MUITO IMPORTANTE
    const link = li.querySelector('.profile-link');
    link.addEventListener('click', () => {
      salvarPerfilAtivo(perfil.nome, perfil.imagem);
    });

    return li;
  }

  //  renderizar todos perfis
  function renderizarPerfis() {
    document.querySelectorAll('.profile-dinamico').forEach(el => el.remove());

    const perfis = carregarPerfis();

    perfis.forEach(perfil => {
      const card = criarCardPerfil(perfil);
      listaPerfis.insertBefore(card, addPerfil);
    });
  }

  //  abrir modal
  addPerfil.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  //  cancelar
  btnCancelar.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  //  escolher avatar
  avatarOptions.forEach(img => {
    img.addEventListener('click', () => {
      avatarOptions.forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');
      avatarSelecionado = img.getAttribute('src');
    });
  });

  //  salvar novo perfil
  btnSalvar.addEventListener('click', () => {
    const nome = inputNome.value.trim();

    if (!nome || !avatarSelecionado) {
      alert('Preencha o nome e escolha um avatar para entrar no universo de doctor who!');
      return;
    }

    const novoPerfil = {
      nome,
      imagem: avatarSelecionado
    };

    const perfis = carregarPerfis();
    perfis.push(novoPerfil);
    salvarPerfis(perfis);

    //  salva como ativo também
    salvarPerfilAtivo(novoPerfil.nome, novoPerfil.imagem);

    renderizarPerfis();
    modal.classList.add('hidden');

    inputNome.value = '';
    avatarSelecionado = '';
    avatarOptions.forEach(i => i.classList.remove('selected'));
  });

  //  PERFIS ORIGINAIS (Doutor, Rose, etc)
  document.querySelectorAll('.profile-link').forEach(link => {
    link.addEventListener('click', () => {
      const item = link.closest('.profile');
      if (!item) return;

      const nomeEl = item.querySelector('figcaption');
      const imgEl = item.querySelector('img');

      const nome = nomeEl ? nomeEl.textContent.trim() : '';
      const imgSrc = imgEl ? imgEl.getAttribute('src') : '';

      salvarPerfilAtivo(nome, imgSrc);
    });
  });

  // 🚀 carregar ao abrir página
  renderizarPerfis();

});