const connection = require("../model/BancoModel"); // aqui connection é um pool promise

class CursoModel {
    // 🔹 Listar todos os cursos com seus nomes
    static async listar() {
        const sql = `
            SELECT 
                nc.id_nome_curso,
                nc.nome AS nome_curso,
                nc.status,
                GROUP_CONCAT(c.nivel SEPARATOR ', ') AS niveis
            FROM nome_cursos nc
            LEFT JOIN curso_nome cn ON nc.id_nome_curso = cn.id_nome_curso
            LEFT JOIN cursos c ON cn.id_curso = c.id_curso
            GROUP BY nc.id_nome_curso, nc.nome, nc.status
            ORDER BY nc.id_nome_curso DESC
        `;
        const [rows] = await connection.query(sql);
        return rows;
    }

    // Buscar nome por ID (async/await)
    static async buscarNomePorId(id) {
        const sql = "SELECT * FROM nome_cursos WHERE id_nome_curso = ?";
        const [rows] = await connection.query(sql, [id]);
        return rows;
    }

    // 🔹 Criar novo curso
    static async criar(dados) {
        // 1️⃣ Inserir em nome_cursos
        const sqlNome = `INSERT INTO nome_cursos (nome, status) VALUES (?, ?)`;
        const [result] = await connection.query(sqlNome, [dados.nome, dados.status]);
        const id_nome_curso = result.insertId;

        // 2️⃣ Associar cursos selecionados
        if (dados.cursos && dados.cursos.length > 0) {
            const valores = dados.cursos.map(id_curso => [id_curso, id_nome_curso]);
            const sqlAssoc = `INSERT INTO curso_nome (id_curso, id_nome_curso) VALUES ?`;
            await connection.query(sqlAssoc, [valores]);
        }
    }

    // Atualizar nome do curso e cursos associados
    static async atualizarNomeComCursos(idNomeCurso, dados) {
        // 1️⃣ Atualiza o nome e o status do curso
        const sqlNome = "UPDATE nome_cursos SET nome = ?, status = ? WHERE id_nome_curso = ?";
        await connection.query(sqlNome, [dados.nome, dados.status, idNomeCurso]);

        // 2️⃣ Se o usuário enviou cursos para atualizar, recria as associações
        if (Array.isArray(dados.cursos) && dados.cursos.length > 0) {
            // Remove associações antigas
            const sqlDel = "DELETE FROM curso_nome WHERE id_nome_curso = ?";
            await connection.query(sqlDel, [idNomeCurso]);

            // Insere novas associações
            const valores = dados.cursos.map(id_curso => [id_curso, idNomeCurso]);
            const sqlAssoc = "INSERT INTO curso_nome (id_curso, id_nome_curso) VALUES ?";
            await connection.query(sqlAssoc, [valores]);
        }
        // ✅ Caso contrário (nenhum curso enviado), mantém os vínculos existentes
        // Assim o nome é atualizado sem quebrar a relação curso_nome
    }
    // 🔹 Deletar curso
    static async deletar(id_nome_curso) {
        const sql = "DELETE FROM nome_cursos WHERE id_nome_curso = ?";
        await connection.query(sql, [id_nome_curso]);
    }
}

module.exports = CursoModel;
