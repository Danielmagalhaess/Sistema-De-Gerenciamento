const connection = require("./BancoModel");
const CreateModel = require("./CreateModel");

class EditModel {
    // ==================== PEGAR DADOS ====================

    static async getAllCourseNames() {
        try {
            const [rows] = await connection.query(
                `SELECT nc.id_nome_curso, nc.nome 
                 FROM nome_cursos nc 
                 WHERE nc.status = 'ativo' 
                 ORDER BY nc.nome ASC`
            );
            return rows;
        } catch (error) {
            console.error("Erro ao buscar nomes de cursos:", error);
            throw error;
        }
    }

    static async getCursoById(id_curso) {
        try {
            const [rows] = await connection.query(
                "SELECT * FROM cursos WHERE id_curso = ?",
                [id_curso]
            );
            return rows[0];
        } catch (error) {
            console.error("Erro ao buscar curso:", error);
            throw error;
        }
    }

    static async getTurmasByCurso(id_curso) {
        try {
            const [rows] = await connection.query(
                `SELECT t.*, GROUP_CONCAT(d.nome SEPARATOR ', ') AS nome_docente
                 FROM turmas t
                 LEFT JOIN docentes_turmas dt ON t.id_turma = dt.id_turma
                 LEFT JOIN docente d ON dt.id_docente = d.id_docente
                 WHERE t.id_curso = ?
                 GROUP BY t.id_turma`,
                [id_curso]
            );
            return rows;
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
            throw error;
        }
    }

    static async getParcelasByCurso(id_curso) {
        try {
            const [rows] = await connection.query(
                "SELECT * FROM parcelas WHERE id_curso = ?",
                [id_curso]
            );
            return rows;
        } catch (error) {
            console.error("Erro ao buscar parcelas:", error);
            throw error;
        }
    }

    static async getHorariosByTurma(id_turma) {
        try {
            const [rows] = await connection.query(
                "SELECT * FROM turmas_horarios WHERE id_turma = ? ORDER BY FIELD(dia_semana, 'Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo')",
                [id_turma]
            );
            return rows;
        } catch (error) {
            console.error("Erro ao buscar horários:", error);
            throw error;
        }
    }

    static async getAllDocentes() {
        try {
            const [rows] = await connection.query(
                "SELECT id_docente, nome FROM docente WHERE status = 'ativo' ORDER BY nome ASC"
            );
            return rows;
        } catch (error) {
            console.error("Erro ao buscar docentes:", error);
            throw error;
        }
    }

    static async getCursoNomeById(id_nome_curso) {
        const [rows] = await connection.query(
            "SELECT * FROM nome_cursos WHERE id_nome_curso = ? AND status = 'ativo'",
            [id_nome_curso]
        );
        return rows[0];
    }

    static async getDocenteById(id_docente) {
        const [rows] = await connection.query(
            "SELECT * FROM docente WHERE id_docente = ? AND status = 'ativo'",
            [id_docente]
        );
        return rows[0];
    }

    static async getCursoComNome(id_curso) {
        const [rows] = await connection.query(
            `SELECT nc.id_nome_curso, nc.nome AS nome_curso
             FROM curso_nome cn
             INNER JOIN nome_cursos nc ON cn.id_nome_curso = nc.id_nome_curso
             WHERE cn.id_curso = ?`,
            [id_curso]
        );
        return rows[0] || {}; // retorna vazio se não tiver nome vinculado
    }    

    // ==================== ATUALIZAR ====================

    static async updateCurso(id_curso, { nivel, preco, parcelas_max }) {
        try {
            await connection.query(
                "UPDATE cursos SET nivel = ?, preco = ?, parcelas_max = ? WHERE id_curso = ?",
                [nivel, preco, parcelas_max, id_curso]
            );
        } catch (error) {
            console.error("Erro ao atualizar curso:", error);
            throw error;
        }
    }

    static async updateTurma(id_turma, { nome_sgset, local, turno, inicio, termino, carga_horaria, vagas, matriculas, status }) {
        try {
            await connection.query(
                `UPDATE turmas 
                 SET nome_sgset = ?, local = ?, turno = ?, inicio = ?, termino = ?, carga_horaria = ?, vagas = ?, matriculas = ?, status = ?
                 WHERE id_turma = ?`,
                [nome_sgset, local, turno, inicio, termino, carga_horaria, vagas, matriculas, status, id_turma]
            );

        // Chamar a função para gerar os dias letivos (calcular o início e término com base em carga horária e feriados)
        const diasLetivos = await CreateModel.gerarDiasLetivos(id_turma);
        
        // Atualizar o início e término calculado, se necessário
        if (diasLetivos) {
            await connection.query(
                `UPDATE turmas SET inicio = ?, termino = ? WHERE id_turma = ?`,
                [diasLetivos.inicio, diasLetivos.termino, id_turma]
            );
        }

        } catch (error) {
            console.error("Erro ao atualizar turma:", error);
            throw error;
        }
    }

    static async updateTurmaAsa({ id_turma, nome_sgset, vagas, matriculas }) {
        try {
            await connection.query(
                "UPDATE turmas SET nome_sgset = ?, vagas = ?, matriculas = ? WHERE id_turma = ?",
                [nome_sgset, vagas, matriculas, id_turma]
            );
        } catch (error) {
            console.error("Erro ao atualizar turma (ASA):", error);
            throw error;
        }
    }

    static async updateNomeCurso(id_curso, id_nome_curso) {
        try {
            // Deleta vínculo antigo
            await connection.query("DELETE FROM curso_nome WHERE id_curso = ?", [id_curso]);
            // Cria novo vínculo
            await connection.query(
                "INSERT INTO curso_nome (id_curso, id_nome_curso) VALUES (?, ?)",
                [id_curso, id_nome_curso]
            );
        } catch (error) {
            console.error("Erro ao atualizar nome do curso:", error);
            throw error;
        }
    }

    static async updateDocenteTurma(id_turma, id_docente) {
        try {
            // Remove docentes antigos
            await connection.query("DELETE FROM docentes_turmas WHERE id_turma = ?", [id_turma]);
            // Insere novo docente
            if (id_docente) {
                await connection.query(
                    "INSERT INTO docentes_turmas (id_turma, id_docente) VALUES (?, ?)",
                    [id_turma, id_docente]
                );
            }
        } catch (error) {
            console.error("Erro ao atualizar docente da turma:", error);
            throw error;
        }
    }

    // ==================== HORÁRIOS ====================

    static async deleteHorariosTurma(id_turma) {
        try {
            await connection.query("DELETE FROM turmas_horarios WHERE id_turma = ?", [id_turma]);
        } catch (error) {
            console.error("Erro ao deletar horários:", error);
            throw error;
        }
    }

    static async createHorarioTurma({ id_turma, dia_semana, horario_inicio, horario_fim }) {
        try {
            await connection.query(
                "INSERT INTO turmas_horarios (id_turma, dia_semana, horario_inicio, horario_fim) VALUES (?, ?, ?, ?)",
                [id_turma, dia_semana, horario_inicio, horario_fim]
            );
        } catch (error) {
            console.error("Erro ao criar horário:", error);
            throw error;
        }
    }
}

module.exports = EditModel;
