 // Função para mostrar modal de confirmação de exclusão
 function showDeleteModal(id, nome) {
    document.getElementById('docenteNome').textContent = nome;
    document.getElementById('deleteModal').classList.remove('hidden');

    // Configura o botão de confirmação
    document.getElementById('confirmDelete').onclick = function() {
        // Submete o formulário de deleção do docente
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/docentes/delete/${id}`;
        document.body.appendChild(form);
        form.submit();
    };
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Adiciona listener para todos os botões de deletar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evita abrir detalhes ao clicar
            const id = this.dataset.id;
            const nome = this.dataset.nome;
            showDeleteModal(id, nome);
        });
    });

    // Fechar modal ao clicar no "X"
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('deleteModal').classList.add('hidden');
    });

    // Fechar modal ao clicar em "Cancelar"
    document.getElementById('cancelDelete').addEventListener('click', function() {
        document.getElementById('deleteModal').classList.add('hidden');
    });

    // Fechar modal ao clicar fora do conteúdo
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
});

//Filtro
document.addEventListener('DOMContentLoaded', function() {
const buscaInput = document.getElementById('input-busca');
const filtroSelect = document.getElementById('select-filtro-area');
const tabela = document.querySelector('table tbody');
const linhas = Array.from(tabela.querySelectorAll('tr'));

function filtrarTabela() {
    const busca = buscaInput.value.toLowerCase();
    const filtroStatus = filtroSelect.value;

    linhas.forEach(linha => {
        const nome = linha.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const nif = linha.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const statusBadge = linha.querySelector('td:nth-child(3) .status-badge');
        const status = statusBadge ? statusBadge.textContent.trim().toLowerCase() : '';

        const combinaBusca = nome.includes(busca) || nif.includes(busca);
        const combinaStatus = filtroStatus === 'todos' || status === filtroStatus;

        linha.style.display = (combinaBusca && combinaStatus) ? '' : 'none';
    });
}

buscaInput.addEventListener('input', filtrarTabela);
filtroSelect.addEventListener('change', filtrarTabela);
});
document.addEventListener('DOMContentLoaded', function () {
const tabela = document.querySelector('table tbody');
const linhas = Array.from(tabela.querySelectorAll('tr'));
const info = document.getElementById('pagination-info-text');
const pageNumbers = document.getElementById('page-numbers');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const itemsPerPageSelect = document.getElementById('items-per-page');
const buscaInput = document.getElementById('input-busca');
const filtroSelect = document.getElementById('select-filtro-area');

let currentPage = 1;
let itemsPerPage = parseInt(itemsPerPageSelect.value);

function getLinhasFiltradas() {
const busca = buscaInput.value.toLowerCase();
const filtroStatus = filtroSelect.value;

return linhas.filter(linha => {
    const nome = linha.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || "";
    const nif = linha.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || "";
    const statusBadge = linha.querySelector('td:nth-child(3) .status-badge');
    const status = statusBadge ? statusBadge.textContent.trim().toLowerCase() : "";

    const combinaBusca = nome.includes(busca) || nif.includes(busca);
    const combinaStatus = filtroStatus === 'todos' || status === filtroStatus;

    return combinaBusca && combinaStatus;
});
}

function renderPagination() {
const linhasFiltradas = getLinhasFiltradas();
const totalItems = linhasFiltradas.length;
const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

// Corrige página atual se passar do limite
if (currentPage > totalPages) currentPage = totalPages;

// Esconde todas as linhas
linhas.forEach(l => l.style.display = 'none');

// Mostra apenas as da página atual
const start = (currentPage - 1) * itemsPerPage;
const end = currentPage * itemsPerPage;
linhasFiltradas.slice(start, end).forEach(l => l.style.display = '');

// Atualiza texto "Mostrando X–Y de Z"
const startItem = (totalItems === 0) ? 0 : start + 1;
const endItem = Math.min(end, totalItems);
info.textContent = `Mostrando ${startItem}-${endItem} de ${totalItems} docentes`;

// Atualiza botões anterior/próxima
prevBtn.disabled = (currentPage === 1);
nextBtn.disabled = (currentPage === totalPages);

// Renderiza números das páginas
pageNumbers.innerHTML = '';
for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `page-number ${i === currentPage ? 'active' : ''}`;
    btn.addEventListener('click', () => {
        currentPage = i;
        renderPagination();
    });
    pageNumbers.appendChild(btn);
}
}

// Eventos
prevBtn.addEventListener('click', () => {
if (currentPage > 1) {
    currentPage--;
    renderPagination();
}
});

nextBtn.addEventListener('click', () => {
const totalPages = Math.ceil(getLinhasFiltradas().length / itemsPerPage) || 1;
if (currentPage < totalPages) {
    currentPage++;
    renderPagination();
}
});

itemsPerPageSelect.addEventListener('change', () => {
itemsPerPage = parseInt(itemsPerPageSelect.value);
currentPage = 1;
renderPagination();
});

buscaInput.addEventListener('input', () => {
currentPage = 1;
renderPagination();
});

filtroSelect.addEventListener('change', () => {
currentPage = 1;
renderPagination();
});

// Inicializa
renderPagination();
});
// Navegação lateral
const sideNav = document.getElementById('side-nav');
const body = document.body;

sideNav.addEventListener('mouseenter', () => { body.style.paddingLeft = '240px'; });
sideNav.addEventListener('mouseleave', () => { body.style.paddingLeft = '72px'; });