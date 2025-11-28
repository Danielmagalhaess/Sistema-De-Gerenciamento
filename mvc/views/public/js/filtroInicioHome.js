(() => {
    const log = (...a) => console.log("[FiltroInício]", ...a);
    const warn = (...a) => console.warn("[FiltroInício]", ...a);

    const btnFiltro = document.getElementById("btnFiltro");
    const dropdownFiltro = document.getElementById("dropdownFiltro");
    if (!btnFiltro || !dropdownFiltro) { warn("btnFiltro ou dropdownFiltro não encontrados."); return; }

    // Selecionar automaticamente o ano atual
    const anoAtual = new Date().getFullYear();
    const checkboxesAno = document.querySelectorAll('#filtroAno input[type="checkbox"]');

    checkboxesAno.forEach(cb => {
        if (cb.value === anoAtual.toString()) {
            cb.checked = true;
        }
    });


    // garante que exista btnAplicar no DOM (se não existir, cria)
    let btnAplicar = document.getElementById("btnAplicar");
    if (!btnAplicar) {
        btnAplicar = document.createElement("button");
        btnAplicar.id = "btnAplicar";
        btnAplicar.className = "text-xs px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition";
        btnAplicar.textContent = "Aplicar";
        const actions = dropdownFiltro.querySelector(".mt-4.flex.justify-end.gap-2") || dropdownFiltro.querySelector(".mt-4");
        if (actions) actions.appendChild(btnAplicar);
        else dropdownFiltro.appendChild(btnAplicar);
        log("btnAplicar criado dinamicamente.");
    }

    function posicionar() {
        const rect = btnFiltro.getBoundingClientRect();
        const dropdownWidth = dropdownFiltro.offsetWidth || 288;
        const GAP_Y = 16; // ajuste aqui se quiser abaixar mais
        let top = rect.bottom + GAP_Y;
        let left = rect.left - (dropdownWidth / 2) + (rect.width / 2);
        left = Math.max(8, Math.min(left, window.innerWidth - dropdownWidth - 8));
        dropdownFiltro.style.position = "fixed";
        dropdownFiltro.style.top = `${top}px`;
        dropdownFiltro.style.left = `${left}px`;
    }

    // Alternar entre Ano e Mês
    const btnAno = document.getElementById("btnAno");
    const btnMes = document.getElementById("btnMes");
    const filtroAno = document.getElementById("filtroAno");
    const filtroMes = document.getElementById("filtroMes");

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


    btnFiltro.addEventListener("click", (e) => {
        e.stopPropagation();
        posicionar();
        dropdownFiltro.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
        if (!dropdownFiltro.contains(e.target) && !btnFiltro.contains(e.target)) dropdownFiltro.classList.add("hidden");
    });
    window.addEventListener("resize", () => { if (!dropdownFiltro.classList.contains("hidden")) posicionar(); });
    window.addEventListener("scroll", () => { if (!dropdownFiltro.classList.contains("hidden")) posicionar(); }, { passive: true });

    // parsing robusto de datas
    function tryParseDate(s) {
        if (!s && s !== 0) return null;
        const raw = String(s).trim();
        if (!raw) return null;

        // 1) se tiver data em atributo yyyy-mm-dd ou timestamp no data-*
        const isoMatch = raw.match(/(\d{4})[-\/](\d{2})[-\/](\d{2})/);
        if (isoMatch) {
            const y = Number(isoMatch[1]), m = Number(isoMatch[2]) - 1, d = Number(isoMatch[3]);
            const dt = new Date(y, m, d);
            if (!isNaN(dt)) return dt;
        }

        // 2) dd/mm/yyyy ou d/m/yyyy ou dd-mm-yyyy
        let m = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (m) {
            let d = Number(m[1]), mo = Number(m[2]) - 1, y = Number(m[3]);
            if (y < 100) y = 2000 + y;
            const dt = new Date(y, mo, d);
            if (!isNaN(dt)) return dt;
        }

        // 3) tenta extrair yyyy
        m = raw.match(/(19|20)\d{2}/);
        if (m) return new Date(Number(m[0]), 0, 1);

        // 4) tenta parse com Date (last resort)
        const dt = new Date(raw);
        if (!isNaN(dt)) return dt;

        return null;
    }

    // procura coluna "Início" robustamente e retorna índice 1-based
    function detectInicioColumnIndex() {
        const ths = Array.from(document.querySelectorAll("table thead th"));
        for (let i = 0; i < ths.length; i++) {
            const txt = (ths[i].textContent || "").trim().toLowerCase();
            if (txt.includes("início") || txt.includes("inicio") || txt.includes("start")) return i + 1;
        }

        // procura por atributos data-column na thead/th
        for (let i = 0; i < ths.length; i++) {
            const el = ths[i];
            const attrs = ["data-column", "data-key", "data-field"];
            for (const a of attrs) {
                const v = el.getAttribute(a);
                if (v && String(v).toLowerCase().includes("inicio")) return i + 1;
            }
        }

        // procura nas linhas do tbody por células com data-* que pareçam conter a data
        const firstRow = document.querySelector("table tbody tr");
        if (firstRow) {
            const tds = Array.from(firstRow.querySelectorAll("td"));
            for (let i = 0; i < tds.length; i++) {
                // se td tiver attribute data-start / data-date / data-inicio
                const el = tds[i];
                if (el.hasAttribute("data-start") || el.hasAttribute("data-date") || el.hasAttribute("data-inicio")) {
                    return i + 1;
                }
                // se a classe do td tem 'inicio' ou 'start'
                const cls = (el.className || "").toLowerCase();
                if (cls.includes("inicio") || cls.includes("start") || cls.includes("date")) return i + 1;
            }
        }

        // fallback para procurar header com texto semelhante (sem acento)
        for (let i = 0; i < ths.length; i++) {
            const txt = (ths[i].textContent || "").trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            if (txt.includes("inicio") || txt.includes("início") || txt.includes("start")) return i + 1;
        }

        warn("Não detectou coluna 'Início' automaticamente. Usando fallback: 1 (primeira coluna).");
        return 1;
    }

    function normalizeCheckboxValues(container) {
        return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => String(cb.value).trim());
    }

    btnAplicar.addEventListener("click", () => {
        log("Aplicar: iniciando processo de filtragem...");
        const anos = normalizeCheckboxValues(document.getElementById("filtroAno"));
        const meses = normalizeCheckboxValues(document.getElementById("filtroMes")).map(m => String(m).padStart(2, '0'));
        log("Anos selecionados:", anos, "Meses selecionados:", meses);

        const inicioIdx = detectInicioColumnIndex();
        log("Coluna Início detectada (nth-child 1-based):", inicioIdx);

        const rows = Array.from(document.querySelectorAll("table tbody tr"));
        log("Linhas encontradas:", rows.length);
        if (!rows.length) { warn("Nenhuma linha encontrada em table tbody tr."); }

        rows.forEach((tr, idx) => {
            // tenta várias estratégias para obter o conteúdo de data
            let cell = tr.querySelector(`td:nth-child(${inicioIdx})`);
            let raw = "";
            let parsed = null;

            if (cell) {
                // 1) checar data em atributos primeiro
                const dataAttrs = ["data-start", "data-date", "data-inicio", "data"];
                for (const a of dataAttrs) {
                    if (cell.hasAttribute && cell.hasAttribute(a)) {
                        raw = cell.getAttribute(a) || "";
                        parsed = tryParseDate(raw);
                        if (parsed) { log(`Linha ${idx}: parseou de atributo ${a}:`, raw); break; }
                    }
                }
                // 2) se não parseou, tenta texto (innerText)
                if (!parsed) {
                    raw = cell.innerText || cell.textContent || "";
                    parsed = tryParseDate(raw);
                    if (parsed) log(`Linha ${idx}: parseou de innerText:`, raw);
                }
                // 3) se não parseou, tenta innerHTML (por se houver tags)
                if (!parsed) {
                    const html = cell.innerHTML || "";
                    parsed = tryParseDate(html.replace(/<[^>]*>/g, " "));
                    if (parsed) log(`Linha ${idx}: parseou de innerHTML:`, html);
                }
            } else {
                warn(`Linha ${idx}: td:nth-child(${inicioIdx}) não encontrada.`);
            }

            // decide manter ou esconder
            let keep = true;
            if (!parsed) {
                // comportamento padrão: se não parseou, MOSTRAR (mais seguro), mas você pode optar por esconder comentando a próxima linha
                keep = true;
                log(`Linha ${idx}: não foi possível parsear data — mantendo (raw="${raw.slice(0, 80)}")`);
            } else {
                const y = String(parsed.getFullYear());
                const mo = String(parsed.getMonth() + 1).padStart(2, '0');
                let okAno = anos.length === 0 || anos.includes(y);
                let okMes = meses.length === 0 || meses.includes(mo);
                keep = okAno && okMes;
                log(`Linha ${idx}: data detectada ${parsed.toISOString().slice(0, 10)} -> ano ${y} mes ${mo} -> keep=${keep}`);
            }

            tr.style.display = keep ? "" : "none";
        });

        dropdownFiltro.classList.add("hidden");
        log("Aplicar: filtro finalizado.");
    });

})();