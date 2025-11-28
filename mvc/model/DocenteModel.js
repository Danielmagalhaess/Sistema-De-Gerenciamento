const connection = require("./BancoModel"); // Sua conexão MySQL

class DocenteModel {

    // LISTAR TODOS OS DOCENTES
    static async getAll() {
        try {
            const [rows] = await connection.query("SELECT * FROM docente ORDER BY nome ASC");
            return rows;
        } catch (error) {
            console.error("Erro ao buscar docentes:", error);
            throw error;
        }
    }

    // PEGAR DOCENTE POR ID
    static async getById(id_docente) {
        try {
            const [rows] = await connection.query("SELECT * FROM docente WHERE id_docente = ?", [id_docente]);
            return rows[0] || null;
        } catch (error) {
            console.error("Erro ao buscar docente:", error);
            throw error;
        }
    }

    // CRIAR NOVO DOCENTE
    static async create({ nome, nif, status }) {
        try {
            await connection.query(
                "INSERT INTO docente (nome, nif, status) VALUES (?, ?, ?)",
                [nome, nif, status || "ativo"]
            );
        } catch (error) {
            console.error("Erro ao criar docente:", error);
            throw error;
        }
    }

    // ATUALIZAR DOCENTE
    static async update(id_docente, { nome, nif, status }) {
        try {
            await connection.query(
                "UPDATE docente SET nome = ?, nif = ?, status = ? WHERE id_docente = ?",
                [nome, nif, status, id_docente]
            );
        } catch (error) {
            console.error("Erro ao atualizar docente:", error);
            throw error;
        }
    }

    // DELETAR DOCENTE
    static async delete(id_docente) {
        try {
            await connection.query("DELETE FROM docente WHERE id_docente = ?", [id_docente]);
        } catch (error) {
            console.error("Erro ao deletar docente:", error);
            throw error;
        }
    }
}

module.exports = DocenteModel;
