document.addEventListener('DOMContentLoaded', function () {
    const inputBusca = document.getElementById('input-busca');
    const selectFiltro = document.getElementById('select-filtro-area');
    const tabelaCursos = document.querySelector('tbody');

    // Função principal de filtro
    function filtrarCursos() {
        const termoBusca = inputBusca.value.toLowerCase().trim();
        const filtroStatus = selectFiltro.value;

        let linhasVisiveis = 0;
        const linhas = tabelaCursos.querySelectorAll('tr');

        linhas.forEach(linha => {
            const nomeCurso = linha.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
            const status = linha.querySelector('.status-badge')?.textContent.toLowerCase() || '';

            const correspondeBusca = nomeCurso.includes(termoBusca);
            const correspondeStatus = 
                filtroStatus === 'todos' || 
                status.includes(filtroStatus);

            if (correspondeBusca && correspondeStatus) {
                linha.style.display = '';
                linhasVisiveis++;
            } else {
                linha.style.display = 'none';
            }
        });

        // Caso nenhum curso seja encontrado
        const linhaNenhumCurso = document.createElement('tr');
        linhaNenhumCurso.classList.add('border-t');
        linhaNenhumCurso.innerHTML = `
            <td colspan="4" class="text-center py-16 text-gray-500">
                Nenhum curso encontrado
            </td>
        `;

        // Remove a linha antiga de "Nenhum curso encontrado"
        const linhaExistente = tabelaCursos.querySelector('td[colspan]');
        if (linhaExistente) linhaExistente.parentElement.remove();

        if (linhasVisiveis === 0) {
            tabelaCursos.appendChild(linhaNenhumCurso);
        }
    }

    // Listeners
    inputBusca.addEventListener('input', filtrarCursos);
    selectFiltro.addEventListener('change', filtrarCursos);
});