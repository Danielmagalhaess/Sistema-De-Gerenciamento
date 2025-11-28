document.addEventListener("DOMContentLoaded", () => {
    const driver = window.driver.js.driver;

    const driverObj = driver({
        showProgress: true,
        opacity: 0.5,
        allowClose: false,
        nextBtnText: "Próximo →",
        prevBtnText: "← Voltar",
        doneBtnText: "Concluir",
        steps: [
            { 
                element: '#tour-1',
                popover: {  
                    title: 'Bem-vindo!',
                    description: 'Está é a página Home, é aqui aonde os cursos são listados e administrados.' 
                } 
            },
            { 
                element: '#tour-2',
                popover: {  
                    title: 'Filtrar Cursos',
                    description: 'Use este menu suspenso para filtrar os cursos por Nome SGSET, Docente ou Nível.' 
                } 
            },
            { 
                element: '#tour-3',
                popover: {  
                    title: 'Pesquisar Cursos',
                    description: 'Digite o nome do curso/docente ou Nível que deseja encontrar neste campo de pesquisa.' 
                } 
            },
            {
                element: '#btnFiltroTurno',
                popover: {  
                    title: 'Filtrar por Turno',
                    description: 'Clique neste ícone para abrir o menu de filtros para poder selecionar o turno desejado.',
                    side: 'top'
                }
            },
            {
                element: '#btnFiltro',
                popover: {  
                    title: 'Filtrar por Inicio do Curso',
                    description: 'Clique neste ícone para abrir o menu de filtros para poder selecionar a data de inicio desejado.',
                    side: 'top'
                }
            },
            {
                element: '#btnFiltroFim',
                popover: {  
                    title: 'Filtrar por Fim do Curso',
                    description: 'Clique neste ícone para abrir o menu de filtros para poder selecionar a data de fim desejado.',
                    side: 'top'
                }
            },
            {
                element: '#btnFiltroOcupacao',
                popover: {  
                    title: 'Filtrar por Ocupação do Curso',
                    description: 'Clique neste ícone para abrir o menu de filtros para poder selecionar a ocupação desejada.',
                    side: 'top'
                }
            },
            {
                element: '#btnFiltroStatus',
                popover: {  
                    title: 'Filtrar por Status do Curso',
                    description: 'Clique neste ícone para abrir o menu de filtros para poder selecionar o status desejado.',
                    side: 'top'
                }
            },
            {
                element: '#table-body',
                popover: {  
                    title: 'Tabela',
                    description: 'Clique na tabela para exibir mais informações.',
                }
            },
            {
                element: '#tour-5',
                popover: {
                    title: 'Página Editar',
                    description: 'Ao clicar no ícone você será redirecionado para a página de editar o curso.',
                    side: 'top'
                }
            },
            {
                element: '#abrirModalBtn',
                popover: {
                    title: 'Calendário',
                    description: 'Ao clicar no ícone para abrir o calendário será possível visualizar quando terá aula desse curso.',
                    side: 'top'
                }
            },
            {
                element: '#tour-4',
                popover: {  
                    title: 'Quantidade de cursos por página',
                    description: 'Clique neste menu suspenso para escolher quantos cursos deseja visualizar por página.',
                    side: 'bottom'
                }
            },
            {
                element: '#next-btn',
                popover: {
                    title: 'Próxima página',
                    description: 'Clique para avançar para a próxima página da lista de cursos.',
                    side: 'bottom'
                }
            },
            {
                element: '#prev-btn',
                popover: {
                    title: 'Página anterior',
                    description: 'Clique para voltar para a página anterior da lista de cursos.',
                    side: 'bottom'
                }
            }
        ]
  });
      driverObj.drive();
});

