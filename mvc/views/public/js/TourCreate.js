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
                    description: 'Está é a página para criar curso, é aqui aonde os cursos são criados.' 
                } 
            },
            {
                element: '#nomeCursoInput',
                popover: {  
                    title: 'Nome do Curso',
                    description: 'Clique neste input para selecionar um curso, ou digite o curso pré-existente.'
                }
            },
 
            {
                element: '#nivelCurso',
                popover: {  
                    title: 'Nivel do Curso',
                    description: 'Clique neste select para selecionar o nível do curso.'
                }
            },
 
            {
                element: '#nomeTurma',
                popover: {  
                    title: 'Nome SGSET',
                    description: 'Clique neste campo para digitar o nome SGSET.'
                }
            },
 
            {
                element: '#docenteInput',
                popover: {  
                    title: 'Docente Responsável',
                    description: 'Clique neste campo para selecionar ou digitar um pré-existente o docente.'
                }
            },
 
            {
                element: '#local',
                popover: {  
                    title: 'Local',
                    description: 'Clique neste campo para digitar os locais de aulas dos cursos.'
                }
            },
 
            {
                element: '#turno',
                popover: {  
                    title: 'Turno',
                    description: 'Clique neste select para selecionar o Turno em que as aulas vão ocorrer.'
                }
            },
 
            {
                element: '#tabela',
                popover: {  
                    title: 'Tabela de dias e horários',
                    description: 'Nessa tabela, é possivel organizar os dias da semana em que cada curso ira acontecer.'
                }
            },
 
            {
                element: '#input',
                popover: {  
                    title: 'Ativo',
                    description: 'Aqui você vai ativar ou desativar o dia selecionado.'
                }
            },
 
            {
                element: '#horario-i',
                popover: {  
                    title: 'Horário-início',
                    description: 'Neste campo, você vai selecionar o horário de início do curso, ao clicar no ícone abrirá um menu para selecionar a hora e os minutos.'
                }
            },
 
            {
                element: '#horario-f',
                popover: {  
                    title: 'Horário-fim',
                    description: 'Neste campo, você vai selecionar o horário de fim do curso, ao clicar no ícone abrirá um menu para selecionar a hora e os minutos.'
                }
            },
 
            {
                element: '#dataInicio',
                popover: {  
                    title: 'Data de Início',
                    description: 'Neste campo, você pode digitar a data no campo ou se você clicar no ícone do calendário abrirá um calendário podendo selecionar um dia também.'
                }
            },
 
            {
                element: '#dataTermino',
                popover: {  
                    title: 'Data de Termino',
                    description: 'A data de termino do curso será calculada sozinha após preencher a carga horária do curso, os dias da semana e horário de início e fim.'
                }
            },
 
            {
                element: '#cargaHoraria',
                popover: {  
                    title: 'Carga Horária',
                    description: 'Neste campo, será definida a carga horária total do curso.'
                }
            },
               
 
            {
                element: '#vagas',
                popover: {  
                    title: 'Quantidade de Vagas',
                    description: 'Neste campo, sera definida a quantidade de vagas do curso.'
                }
            },
 
            {
                element: '#matriculasRealizadas',
                popover: {  
                    title: 'Matrículas Realizadas',
                    description: 'Neste campo, sera exibida a quantidade de matrículas no curso.'
                }
            },
 
            {
                element: '#cursoPago',
                popover: {  
                    title: 'Este curso é pago?',
                    description: 'Ao selecionar se o curso é pago, exibirá três campos para preencher, Valor inteiro, Número de parcelas e o terceiro campo Valor Mensal, será calculado sozinho após preencher os outros dois campos.'
                }
            },
 
            {
                element: '#statusCurso',
                popover: {  
                    title: 'Status do Curso',
                    description: 'Neste campo, você ira selecionar o status do curso: Planejada, Iniciou, Finalizou e Cancelada.'
                }
            },
 
            {
                element: '#voltar',
                popover: {  
                    title: 'Voltar para a página anterior',
                    description: 'Esse botão te redireciona para a página anterior.'
                }
            },
 
            {
                element: '#criar',
                popover: {  
                    title: 'Criar Curso',
                    description: 'Este botão cria um novo curso com as informações preenchidas anteriormente.'
                }
            },        
        ]
  });
      driverObj.drive();
});
 
 