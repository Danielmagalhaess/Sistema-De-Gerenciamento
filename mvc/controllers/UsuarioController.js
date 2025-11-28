const UsuarioModel = require("../model/UsuarioModel");
const autenticar = require("../model/middlewares");
const verificarSenhaAlterada = require("../model/verficarSenhaAlterada");
const bcrypt = require("bcryptjs");

class UsuarioController {
    constructor(app) {

        // LISTAR USUÁRIOS
        app.get("/usuarios", autenticar, verificarSenhaAlterada, async (req, res) => {
            const usuario = req.session.usuario || {};

            if (usuario.cargo === "asa") return res.status(403).send("Acesso negado");

            try {
                const usuarios = await UsuarioModel.getAll();
                res.render("Usuario/usuarioHome.ejs", { usuarios, usuario });
            } catch (err) {
                console.error("Erro ao buscar usuários:", err);
                res.status(500).send("Erro ao carregar usuários");
            }
        });

        // FORMULÁRIO DE CRIAÇÃO
        app.get("/usuarios/create", autenticar, (req, res) => {
            const usuario = req.session.usuario || {};
            if (usuario.cargo === "asa") return res.status(403).send("Acesso negado");
            res.render("Usuario/usuarioCreate.ejs");
        });

        // SALVAR NOVO USUÁRIO
        app.post("/usuarios/create", autenticar, async (req, res) => {
            try {
                const { nif, senha, cargo } = req.body;
                const hash = await bcrypt.hash(senha, 10);
                await UsuarioModel.create({ nif, senha: hash, cargo });
                res.redirect("/usuarios");
            } catch (err) {
                console.error("Erro ao criar usuário:", err);
                res.status(500).send("Erro ao criar usuário");
            }
        });

        // FORMULÁRIO DE EDIÇÃO
        app.get("/usuarios/edit/:id", autenticar, async (req, res) => {
            const usuario = req.session.usuario || {};
            if (usuario.cargo === "asa") return res.status(403).send("Acesso negado");

            try {
                const usuarioEdit = await UsuarioModel.getById(req.params.id);
                if (!usuarioEdit) return res.status(404).send("Usuário não encontrado");
                res.render("Usuario/usuarioEdit.ejs", { usuario: usuarioEdit });
            } catch (err) {
                console.error("Erro ao buscar usuário:", err);
                res.status(500).send("Erro ao carregar usuário");
            }
        });

        // SALVAR EDIÇÃO
        app.post("/usuarios/edit/:id", autenticar, async (req, res) => {
            try {
                const { nif, senha, cargo } = req.body;
                let hash;
                if (senha && senha.trim() !== "") hash = await bcrypt.hash(senha, 10);

                await UsuarioModel.update(req.params.id, { nif, senha: hash, cargo });
                res.redirect("/usuarios");
            } catch (err) {
                console.error("Erro ao atualizar usuário:", err);
                res.status(500).send("Erro ao atualizar usuário");
            }
        });

        // DELETAR USUÁRIO
        app.post("/usuarios/delete/:id", autenticar, async (req, res) => {
            try {
                const UsuarioController = req.session.usuario

                await UsuarioModel.delete(req.params.id);

                if(UsuarioController.id_usuario == req.params.id)
                {
                    req.session.destroy(() => {
                        res.redirect("/")
                    })
                 
                }
                else{
                    res.redirect("/usuarios");
                }

               
            } catch (err) {
                console.error("Erro ao excluir usuário:", err);
                res.status(500).send("Erro ao excluir usuário");
            }
        });

    }
}

module.exports = UsuarioController;
