document.addEventListener("DOMContentLoaded", function () {

    const btnFiltro = document.getElementById("btnFiltroOcupacao");
    const dropdown = document.getElementById("dropdownFiltroOcupacao");
    const range = document.getElementById("ocupacaoRange");
    const valorSpan = document.getElementById("ocupacaoValor");
    const aplicar = document.getElementById("btnAplicarOcupacao");
    const limpar = document.getElementById("btnLimparOcupacao");

    // Atualiza número + barra do range
    function atualizarGradiente() {
        const min = Number(range.min);
        const max = Number(range.max);
        const val = Number(range.value);

        valorSpan.textContent = val;

        const percent = ((val - min) / (max - min)) * 100;

        range.style.background = `linear-gradient(to right, #3b82f6 ${percent}%, #e5e7eb ${percent}%)`;
    }

    btnFiltroOcupacao.addEventListener("click", (e) => {
        e.stopPropagation();

        const rect = btnFiltroOcupacao.getBoundingClientRect();

        dropdownFiltroOcupacao.style.top = (rect.bottom + 16) + "px";
        dropdownFiltroOcupacao.style.left = rect.left - "120px";

        dropdownFiltroOcupacao.classList.toggle("hidden");
    });


    // Range em tempo real
    range.addEventListener("input", atualizarGradiente);

    // Aplicar filtro (% mínima)
    aplicar.addEventListener("click", () => {
        const minimo = parseFloat(range.value);

        document.querySelectorAll("table tbody tr").forEach(row => {

            // pega célula da ocupação marcada com data-ocupacao
            const celula = row.querySelector("[data-ocupacao]");
            if (!celula) return;

            const valor = parseFloat(celula.getAttribute("data-ocupacao"));

            if (!isNaN(valor) && valor >= minimo) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });

        dropdown.classList.add("hidden");
    });

    // Limpar filtro
    limpar.addEventListener("click", () => {
        range.value = 0;
        atualizarGradiente();
        document.querySelectorAll("table tbody tr").forEach(row => row.style.display = "");
        dropdown.classList.add("hidden");
    });

    atualizarGradiente();
});