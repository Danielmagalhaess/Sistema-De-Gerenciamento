const DocenteModel = require("../model/DocenteModel");
const verificarSenhaAlterada = require("../model/verficarSenhaAlterada");
const autenticar = require("../model/middlewares");

class DocenteController {
    constructor(app) {

        // LISTAR DOCENTES
        app.get("/docentes", autenticar, verificarSenhaAlterada, async (req, res) => {
            // Garantir que usuario sempre existe
            const usuario = req.session.usuario || {};

             // Bloquear assistentes sociais
            if (usuario.cargo === "asa") {
                return res.status(403).send("Acesso negado");
            }
            try {
                const docentes = await DocenteModel.getAll();
                res.render("Docente/docenteHome.ejs", { docentes });
            } catch (err) {
                console.error("Erro ao buscar docentes:", err);
                res.status(500).send("Erro ao carregar docentes");
            }
        });

        // FORMULÁRIO DE CRIAÇÃO
        app.get("/docentes/create", autenticar, verificarSenhaAlterada, (req, res) => {
            // Garantir que usuario sempre existe
            const usuario = req.session.usuario || {};

             // Bloquear assistentes sociais
            if (usuario.cargo === "asa") {
                return res.status(403).send("Acesso negado");
            }
            res.render("Docente/docenteCreate.ejs");
        });

        // SALVAR NOVO DOCENTE
        app.post("/docentes/create", async (req, res) => {
            try {
                await DocenteModel.create(req.body);
                res.redirect("/docentes");
            } catch (err) {
                console.error("Erro ao cadastrar docente:", err);
                res.status(500).send("Erro ao cadastrar docente");
            }
        });

        // FORMULÁRIO DE EDIÇÃO
        app.get("/docentes/edit/:id", verificarSenhaAlterada, async (req, res) => {
            // Garantir que usuario sempre existe
            const usuario = req.session.usuario || {};

             // Bloquear assistentes sociais
            if (usuario.cargo === "assistente_social") {
                return res.status(403).send("Acesso negado");
            }
            try {
                const docente = await DocenteModel.getById(req.params.id);
                if (!docente) return res.status(404).send("Docente não encontrado");
                res.render("Docente/docenteEdit.ejs", { docente });
            } catch (err) {
                console.error("Erro ao buscar docente:", err);
                res.status(500).send("Erro ao carregar docente");
            }
        });

        // SALVAR EDIÇÃO
        app.post("/docentes/edit/:id", async (req, res) => {
            try {
                await DocenteModel.update(req.params.id, req.body);
                res.redirect("/docentes");
            } catch (err) {
                console.error("Erro ao atualizar docente:", err);
                res.status(500).send("Erro ao atualizar docente");
            }
        });

        // DELETAR DOCENTE
        app.post("/docentes/delete/:id", async (req, res) => {
            try {
                await DocenteModel.delete(req.params.id);
                res.redirect("/docentes");
            } catch (err) {
                console.error("Erro ao deletar docente:", err);
                res.status(500).send("Erro ao deletar docente");
            }
        });

    }
}

module.exports = DocenteController;
