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
                    description: 'Está é a página para editar curso, é aqui aonde os cursos são editados.' 
                } 
            },
 
            {
                element: '#vagas',
                popover: {  
                    title: 'Número de Vagas',
                    description: 'Altere aqui o total de vagas disponíveis para esta turma. Use este campo quando precisar aumentar ou reduzir o limite máximo de alunos.'
                }
            },
 
            {
                element: '#matriculasRealizadas',
                popover: {  
                    title: 'Matrículas Realizadas',
                    description: 'Altere aqui o número atual de matrículas feitas nesta turma. Use este campo quando precisar aumentar ou reduzir o quantidade de matrículas de alunos'
                }
            },
            {
                element: '#voltar',
                popover: {  
                    title: 'Voltar para a Home',
                    description: 'Clique aqui para retornar à página inicial sem salvar alterações. Use este botão se você quiser cancelar a edição ou apenas navegar de volta.'
                }
            },
            {
                element: '#editar',
                popover: {  
                    title: 'Salvar Alterações',
                    description: 'Depois de revisar ou modificar os dados da turma, clique aqui para salvar todas as alterações. Este botão confirma a edição e atualiza as informações no sistema.'
                }
            }
        ]
  });
      driverObj.drive();
});
 
 