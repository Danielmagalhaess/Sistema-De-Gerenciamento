document.addEventListener("DOMContentLoaded", () => {
    const btnFiltroStatus = document.getElementById("btnFiltroStatus");
    const dropdownStatus = document.getElementById("dropdownFiltroStatus");
    const btnAplicarStatus = document.getElementById("btnAplicarStatus");
    const btnLimparStatus = document.getElementById("btnLimparStatus");

    if (!btnFiltroStatus || !dropdownStatus || !btnAplicarStatus || !btnLimparStatus) {
        console.error("Filtro de status: elementos não encontrados.");
        return;
    }

    // Normalização mais agressiva
    function normalizeString(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/\u00A0/g, " ")          // NBSP -> space
            .replace(/<br\s*\/?>/gi, " ")     // remove breaks se for innerHTML
            .replace(/<\/?[^>]+(>|$)/g, "")   // remove tags HTML (se veio innerHTML)
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")   // remove acentos
            .replace(/[^a-z0-9\s]/gi, " ")    // remove símbolos
            .replace(/\s+/g, " ")             // normaliza espaços
            .toLowerCase();
    }

    // Extrai possíveis textos de status da linha (várias estratégias)
    function extractStatusCandidates(row) {
        const candidates = [];

        // 1) data-status / data-column / data-value
        const dataAttrs = ['data-status', 'data-column', 'data-value', 'data-state'];
        dataAttrs.forEach(attr => {
            if (row.querySelector(`[${attr}]`)) {
                const el = row.querySelector(`[${attr}]`);
                candidates.push(el.getAttribute(attr));
                candidates.push(el.textContent);
            }
        });

        // 2) td[data-column="status"] / qualquer td com aria-label/role/title indicando status
        const tdByData = row.querySelector('td[data-column="status"], [data-column="status"]');
        if (tdByData) {
            candidates.push(tdByData.textContent);
            candidates.push(tdByData.innerHTML);
        }

        Array.from(row.querySelectorAll('td, div')).forEach(el => {
            const aria = el.getAttribute('aria-label') || '';
            const role = el.getAttribute('role') || '';
            const title = el.getAttribute('title') || '';
            if (/status/i.test(aria + role + title)) {
                candidates.push(el.textContent);
                candidates.push(el.innerHTML);
            }
        });

        // 3) procurar td cujo texto contenha palavras-chave conhecidas
        const knownKeywords = ['planejad', 'inici', 'finaliz', 'cancel'];
        Array.from(row.querySelectorAll('td,div,span')).forEach(el => {
            const txt = normalizeString(el.textContent || '');
            if (knownKeywords.some(k => txt.includes(k))) {
                candidates.push(el.textContent);
                candidates.push(el.innerHTML);
            }
        });

        // 4) fallback: pega o texto de todas as tds concatenado
        const allTdText = Array.from(row.querySelectorAll('td')).map(t => t.textContent).join(' | ');
        candidates.push(allTdText);

        // filtra e normaliza candidatos
        return candidates
            .filter(c => c !== null && c !== undefined && String(c).trim().length > 0)
            .map(c => normalizeString(c))
            .filter((v, i, a) => a.indexOf(v) === i); // único
    }

    // Map das opções do checkbox para os termos que vamos buscar (prefixos)
    const selectionMap = {
        'planejada': ['planejad'],
        'iniciou': ['inici'],
        'finalizada': ['finaliz'],
        'finalizado': ['finaliz'],
        'finaliz': ['finaliz'],
        'cancelada': ['cancel'],
        'cancelado': ['cancel']
    };

    function checkboxSelectionsNormalized() {
        const selected = Array.from(dropdownStatus.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => normalizeString(cb.value));
        // converte em lista de prefixes (ex: 'finalizada' -> ['finaliz'])
        const prefixes = [];
        selected.forEach(s => {
            if (selectionMap[s]) {
                selectionMap[s].forEach(p => prefixes.push(p));
            } else {
                prefixes.push(s); // se não mapeado, usa direto
            }
        });
        return prefixes;
    }

    // Posiciona dropdown
    btnFiltroStatus.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = btnFiltroStatus.getBoundingClientRect();
        dropdownStatus.style.top = `${rect.bottom + 16}px`;
        dropdownStatus.style.left = `${rect.left - 80}px`;
        dropdownStatus.classList.toggle("hidden");
    });

    // Fecha ao clicar fora
    document.addEventListener("click", (e) => {
        if (!dropdownStatus.contains(e.target) && !btnFiltroStatus.contains(e.target)) {
            dropdownStatus.classList.add("hidden");
        }
    });

    // Aplicar filtro (com logs detalhados)
    btnAplicarStatus.addEventListener("click", () => {
        const prefixes = checkboxSelectionsNormalized();
        console.groupCollapsed("Aplicando filtro de status — prefixes:", prefixes);
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        if (!rows.length) console.warn("Nenhuma linha em tbody tr encontrada.");

        rows.forEach((row, idx) => {
            const rawHTML = row.innerHTML.slice(0, 400); // limita
            const candidates = extractStatusCandidates(row); // normalizados
            let matched = false;
            let matchedPrefix = null;
            // compara cada candidate com cada prefix
            for (const c of candidates) {
                for (const p of prefixes) {
                    if (!p) continue;
                    if (c.includes(p) || p.includes(c)) {
                        matched = true;
                        matchedPrefix = p;
                        break;
                    }
                }
                if (matched) break;
            }

            // Caso nenhum checkbox selecionado -> mostramos todas
            const showWhenNoneSelected = prefixes.length === 0;
            const willShow = showWhenNoneSelected ? true : matched;

            // aplica visibilidade
            if (willShow) {
                row.style.display = "";
                row.classList.remove && row.classList.remove('hidden');
            } else {
                row.style.display = "none";
                row.classList.add && row.classList.add('hidden');
            }

            // log detalhado por linha
            console.groupCollapsed(`Linha ${idx} — willShow: ${willShow} — matched: ${matched} ${matchedPrefix ? '(' + matchedPrefix + ')' : ''}`);
            console.log("rawHTML (cortado):", rawHTML);
            console.log("candidates(normalizados):", candidates);
            if (!candidates.length) console.warn("Nenhum candidato extraído dessa linha.");
            if (!matched && prefixes.length > 0) {
                console.warn("Não houve match para os prefixes selecionados nesta linha.");
            }
            console.groupEnd();
        });

        console.groupEnd();
        dropdownStatus.classList.add("hidden");
    });

    // Limpar filtro
    btnLimparStatus.addEventListener("click", () => {
        dropdownStatus.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelectorAll("tbody tr").forEach(l => {
            l.style.display = "";
            l.classList.remove && l.classList.remove('hidden');
        });
    });
});