document.addEventListener('DOMContentLoaded', function () {
    const filterIcon = document.getElementById('filter-icon');
    const yearFilter = document.getElementById('year-filter');
    const tbody = document.querySelector('tbody');

    // Pegar todas as linhas
    const allRows = Array.from(tbody.querySelectorAll('tr.main-row')).map(row => ({
        mainRow: row,
        detailsRow: row.nextElementSibling
    }));
    let filteredRows = [...allRows];

    // Coletar todos os anos
    const yearsSet = new Set();
    allRows.forEach(pair => {
        const dateCell = pair.mainRow.querySelector('td:nth-child(2)').textContent.trim();
        if (dateCell !== '-') {
            const year = dateCell.split("/")[2];
            yearsSet.add(year);
        }
    });

    const years = Array.from(yearsSet).sort((a, b) => a - b);
    const currentYear = new Date().getFullYear().toString();

    // Criar checkboxes dentro do yearFilter
    years.forEach(year => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-2 mb-1 cursor-pointer';
        // Apenas o ano atual vem marcado
        label.innerHTML = `<input type="checkbox" class="year-checkbox" value="${year}" ${year === currentYear ? 'checked' : ''}> ${year}`;
        yearFilter.appendChild(label);
    });
    // Mostrar/esconder filtro
    filterIcon.addEventListener('click', () => {
        yearFilter.classList.toggle('hidden');
    });

    // Função para atualizar tabela e paginação
    function filterByYears() {
        const checkedYears = Array.from(document.querySelectorAll('.year-checkbox:checked')).map(cb => cb.value);

        filteredRows = allRows.filter(pair => {
            const dateCell = pair.mainRow.querySelector('td:nth-child(2)').textContent.trim();
            if (dateCell === '-') return false;
            const year = dateCell.split("/")[2];
            return checkedYears.includes(year);
        });

        currentPage = 1;
        showCurrentPage();
    }

    // Adicionar listener a cada checkbox
    document.querySelectorAll('.year-checkbox').forEach(cb => {
        cb.addEventListener('change', filterByYears);
    });

    // Paginação
    let currentPage = 1;
    const itemsPerPageSelect = document.getElementById('items-per-page');
    let itemsPerPage = parseInt(itemsPerPageSelect.value);
    const paginationInfoText = document.getElementById('pagination-info-text');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNumbers = document.getElementById('page-numbers');

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

        const startItem = totalItems === 0 ? 0 : start + 1;
        const endItem = Math.min(end, totalItems);
        paginationInfoText.textContent = `Mostrando ${startItem}-${endItem} de ${totalItems} feriados`;

        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;

        updatePageNumbers(totalPages);
    }

    function updatePageNumbers(totalPages) {
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-2 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`;
            btn.addEventListener('click', () => { currentPage = i; showCurrentPage(); });
            pageNumbers.appendChild(btn);
        }
    }

    prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; showCurrentPage(); } });
    nextBtn.addEventListener('click', () => { const totalPages = Math.ceil(filteredRows.length / itemsPerPage); if (currentPage < totalPages) { currentPage++; showCurrentPage(); } });
    itemsPerPageSelect.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 1; showCurrentPage(); });

    // Inicializar tabela
    filterByYears();
});