const connection = require("./BancoModel");

async function verificarSenhaAlterada(req, res, next) {
    const usuario = req.session.usuario;

    if (!usuario) return res.redirect("/login");

    try {
        const [rows] = await connection.query(
            "SELECT ja_logou FROM usuarios WHERE id_usuario = ?",
            [usuario.id_usuario]
        );

        if (!rows || rows.length === 0) {
            return res.status(403).send("Usuário não encontrado");
        }

        if (rows[0].ja_logou === 0) {
            return res.redirect("/usuarios/mudar-senha"); // redireciona para obrigar alteração de senha
        }

        next();
    } catch (err) {
        console.error("Erro ao verificar senha do usuário:", err);
        res.status(500).send("Erro interno");
    }
}

module.exports = verificarSenhaAlterada;