document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('table-body');
    const input = document.getElementById('input-busca');
    const select = document.getElementById('select-filtro');
    const deleteModal = document.getElementById('delete-modal');
    const deleteForm = document.getElementById('delete-form');
    const usuarioNifElement = document.getElementById('usuario-nif');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNumbers = document.getElementById('page-numbers');
    const itemsPerPageSelect = document.getElementById('items-per-page');
    const paginationInfoText = document.getElementById('pagination-info-text');

    // Paginação
    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value);
    let allRows = Array.from(tableBody.querySelectorAll('tr.main-row')).map(row => ({
        mainRow: row
    }));
    let filteredRows = [...allRows];

    // Mostrar linhas da página atual
    function showCurrentPage() {
        allRows.forEach(pair => {
            pair.mainRow.style.display = 'none';
        });

        const totalItems = filteredRows.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        filteredRows.slice(start, end).forEach(pair => {
            pair.mainRow.style.display = '';
        });

        // Atualizar info e botões
        const startItem = totalItems === 0 ? 0 : start + 1;
        const endItem = Math.min(end, totalItems);
        paginationInfoText.textContent = `Mostrando ${startItem}-${endItem} de ${totalItems} usuários`;

        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;

        updatePageNumbers(totalPages);
    }

    // Números de página
    function updatePageNumbers(totalPages) {
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-2 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                showCurrentPage();
            });
            pageNumbers.appendChild(btn);
        }
    }

    // Filtrar tabela mantendo a página
    function filtrarTabela() {
        const busca = input.value.toLowerCase();
        const filtro = select.value;
        const oldPage = currentPage;

        filteredRows = allRows.filter(pair => {
            const nif = (pair.mainRow.dataset.nif || '').toLowerCase();
            const cargo = pair.mainRow.dataset.cargo;

            let mostrar = true;
            if (busca && !nif.includes(busca)) mostrar = false;
            if (filtro !== 'todos' && cargo !== filtro) mostrar = false;

            return mostrar;
        });

        const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
        currentPage = Math.min(oldPage, totalPages === 0 ? 1 : totalPages);

        showCurrentPage();
    }

    // Modal de deleção
    document.addEventListener('click', function(event) {
        if (event.target.closest('.delete-btn')) {
            const deleteBtn = event.target.closest('.delete-btn');
            const usuarioId = deleteBtn.getAttribute('data-id');
            const usuarioNif = deleteBtn.getAttribute('data-nif');
            usuarioNifElement.textContent = usuarioNif;
            deleteForm.action = `/usuarios/delete/${usuarioId}`;
            deleteModal.classList.remove('hidden');
        }
    });

    function closeModal() {
        deleteModal.classList.add('hidden');
    }
    cancelDeleteBtn.addEventListener('click', closeModal);
    deleteModal.addEventListener('click', function(event) {
        if (event.target === deleteModal) closeModal();
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !deleteModal.classList.contains('hidden')) closeModal();
    });

    // Eventos de paginação e filtro
    input.addEventListener('input', filtrarTabela);
    select.addEventListener('change', filtrarTabela);
    prevBtn.addEventListener('click', () => { if(currentPage>1){currentPage--;showCurrentPage();} });
    nextBtn.addEventListener('click', () => { const totalPages = Math.ceil(filteredRows.length/itemsPerPage); if(currentPage<totalPages){currentPage++;showCurrentPage();} });
    itemsPerPageSelect.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage=1; showCurrentPage(); });

    // Inicializa exibição
    showCurrentPage();
});

// Navegação lateral
const sideNav = document.getElementById('side-nav');
const body = document.body;

sideNav.addEventListener('mouseenter', () => { body.style.paddingLeft = '250px'; });
sideNav.addEventListener('mouseleave', () => { body.style.paddingLeft = '72px'; });