const connection = require("../model/BancoModel");
const bcrypt = require("bcrypt");

class AuthModel {
    constructor(nif, senha) {
        this.nif = nif;
        this.senha = senha;
    }

    async login() {
        const invalido = "Preencha os campos corretamente";
        const senhaInvalida = "Senha inválida";
        const usuarioInvalido = "Usuário inválido";

        if (!this.nif || !this.senha) {
            return { invalido, senhaInvalida: "", usuarioInvalido: "" };
        }

        const [rows] = await connection.execute(
            "SELECT * FROM usuarios WHERE nif = ?",
            [this.nif]
        );

        if (rows.length === 0) return { invalido: "", senhaInvalida: "", usuarioInvalido };

        const usuario = rows[0];
        const senhaCorreta = await bcrypt.compare(this.senha, usuario.senha);

        if (!senhaCorreta) return { invalido: "", senhaInvalida, usuarioInvalido: "" };

        // Buscar permissões do usuário
        const [perms] = await connection.execute(
            `SELECT p.*
             FROM permissoes p
             INNER JOIN usuarios_permissoes up ON p.id_permissao = up.id_permissao
             WHERE up.id_usuario = ?`,
            [usuario.id_usuario]
        );

        const permissoes = perms[0] || {};

        return { sucesso: true, usuario, permissoes };
    }

    static async updateUltimoAcesso(id_usuario) {
        const now = new Date(); // data e hora atual
        const sql = "UPDATE usuarios SET ultimo_acesso = ? WHERE id_usuario = ?";
        await connection.execute(sql, [now, id_usuario]);
    }

    static async updateSenha(id_usuario, senha_hash) {
        const sql = "UPDATE usuarios SET senha = ? WHERE id_usuario = ?";
        await connection.execute(sql, [senha_hash, id_usuario]);
    }
    
    static async updateJaLogou(id_usuario) {
        const sql = "UPDATE usuarios SET ja_logou = 1 WHERE id_usuario = ?";
        await connection.execute(sql, [id_usuario]);
    }
}

module.exports = AuthModel;
