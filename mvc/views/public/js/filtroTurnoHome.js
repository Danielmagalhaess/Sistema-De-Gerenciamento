(function () {
    const btn = document.getElementById("btnFiltroTurno");
    const dropdown = document.getElementById("dropdownFiltroTurno");
    const btnAplicar = document.getElementById("btnAplicarTurno");
    const btnLimpar = document.getElementById("btnLimparTurno");

    if (!btn || !dropdown) return;

    document.body.appendChild(dropdown);
    dropdown.style.position = "fixed";

    function posicionarDropdown() {
        const rect = btn.getBoundingClientRect();
        const dropdownWidth = dropdown.offsetWidth || 288;
        const dropdownHeight = dropdown.offsetHeight || 220;

        // mesmo offset do filtro "Fim"
        const GAP_Y = 16;
        let top = rect.bottom + GAP_Y;
        let left = rect.left - (dropdownWidth / 2) + (rect.width / 2);

        // não deixar sair da tela
        left = Math.max(10, Math.min(left, window.innerWidth - dropdownWidth - 10));

        dropdown.style.left = `${left}px`;
        dropdown.style.top = `${top}px`;
    }

    function abrirDropdown() {
        posicionarDropdown();
        dropdown.classList.remove("hidden");
        dropdown.setAttribute("aria-hidden", "false");
    }

    function fecharDropdown() {
        dropdown.classList.add("hidden");
        dropdown.setAttribute("aria-hidden", "true");
    }

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (dropdown.classList.contains("hidden")) abrirDropdown();
        else fecharDropdown();
    });

    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) fecharDropdown();
    });

    window.addEventListener("resize", () => {
        if (!dropdown.classList.contains("hidden")) posicionarDropdown();
    });

    window.addEventListener("scroll", () => {
        if (!dropdown.classList.contains("hidden")) posicionarDropdown();
    }, { passive: true });

    // Normalizar texto para filtrar
    function normalizeText(s) {
        return (s || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    }

    // Limpar
    btnLimpar.addEventListener("click", () => {
        dropdown.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
        document.querySelectorAll("table tbody tr").forEach(tr => tr.style.display = "");
    });

    // Aplicar filtro
    btnAplicar.addEventListener("click", () => {
        const selecionados = Array.from(dropdown.querySelectorAll("input[type=checkbox]:checked"))
            .map(cb => normalizeText(cb.value));

        if (selecionados.length === 0) {
            document.querySelectorAll("table tbody tr").forEach(tr => tr.style.display = "");
            fecharDropdown();
            return;
        }

        const ths = document.querySelectorAll("table thead th");
        let turnoIndex = 3;
        ths.forEach((th, i) => {
            if ((th.textContent || "").toLowerCase().includes("turno")) turnoIndex = i + 1;
        });

        document.querySelectorAll("table tbody tr").forEach(tr => {
            const turnoTd = tr.querySelector(`td:nth-child(${turnoIndex})`);
            const turno = normalizeText(turnoTd ? turnoTd.innerText : "");
            const match = selecionados.some(sel => turno.includes(sel));
            tr.style.display = match ? "" : "none";
        });

        fecharDropdown();
    });
})();
