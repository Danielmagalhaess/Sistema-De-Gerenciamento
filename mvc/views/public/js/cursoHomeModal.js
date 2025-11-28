document.addEventListener('DOMContentLoaded', function () {
        
    // Função para mostrar modal
    function showDeleteModal(id, nome) {
        document.getElementById('cursoNome').textContent = nome;
        document.getElementById('deleteModal').classList.remove('hidden');

        document.getElementById('confirmDelete').onclick = function () {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/curso/nome/deletar/${id}`;
            document.body.appendChild(form);
            form.submit();
        };
    }

    // Event listeners para botões de deletar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const nome = this.dataset.nome;
            showDeleteModal(id, nome);
        });
    });

    // Fechar modal ao clicar no X
    document.getElementById('closeModal').addEventListener('click', function () {
        document.getElementById('deleteModal').classList.add('hidden');
    });

    // Fechar modal ao clicar em cancelar
    document.getElementById('cancelDelete').addEventListener('click', function () {
        document.getElementById('deleteModal').classList.add('hidden');
    });

    // Fechar modal ao clicar fora do conteúdo
    document.getElementById('deleteModal').addEventListener('click', function (e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });

    // Expansão lateral
    const sideNav = document.getElementById('side-nav');
    const body = document.body;
    sideNav.addEventListener('mouseenter', () => { body.style.paddingLeft = '240px'; });
    sideNav.addEventListener('mouseleave', () => { body.style.paddingLeft = '72px'; });

});