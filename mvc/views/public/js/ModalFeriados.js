document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('tbody');
    const input = document.getElementById('input-busca');
    const select = document.getElementById('select-filtro');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNumbers = document.getElementById('page-numbers');
    const itemsPerPageSelect = document.getElementById('items-per-page');
    const paginationInfoText = document.getElementById('pagination-info-text');

    // Modal de deleção
    const deleteModal = document.getElementById('deleteModal');
    const deleteForm = document.getElementById('deleteForm');
    const holidayNameElement = document.getElementById('holidayNameToDelete');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    // Paginação
    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value);
    let allRows = Array.from(tableBody.querySelectorAll('tr.main-row')).map(row => ({
        mainRow: row,
        detailsRow: row.nextElementSibling
    }));
    let filteredRows = [...allRows];

    // Mostrar linhas da página atual
    function showCurrentPage() {
        allRows.forEach(pair => {
            pair.mainRow.style.display = 'none';
            if (pair.detailsRow) pair.detailsRow.style.display = 'none';
        });

        const totalItems = filteredRows.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        filteredRows.slice(start, end).forEach(pair => {
            pair.mainRow.style.display = '';
            if (pair.detailsRow && pair.detailsRow.querySelector('.details-container').classList.contains('open')) {
                pair.detailsRow.style.display = '';
            }
        });

        // Atualizar info e botões
        const startItem = totalItems === 0 ? 0 : start + 1;
        const endItem = Math.min(end, totalItems);
        paginationInfoText.textContent = `Mostrando ${startItem}-${endItem} de ${totalItems} feriados`;

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
            const nome = (pair.mainRow.dataset.nome || '').toLowerCase();
            const tipo = pair.mainRow.dataset.tipo;

            let mostrar = true;
            if (busca && !nome.includes(busca)) mostrar = false;
            if (filtro !== 'todos' && tipo !== filtro) mostrar = false;

            return mostrar;
        });

        const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
        currentPage = Math.min(oldPage, totalPages === 0 ? 1 : totalPages);

        showCurrentPage();
    }

    // Expandir/recolher detalhes
    tableBody.addEventListener('click', function (event) {
        const mainRow = event.target.closest('.main-row');
        if (!mainRow) return;
        if (event.target.closest('a') || event.target.closest('button')) return;
        const detailsRow = mainRow.nextElementSibling;
        const detailsContainer = detailsRow.querySelector('.details-container');
        const icon = mainRow.querySelector('.fa-chevron-down');
        if (detailsContainer) {
            detailsContainer.classList.toggle('open');
            icon.classList.toggle('rotate-180');
            detailsRow.style.display = detailsContainer.classList.contains('open') ? '' : 'none';
        }
    });

    // Modal de deleção
    document.addEventListener('click', function (event) {
        if (event.target.closest('.delete-btn')) {
            const deleteBtn = event.target.closest('.delete-btn');
            const feriadoId = deleteBtn.getAttribute('data-id');
            const feriadoNome = deleteBtn.getAttribute('data-nome');
            holidayNameElement.textContent = feriadoNome;
            deleteForm.action = `/feriados/delete/${feriadoId}`;
            deleteModal.classList.remove('hidden');
        }
    });

    function closeModal() {
        deleteModal.classList.add('hidden');
    }
    closeModalBtn.addEventListener('click', closeModal);
    cancelDeleteBtn.addEventListener('click', closeModal);
    deleteModal.addEventListener('click', function (event) {
        if (event.target === deleteModal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !deleteModal.classList.contains('hidden')) closeModal();
    });

    // Eventos de paginação e filtro
    input.addEventListener('input', filtrarTabela);
    select.addEventListener('change', filtrarTabela);
    prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; showCurrentPage(); } });
    nextBtn.addEventListener('click', () => { const totalPages = Math.ceil(filteredRows.length / itemsPerPage); if (currentPage < totalPages) { currentPage++; showCurrentPage(); } });
    itemsPerPageSelect.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 1; showCurrentPage(); });

    // Inicializa exibição
    showCurrentPage();
});

// Navegação lateral
const sideNav = document.getElementById('side-nav');
const body = document.body;

sideNav.addEventListener('mouseenter', () => { body.style.paddingLeft = '240px'; });
sideNav.addEventListener('mouseleave', () => { body.style.paddingLeft = '72px'; });