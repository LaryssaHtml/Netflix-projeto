document.addEventListener('DOMContentLoaded', () => {

  const PERFIS_KEY = 'doctorflix_perfis_criados';
  const PERFIS_PADRAO = ['Doutor', 'Rose Tyler', 'Dalek']; // Perfis que não podem ser deletados

  const listaPerfis = document.querySelector('.listas-perfis');
  const addPerfil = document.querySelector('.add-profile');
  const btnGerenciarPerfis = document.querySelector('.manage-profiles');

  const modal = document.getElementById('modal-perfil');
  const btnCancelar = document.getElementById('cancelar');
  const btnSalvar = document.getElementById('salvar');
  const inputNome = document.getElementById('nome-perfil-input');
  const avatarOptions = document.querySelectorAll('.avatar-option');

  let avatarSelecionado = '';
  let modoEdicao = false; // Estado do modo edição

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

  // ✏️ MODO EDIÇÃO - Toggle
  function toggleModoEdicao() {
    const perfisCriados = carregarPerfis();
    
    // Desabilitar se não há perfis criados
    if (perfisCriados.length === 0) {
      if (window.showNoProfilesModal) {
        window.showNoProfilesModal();
      } else {
        alert('Nenhum perfil criado para gerenciar.');
      }
      return;
    }
    
    modoEdicao = !modoEdicao;
    
    if (modoEdicao) {
      btnGerenciarPerfis.classList.add('active');
      btnGerenciarPerfis.textContent = '✕ Cancelar Gerenciamento';
    } else {
      btnGerenciarPerfis.classList.remove('active');
      btnGerenciarPerfis.textContent = 'Gerenciar perfis';
    }
    
    // Aplicar ou remover modo edição em cada perfil
    document.querySelectorAll('.profile-dinamico').forEach(profile => {
      if (modoEdicao) {
        profile.classList.add('edit-mode');
      } else {
        profile.classList.remove('edit-mode');
      }
    });
  }

  // 🗑️ DELETAR PERFIL
  function deletarPerfil(nomePerfil, evento) {
    evento.preventDefault();
    evento.stopPropagation();
    
    // Proteção: não permitir deletar perfis padrão
    if (PERFIS_PADRAO.includes(nomePerfil)) {
      if (window.showConfirmation) {
        window.showConfirmation(
          'Perfil Protegido',
          `${nomePerfil} é um perfil padrão e não pode ser removido.`,
          null,
          null
        );
      } else {
        alert(`${nomePerfil} é um perfil padrão e não pode ser deletado!`);
      }
      return;
    }

    // Usar modal customizado se disponível
    if (window.showConfirmation) {
      window.showConfirmation(
        'Remover Perfil',
        `Tem certeza que deseja remover o perfil "${nomePerfil}"? Esta ação não pode ser desfeita.`,
        () => {
          // Callback ao confirmar
          let perfis = carregarPerfis();
          perfis = perfis.filter(p => p.nome !== nomePerfil);
          salvarPerfis(perfis);
          
          // Se foi o perfil ativo, limpar
          if (localStorage.getItem('perfilAtivoNome') === nomePerfil) {
            localStorage.removeItem('perfilAtivoNome');
            localStorage.removeItem('perfilAtivoImagem');
          }
          
          renderizarPerfis();
          
          // RESET: Voltar modo edição ao normal
          modoEdicao = false;
          btnGerenciarPerfis.classList.remove('active');
          btnGerenciarPerfis.textContent = 'Gerenciar perfis';
          document.querySelectorAll('.profile-dinamico').forEach(profile => {
            profile.classList.remove('edit-mode');
          });
        },
        null
      );
    } else {
      // Fallback para confirm() se modal não existir
      if (confirm(`Deseja deletar o perfil "${nomePerfil}"? Esta ação não pode ser desfeita.`)) {
        let perfis = carregarPerfis();
        perfis = perfis.filter(p => p.nome !== nomePerfil);
        salvarPerfis(perfis);
        
        if (localStorage.getItem('perfilAtivoNome') === nomePerfil) {
          localStorage.removeItem('perfilAtivoNome');
          localStorage.removeItem('perfilAtivoImagem');
        }
        
        renderizarPerfis();
        
        // RESET: Voltar modo edição ao normal
        modoEdicao = false;
        btnGerenciarPerfis.classList.remove('active');
        btnGerenciarPerfis.textContent = 'Gerenciar perfis';
        document.querySelectorAll('.profile-dinamico').forEach(profile => {
          profile.classList.remove('edit-mode');
        });
      }
    }
  }

  // 🧩 criar perfil visual
  function criarCardPerfil(perfil) {
    const li = document.createElement('li');
    li.className = 'profile profile-dinamico';

    li.innerHTML = `
      <a href="catalogo.html" class="profile-link">
        <figure>
          <img src="${perfil.imagem}" width="128" height="128">
          <figcaption>${perfil.nome}</figcaption>
        </figure>
      </a>
      <button class="profile-delete-btn" title="Deletar perfil" aria-label="Deletar ${perfil.nome}">
        <i class="fas fa-trash"></i>
      </button>
    `;

    // Salvar perfil ativo ao clicar
    const link = li.querySelector('.profile-link');
    link.addEventListener('click', () => {
      if (!modoEdicao) {
        salvarPerfilAtivo(perfil.nome, perfil.imagem);
      }
    });

    // Deletar perfil ao clicar no ícone de lixeira
    const deleteBtn = li.querySelector('.profile-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        deletarPerfil(perfil.nome, e);
      });
    }

    // Aplicar classe de edição se estiver em modo edição
    if (modoEdicao) {
      li.classList.add('edit-mode');
    }

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

  // 🎯 EVENT LISTENERS
  
  // Botão Gerenciar Perfis
  if (btnGerenciarPerfis) {
    btnGerenciarPerfis.addEventListener('click', toggleModoEdicao);
  }

  // Abrir modal de adicionar perfil
  if (addPerfil) {
    addPerfil.addEventListener('click', () => {
      if (!modoEdicao) {
        modal.classList.remove('hidden');
      }
    });
  }

  // Cancelar modal
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  // Escolher avatar
  avatarOptions.forEach(img => {
    img.addEventListener('click', () => {
      avatarOptions.forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');
      avatarSelecionado = img.getAttribute('src');
    });
  });

  // Salvar novo perfil
  if (btnSalvar) {
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

      // Salva como ativo também
      salvarPerfilAtivo(novoPerfil.nome, novoPerfil.imagem);

      renderizarPerfis();
      modal.classList.add('hidden');

      inputNome.value = '';
      avatarSelecionado = '';
      avatarOptions.forEach(i => i.classList.remove('selected'));
    });
  }

  // PERFIS ORIGINAIS (Doutor, Rose, etc)
  document.querySelectorAll('.profile-link').forEach(link => {
    link.addEventListener('click', () => {
      if (modoEdicao) return; // Não fazer nada em modo edição
      
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