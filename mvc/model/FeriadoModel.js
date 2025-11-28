const connection = require("../model/BancoModel");

class FeriadoModel {
    static async getAll() {
        const [rows] = await connection.query(`
            SELECT 
                id_feriado,
                nome,
                DATE_FORMAT(data_feriado, '%d/%m/%Y') AS data_formatada,
                DATE_FORMAT(data_feriado, '%W') AS dia_semana,
                tipo,
                observacao
            FROM feriados
            ORDER BY data_feriado ASC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await connection.query("SELECT * FROM feriados WHERE id_feriado = ?", [id]);
        return rows[0];
    }

    static async create({ nome, data_feriado, tipo, observacao }) {
        await connection.query(
            "INSERT INTO feriados (nome, data_feriado, tipo, observacao) VALUES (?, ?, ?, ?)",
            [nome, data_feriado, tipo, observacao]
        );
    }

    static async update(id, { nome, data_feriado, tipo, observacao }) {
        await connection.query(
            "UPDATE feriados SET nome = ?, data_feriado = ?, tipo = ?, observacao = ? WHERE id_feriado = ?",
            [nome, data_feriado, tipo, observacao, id]
        );
    }

    static async delete(id) {
        await connection.query("DELETE FROM feriados WHERE id_feriado = ?", [id]);
    }
}

module.exports = FeriadoModel;
