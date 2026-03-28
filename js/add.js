document.addEventListener('DOMContentLoaded', () => {

	const modal = document.getElementById('modal-perfil');
	const btnCancelar = document.getElementById('cancelar');
	const btnSalvar = document.getElementById('salvar');
	const inputNome = document.getElementById('nome-perfil-input');
	const avatarOptions = document.querySelectorAll('.avatar-option');
	const listaPerfis = document.querySelector('.listas-perfis');

	let avatarSelecionado = '';

	// 🔓 Abrir modal ao clicar em "Adicionar perfil"
	const adicionarPerfil = document.querySelector('li.profile:last-child');

	adicionarPerfil.addEventListener('click', () => {
		modal.classList.remove('hidden');
	});

	//  Cancelar
	btnCancelar.addEventListener('click', () => {
		modal.classList.add('hidden');
	});

	//  Selecionar avatar
	avatarOptions.forEach(img => {
		img.addEventListener('click', () => {
			avatarOptions.forEach(i => i.classList.remove('selected'));
			img.classList.add('selected');
			avatarSelecionado = img.getAttribute('src');
		});
	});

	// 💾 Salvar perfil
	btnSalvar.addEventListener('click', () => {
		const nome = inputNome.value.trim();

		if (!nome || !avatarSelecionado) {
			alert('Preencha o nome e escolha um avatar para entrar no universo de doctor who!');
			return;
		}

		// Criar novo perfil na tela
		const novoPerfil = document.createElement('li');
		novoPerfil.classList.add('profile');

		novoPerfil.innerHTML = `
			<a href="../catalogo/catalogo.html" class="profile-link">
				<figure>
					<img src="${avatarSelecionado}" width="128" height="128">
					<figcaption>${nome}</figcaption>
				</figure>
			</a>
		`;

		// Inserir antes do botão "Adicionar perfil"
		listaPerfis.insertBefore(novoPerfil, adicionarPerfil);

		// Reset
		inputNome.value = '';
		avatarSelecionado = '';
		avatarOptions.forEach(i => i.classList.remove('selected'));
		modal.classList.add('hidden');
	});
});