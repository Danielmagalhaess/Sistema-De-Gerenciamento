document.addEventListener("DOMContentLoaded", function () {
    // === Variáveis globais ===
    let currentPage = 1;
    let itemsPerPage = 5;

    // === Elementos DOM ===
    const tableBody = document.getElementById("table-body");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const pageNumbers = document.getElementById("page-numbers");
    const itemsPerPageSelect = document.getElementById("items-per-page");
    const paginationInfoText = document.getElementById("pagination-info-text");
    const inputBusca = document.getElementById("input-busca");
    const selectFiltro = document.getElementById("select-filtro");

    // Modal deleção
    const deleteModal = document.getElementById("deleteModal");
    const deleteForm = document.getElementById("deleteForm");
    const courseNameElement = document.getElementById("courseNameToDelete");
    const closeModalBtn = document.getElementById("closeModal");
    const cancelDeleteBtn = document.getElementById("cancelDelete");

    // === Inicialização ===
    let allRows = Array.from(document.querySelectorAll("tbody tr.main-row")).map(row => {
        return { mainRow: row, detailsRow: row.nextElementSibling };
    });
    let filteredRows = [...allRows];
    updatePagination();

    // === Funções ===
    function updatePagination() {
        const totalItems = filteredRows.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        paginationInfoText.textContent = `Mostrando ${startItem}-${endItem} de ${totalItems} cursos`;
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;

        updatePageNumbers(totalPages);
        showCurrentPage();
    }

    function updatePageNumbers(totalPages) {
        pageNumbers.innerHTML = "";
        if (totalPages <= 1) return;

        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);
        if (currentPage <= 3) end = Math.min(5, totalPages);
        if (currentPage >= totalPages - 2) start = Math.max(1, totalPages - 4);

        if (start > 1) { addPageBtn(1); if (start > 2) addEllipsis(); }
        for (let i = start; i <= end; i++) addPageBtn(i);
        if (end < totalPages) { if (end < totalPages - 1) addEllipsis(); addPageBtn(totalPages); }
    }

    function addPageBtn(num) {
        const btn = document.createElement("button");
        btn.textContent = num;
        btn.className = `page-number ${num === currentPage ? "active" : ""}`;
        btn.addEventListener("click", () => { currentPage = num; updatePagination(); });
        pageNumbers.appendChild(btn);
    }

    function addEllipsis() {
        const span = document.createElement("span");
        span.textContent = "...";
        span.className = "px-2 text-gray-500";
        pageNumbers.appendChild(span);
    }

    function showCurrentPage() {
        allRows.forEach(r => { r.mainRow.style.display = "none"; r.detailsRow.style.display = "none"; });
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        filteredRows.slice(start, end).forEach(r => {
            r.mainRow.style.display = "";
            const details = r.detailsRow.querySelector(".details-container");
            if (details && details.classList.contains("open")) r.detailsRow.style.display = "";
        });
    }

    function filtrarTabela() {
        const busca = inputBusca.value.toLowerCase();
        const filtro = selectFiltro.value;
        filteredRows = allRows.filter(r => (r.mainRow.dataset[filtro] || "").toLowerCase().includes(busca));
        currentPage = 1;
        updatePagination();
    }

    // === Event listeners ===
    prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; updatePagination(); } });
    nextBtn.addEventListener("click", () => { const totalPages = Math.ceil(filteredRows.length / itemsPerPage); if (currentPage < totalPages) { currentPage++; updatePagination(); } });
    itemsPerPageSelect.addEventListener("change", e => { itemsPerPage = parseInt(e.target.value); currentPage = 1; updatePagination(); });
    inputBusca.addEventListener("input", filtrarTabela);
    selectFiltro.addEventListener("change", filtrarTabela);

    // Expandir detalhes
    tableBody.addEventListener("click", e => {
        const mainRow = e.target.closest(".main-row");
        if (!mainRow || e.target.closest("a") || e.target.closest("button")) return;
        const detailsRow = mainRow.nextElementSibling;
        const details = detailsRow.querySelector(".details-container");
        const icon = mainRow.querySelector(".fa-chevron-down");
        if (details) {
            details.classList.toggle("open");
            icon.classList.toggle("rotate-180");
            detailsRow.style.display = details.classList.contains("open") ? "" : "none";
        }
    });

    // Modal de deleção
    document.addEventListener("click", e => {
        const btn = e.target.closest(".delete-btn");
        if (!btn) return;
        courseNameElement.textContent = btn.dataset.nome;
        deleteForm.action = `/delete/${btn.dataset.id}`;
        deleteModal.classList.remove("hidden");
    });
    [closeModalBtn, cancelDeleteBtn].forEach(el => el.addEventListener("click", () => deleteModal.classList.add("hidden")));
    deleteModal.addEventListener("click", e => { if (e.target === deleteModal) deleteModal.classList.add("hidden"); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !deleteModal.classList.contains("hidden")) deleteModal.classList.add("hidden"); });

    // Side nav
    const sideNav = document.getElementById("side-nav");
    sideNav.addEventListener("mouseenter", () => document.body.style.paddingLeft = "240px");
    sideNav.addEventListener("mouseleave", () => document.body.style.paddingLeft = "72px");
});