const connection = require("./BancoModel");

class CreateModel {
    // Curso
    static async createCurso({nivel, preco, parcelas_max }) {
        const [result] = await connection.query(
            "INSERT INTO cursos (nivel, preco, parcelas_max) VALUES (?, ?, ?)",
            [nivel, preco, parcelas_max]
        );
        return result.insertId;
    }

    // Turma
    static async createTurma({
        id_curso,
        nome_sgset,
        local,
        turno,
        inicio,
        carga_horaria,
        vagas,
        matriculas,
        status
    }) {
        const [result] = await connection.query(
            `INSERT INTO turmas 
             (id_curso, nome_sgset, local, turno, inicio, carga_horaria, vagas, matriculas, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_curso, nome_sgset, local, turno, inicio, carga_horaria, vagas, matriculas, status]
          );
          return result.insertId;
    }

    static async createHorarioTurma({ id_turma, dia_semana, horario_inicio, horario_fim }) {
        const [result] = await connection.query(
            "INSERT INTO turmas_horarios (id_turma, dia_semana, horario_inicio, horario_fim) VALUES (?, ?, ?, ?)",
            [id_turma, dia_semana, horario_inicio, horario_fim]
        );
        return result.insertId;
    }

    static async addDocenteTurma({ id_turma, id_docente }) {
        const [result] = await connection.query(
            "INSERT INTO docentes_turmas (id_turma, id_docente) VALUES (?, ?)",
            [id_turma, id_docente]
        );
        return result.insertId;
    }

    // Parcelas
    static async createParcelas({ id_curso, qtd_parcelas, valor_parcela }) {
        const [result] = await connection.query(
            "INSERT INTO parcelas (id_curso, qtd_parcelas, valor_parcela) VALUES (?, ?, ?)",
            [id_curso, qtd_parcelas, valor_parcela]
        );
        return result.insertId;
    }

    // Buscar cursos
    static async getAllCursos() {
        const [cursos] = await connection.query("SELECT * FROM cursos ORDER BY id_curso DESC");
        return cursos;
    }

    // Buscar turmas por curso
    static async getTurmasByCurso(id_curso) {
        const [turmas] = await connection.query(
            `SELECT t.*, d.nome AS nome_docente
             FROM turmas t
             LEFT JOIN docentes_turmas dt ON t.id_turma = dt.id_turma
             LEFT JOIN docente d ON dt.id_docente = d.id_docente
             WHERE t.id_curso = ?`,
            [id_curso]
        );
        return turmas;
    }

    // Buscar parcelas por curso
    static async getParcelasByCurso(id_curso) {
        const [parcelas] = await connection.query("SELECT * FROM parcelas WHERE id_curso = ?", [id_curso]);
        return parcelas;
    }
    static async getAllDocentes() {
        const [docentes] = await connection.query(
            "SELECT id_docente, nome FROM docente WHERE status = 'ativo'"
        );
        return docentes;
    }
    static async getHorariosByTurma(id_turma) {
        const [rows] = await connection.query(
            `SELECT dia_semana, horario_inicio, horario_fim
             FROM turmas_horarios
             WHERE id_turma = ?
             ORDER BY FIELD(dia_semana, 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')`,
            [id_turma]
        );
        return rows;
    }
    // Dentro da classe CreateModel
    static async vincularNomeCurso({ id_curso, id_nome_curso }) {
        const [result] = await connection.query(
            "INSERT INTO curso_nome (id_curso, id_nome_curso) VALUES (?, ?)",
            [id_curso, id_nome_curso]
        );
        return result.insertId;
    }
    static async getAllNomeCursos() {
        const [rows] = await connection.query(
            `SELECT id_nome_curso, nome 
             FROM nome_cursos 
             WHERE status = 'ativo'
             ORDER BY nome ASC`
        );
        return rows;
    }    
    // Dentro da classe CreateModel
    static async buscarCursoPorNome(nomeCurso) {
        const [rows] = await connection.execute(
            "SELECT * FROM nome_cursos WHERE nome = ?",
            [nomeCurso]
        );
        return rows[0]; // Retorna o primeiro resultado ou undefined se não encontrar
    }
    static async getNomeCursoByCurso(id_curso) {
        const [rows] = await connection.query(`
            SELECT nc.nome 
            FROM nome_cursos nc
            INNER JOIN curso_nome cn ON nc.id_nome_curso = cn.id_nome_curso
            WHERE cn.id_curso = ?
            LIMIT 1
        `, [id_curso]);
        return rows[0]?.nome || '-';
    }    

    static async getFeriadosFormatados(anoReferencia) {
        const [rows] = await connection.query(
            `SELECT data_feriado, recorrente FROM feriados`
        );
    
        const feriados = new Set();
    
        for (const f of rows) {
            const data = f.data_feriado;
            const iso = data.toISOString().split("T")[0];
    
            if (f.recorrente === 1) {
                // feriado recorrente → troca o ano pelo ano da turma
                const mmdd = iso.slice(5);   // "MM-DD"
                feriados.add(`${anoReferencia}-${mmdd}`);
            } else {
                // feriado normal → usa a data inteira
                feriados.add(iso);
            }
        }
    
        return feriados;
    }    

    static async gerarDiasLetivos(id_turma) {
        // Busca dados da turma (inicio e carga)
        const [turmaRows] = await connection.query(
          `SELECT t.id_turma, t.inicio, t.carga_horaria
           FROM turmas t
           WHERE t.id_turma = ?`,
          [id_turma]
        );
    
        if (!turmaRows.length) throw new Error("Turma não encontrada");
    
        const turma = turmaRows[0];
    
        // Busca os horários da turma (dias + horários)
        const [horarios] = await connection.query(
          `SELECT dia_semana, horario_inicio, horario_fim
           FROM turmas_horarios
           WHERE id_turma = ?`,
          [id_turma]
        );
    
        if (!horarios.length) throw new Error("A turma não possui horários definidos");
    
        // ANO DO INÍCIO DA TURMA (para feriados recorrentes)
        const anoInicio = turma.inicio ? new Date(turma.inicio).getFullYear() : (new Date()).getFullYear();
    
        // Busca feriados formatados (getFeriadosFormatados deve estar presente no model)
        const feriados = await CreateModel.getFeriadosFormatados(anoInicio); // Set de "YYYY-MM-DD"
    
        // Mapeamento de nome do dia para número JS
        const diaMap = {
          "Domingo": 0,
          "Segunda": 1,
          "Terça": 2,
          "Quarta": 3,
          "Quinta": 4,
          "Sexta": 5,
          "Sábado": 6
        };
    
        // Agrupa os horários por dia da semana para facilitar o cálculo (ex: {1: [{...}, {...}], 6: [...]})
        const horariosPorDia = {};
        for (const h of horarios) {
          const num = diaMap[h.dia_semana];
          if (num === undefined) continue;
          horariosPorDia[num] = horariosPorDia[num] || [];
          horariosPorDia[num].push({
            inicio: h.horario_inicio, // formato "HH:MM:SS"
            fim: h.horario_fim
          });
        }
    
        // Se a turma tinha um inicio informado, usamos como base, senão usamos hoje
        let dataAtual = turma.inicio ? new Date(turma.inicio) : new Date();
        dataAtual.setHours(0,0,0,0); // normaliza para meia-noite
    
        // 1) Ajustar data de início: avançar até o primeiro dia em que exista horário e não seja feriado
        let encontrouInicio = false;
        let inicioReal = null;
    
        while (!encontrouInicio) {
          const iso = dataAtual.toISOString().split("T")[0];
          const diaSemana = dataAtual.getDay();
    
          // se existe algum horário cadastrado para esse dia e não é feriado e não é domingo
          if (horariosPorDia[diaSemana] && diaSemana !== 0 && !feriados.has(iso)) {
            encontrouInicio = true;
            inicioReal = new Date(dataAtual); // cópia
            break;
          }
    
          // avança um dia
          dataAtual.setDate(dataAtual.getDate() + 1);
        }
    
        if (!inicioReal) throw new Error("Não foi possível determinar data de início válida");
    
        // 2) Calcular término: iterar dia a dia somando a duração de cada aula (por horário) até atingir a carga horária
        let horasAcumuladas = 0;
        const cargaTotalHoras = Number(turma.carga_horaria) || 0;
        let terminoFinal = null;
    
        // Começa do dia de inícioReal
        dataAtual = new Date(inicioReal);
    
        // Enquanto não atingir carga horária, percorre dias
        while (horasAcumuladas < cargaTotalHoras) {
          const iso = dataAtual.toISOString().split("T")[0];
          const diaSemana = dataAtual.getDay();
    
          // se dia tem horários, não é domingo e não é feriado
          if (horariosPorDia[diaSemana] && diaSemana !== 0 && !feriados.has(iso)) {
            // percorre todos os blocos de horário do dia (se tiver mais de um)
            for (const bloco of horariosPorDia[diaSemana]) {
              // calcula duração em horas do bloco (considera HH:MM:SS)
              const inicioStr = `${iso}T${bloco.inicio}`;
              const fimStr = `${iso}T${bloco.fim}`;
    
              const inicioDate = new Date(inicioStr);
              const fimDate = new Date(fimStr);
    
              // segurança: se horário inválido, pula
              if (isNaN(inicioDate.getTime()) || isNaN(fimDate.getTime()) || fimDate <= inicioDate) {
                continue;
              }
    
              const duracao = (fimDate - inicioDate) / (1000 * 60 * 60); // horas como float
    
              let horasParaAdicionar = duracao;
    
              if (horasAcumuladas + duracao >= cargaTotalHoras) {
                // cálculo do término parcial dentro deste bloco
                const horasNecessarias = cargaTotalHoras - horasAcumuladas;
                terminoFinal = new Date(inicioDate.getTime() + horasNecessarias * 3600 * 1000);
                horasAcumuladas = cargaTotalHoras;
                break; // encerra loop de blocos
              } else {
                horasAcumuladas += duracao;
                terminoFinal = new Date(fimDate); // atualiza término para o fim deste bloco
              }
            }
          }
    
            // Se atingiu a carga, para imediatamente SEM avançar o dia
            if (horasAcumuladas >= cargaTotalHoras) {
                break;
            }

            dataAtual.setDate(dataAtual.getDate() + 1); // avança só se continuar
        }
    
        // Caso términoFinal ainda seja null (por algum motivo), definimos como inicioReal
        if (!terminoFinal) terminoFinal = new Date(inicioReal);
    
        const formatDate = d =>
            new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .split("T")[0];
    
        await connection.query(
          `UPDATE turmas SET inicio = ?, termino = ? WHERE id_turma = ?`,
          [ formatDate(inicioReal), formatDate(terminoFinal), id_turma ]
        );
    
        return {
          inicio: formatDate(inicioReal),
          termino: formatDate(terminoFinal)
        };
    }    
}

module.exports = CreateModel;
