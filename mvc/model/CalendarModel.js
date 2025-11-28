const moment = require('moment');
const connection = require("./BancoModel");


// Função para gerar o calendário
async function Scheadule(dataInicio = new Date(), cargaHoraria,turma_id, diasSemana = []) {

    let calendario = {};
    let dataAtual = moment(dataInicio);
    let aulasAlocadas = 0;

    /*
    Exemplo de retorno: buscarTurma(turma_id)
        [
            {
            dia_semana: "Quarta",
            horas: "04:00:00",
            },
            {
            dia_semana: "Sexta",
            horas: "04:00:00",
            },
        ]
    */
    const turma = await buscaTurma(turma_id);

    cargaHoraria = turma[0].dias_necessarios

    const feriados = await buscaFeriado(dataInicio);

    while (aulasAlocadas < cargaHoraria) {
        const diaSemanaAtual = dataAtual.day();

        if (diasSemana.includes(diaSemanaAtual) &&
            !feriados.includes(dataAtual.format("YYYY-MM-DD"))) {

            const dataISO = dataAtual.format("YYYY-MM-DD");

            calendario[diaSemanaAtual] = calendario[diaSemanaAtual] || [];
            calendario[diaSemanaAtual].push({ data: dataISO });

            aulasAlocadas++;
        }

        dataAtual.add(1, "days");
    }

    return calendario;
}

// Função para buscar feriados
async function buscaFeriado(data_inicio) {
    const sql = "SELECT data_feriado FROM feriados WHERE data_feriado >= ?";
    const [result] = await connection.execute(sql, [data_inicio]);
    // Retorna apenas as datas em formato YYYY-MM-DD
    return result.map(r => moment(r.data_feriado).format('YYYY-MM-DD'));
}

async function buscaTurma(id) {
    const sql = `
        SELECT 
            (t.carga_horaria / 
                SUM(TIME_TO_SEC(TIMEDIFF(th.horario_fim, th.horario_inicio)) / 3600)
            ) AS dias_necessarios

        FROM turmas t
        INNER JOIN turmas_horarios th 
            ON t.id_turma = th.id_turma
        WHERE t.id_turma = ?
        GROUP BY t.id_turma, t.carga_horaria;

    
    `;
    const [result] = await connection.execute(sql, [id]);
    // Retorna apenas as datas em formato YYYY-MM-DD
    return result;
}

function ultimoDiaAula(calendario) {
    let todasDatas = [];

    Object.values(calendario).forEach(aulas => {
        aulas.forEach(aula => {
            // Agora moment entende ISO sem problemas
            todasDatas.push(moment(aula.data));
        });
    });

    todasDatas.sort((a, b) => a - b);

    return todasDatas.length > 0 ? todasDatas[todasDatas.length - 1].format('DD/MM/YYYY HH:mm') : null;
}

module.exports = {
    ultimoDiaAula,
    Scheadule,
    buscaFeriado
}



// SELECT 
//     t.id_turma,
//     t.carga_horaria,

//     -- Soma total de horas decimais
//     SUM(
//         (
//             TIME_TO_SEC(TIMEDIFF(th.horario_fim, th.horario_inicio)) / 3600
//         )
//     ) AS total_horas_decimais,

//     -- Dias necessários = carga_horaria_total / horas_por_dia
//     (t.carga_horaria / 
//         SUM(TIME_TO_SEC(TIMEDIFF(th.horario_fim, th.horario_inicio)) / 3600)
//     ) AS dias_necessarios

// FROM turmas t
// INNER JOIN turmas_horarios th 
//     ON t.id_turma = th.id_turma
// WHERE t.id_turma = 74
// GROUP BY t.id_turma, t.carga_horaria;
