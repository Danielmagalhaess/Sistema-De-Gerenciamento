(() => {
    const log = (...a) => console.log("[FiltroFim]", ...a);
    const warn = (...a) => console.warn("[FiltroFim]", ...a);

    const btnFiltro = document.getElementById("btnFiltroFim");
    const dropdown = document.getElementById("dropdownFiltroFim");
    const btnAno = document.getElementById("btnAnoFim");
    const btnMes = document.getElementById("btnMesFim");
    const filtroAno = document.getElementById("filtroAnoFim");
    const filtroMes = document.getElementById("filtroMesFim");
    const btnAplicar = document.getElementById("btnAplicarFim");
    const btnLimpar = document.getElementById("btnLimparFim");

    if (!btnFiltro || !dropdown) { warn("Elementos do filtro não encontrados."); return; }

    // Seleciona o ano atual automaticamente
    const anoAtual = new Date().getFullYear();
    filtroAno.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb.value === anoAtual.toString()) cb.checked = true;
    });

    function posicionar() {
        const rect = btnFiltro.getBoundingClientRect();
        const width = dropdown.offsetWidth || 288;
        const gap = 16;
        const top = rect.bottom + gap;
        let left = rect.left - (width / 2) + (rect.width / 2);
        left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
        dropdown.style.position = "fixed";
        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${left}px`;
    }

    btnAno.addEventListener("click", () => {
        btnAno.classList.add("bg-blue-100", "text-blue-700");
        btnAno.classList.remove("bg-gray-100", "text-gray-600");
        btnMes.classList.remove("bg-blue-100", "text-blue-700");
        btnMes.classList.add("bg-gray-100", "text-gray-600");
        filtroAno.classList.remove("hidden");
        filtroMes.classList.add("hidden");
    });

    btnMes.addEventListener("click", () => {
        btnMes.classList.add("bg-blue-100", "text-blue-700");
        btnMes.classList.remove("bg-gray-100", "text-gray-600");
        btnAno.classList.remove("bg-blue-100", "text-blue-700");
        btnAno.classList.add("bg-gray-100", "text-gray-600");
        filtroMes.classList.remove("hidden");
        filtroAno.classList.add("hidden");
    });

    btnFiltro.addEventListener("click", e => {
        e.stopPropagation();
        posicionar();
        dropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", e => {
        if (!dropdown.contains(e.target) && !btnFiltro.contains(e.target)) dropdown.classList.add("hidden");
    });

    window.addEventListener("resize", () => {
        if (!dropdown.classList.contains("hidden")) posicionar();
    });
    window.addEventListener("scroll", () => {
        if (!dropdown.classList.contains("hidden")) posicionar();
    }, { passive: true });

    // Função de parse de data
    function tryParseDate(s) {
        if (!s) return null;
        s = s.trim();
        if (!s) return null;
        const iso = s.match(/(\d{4})[-\/](\d{2})[-\/](\d{2})/);
        if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
        const br = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (br) {
            let d = Number(br[1]), m = Number(br[2]) - 1, y = Number(br[3]);
            if (y < 100) y += 2000;
            return new Date(y, m, d);
        }
        return isNaN(new Date(s)) ? null : new Date(s);
    }

    function detectFimColumnIndex() {
        const ths = Array.from(document.querySelectorAll("table thead th"));
        for (let i = 0; i < ths.length; i++) {
            const txt = (ths[i].textContent || "").toLowerCase();
            if (txt.includes("fim") || txt.includes("término") || txt.includes("termino") || txt.includes("end"))
                return i + 1;
        }
        warn("Coluna 'Fim' não detectada — fallback para última coluna.");
        return ths.length;
    }

    btnAplicar.addEventListener("click", () => {
        const anos = Array.from(filtroAno.querySelectorAll("input:checked")).map(cb => cb.value);
        const meses = Array.from(filtroMes.querySelectorAll("input:checked")).map(cb => cb.value.padStart(2, "0"));
        const fimIdx = detectFimColumnIndex();

        document.querySelectorAll("table tbody tr").forEach(tr => {
            const td = tr.querySelector(`td:nth-child(${fimIdx})`);
            if (!td) return;
            const raw = td.textContent.trim();
            const parsed = tryParseDate(raw);
            if (!parsed) return (tr.style.display = "");
            const y = parsed.getFullYear().toString();
            const m = String(parsed.getMonth() + 1).padStart(2, "0");
            const show = (anos.length === 0 || anos.includes(y)) && (meses.length === 0 || meses.includes(m));
            tr.style.display = show ? "" : "none";
        });

        dropdown.classList.add("hidden");
    });

    btnLimpar.addEventListener("click", () => {
        filtroAno.querySelectorAll("input").forEach(cb => (cb.checked = false));
        filtroMes.querySelectorAll("input").forEach(cb => (cb.checked = false));
        document.querySelectorAll("table tbody tr").forEach(tr => (tr.style.display = ""));
    });
})();