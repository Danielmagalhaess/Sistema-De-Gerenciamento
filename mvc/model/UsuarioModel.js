const connection = require("./BancoModel");

class UsuarioModel {
    static async getAll() {
        const [rows] = await connection.query(`
            SELECT 
                id_usuario,
                nif,
                cargo,
                ultimo_acesso
            FROM usuarios
            ORDER BY id_usuario DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await connection.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id]);
        return rows[0];
    }

    static async create({ nif, senha, cargo }) {
        await connection.query(
            "INSERT INTO usuarios (nif, senha, cargo) VALUES (?, ?, ?)",
            [nif, senha, cargo]
        );
    }

    static async update(id, { nif, senha, cargo }) {
        if (senha) {
            await connection.query(
                "UPDATE usuarios SET nif = ?, senha = ?, cargo = ? WHERE id_usuario = ?",
                [nif, senha, cargo, id]
            );
        } else {
            await connection.query(
                "UPDATE usuarios SET nif = ?, cargo = ? WHERE id_usuario = ?",
                [nif, cargo, id]
            );
        }
    }

    static async delete(id) {
        await connection.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    }
}

module.exports = UsuarioModel;
