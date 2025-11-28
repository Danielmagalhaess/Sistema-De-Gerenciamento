const FeriadoModel = require("../model/FeriadoModel");
const verificarSenhaAlterada = require("../model/verficarSenhaAlterada");
const autenticar = require("../model/middlewares");

class FeriadoController {
    constructor(app) {
        
        // LISTAR FERiados
        app.get("/feriados", autenticar, verificarSenhaAlterada, async (req, res) => {
            // Garantir que usuario sempre existe
            const usuario = req.session.usuario || {};

             // Bloquear assistentes sociais
            if (usuario.cargo === "asa") {
                return res.status(403).send("Acesso negado");
            }
            try {
                await connection.query("SET lc_time_names = 'pt_BR'");
                const feriados = await FeriadoModel.getAll();
                res.render("Feriado/feriadoHome.ejs", { feriados, usuario});
            } catch (err) {
                console.error("Erro ao buscar feriados:", err);
                res.status(500).send("Erro ao carregar feriados");
            }
        });

        // FORMULÁRIO DE CRIAÇÃO
        app.get("/feriados/create", verificarSenhaAlterada, (req, res) => {
            // Garantir que usuario sempre existe
            const usuario = req.session.usuario || {};

             // Bloquear assistentes sociais
            if (usuario.cargo === "asa") {
                return res.status(403).send("Acesso negado");
            }
            res.render("Feriado/feriadoCreate.ejs");
        });

        // SALVAR NOVO FERIADO
        app.post("/feriados/create", async (req, res) => {
            try {
                await FeriadoModel.create(req.body);
                res.redirect("/feriados");
            } catch (err) {
                console.error("Erro ao cadastrar feriado:", err);
                res.status(500).send("Erro ao cadastrar feriado");
            }
        });

        // FORMULÁRIO DE EDIÇÃO
        app.get("/feriados/edit/:id", verificarSenhaAlterada, async (req, res) => {
            // Garantir que usuario sempre existe
            const usuario = req.session.usuario || {};

             // Bloquear assistentes sociais
            if (usuario.cargo === "asa") {
                return res.status(403).send("Acesso negado");
            }
            try {
                await connection.query("SET lc_time_names = 'pt_BR'");
                const feriado = await FeriadoModel.getById(req.params.id);

                if (!feriado) return res.status(404).send("Feriado não encontrado");
                res.render("Feriado/feriadoEdit.ejs", { feriado });
            } catch (err) {
                console.error("Erro ao buscar feriado:", err);
                res.status(500).send("Erro ao carregar feriado");
            }
        });

        // SALVAR EDIÇÃO
        app.post("/feriados/edit/:id", async (req, res) => {
            try {
                await FeriadoModel.update(req.params.id, req.body);
                res.redirect("/feriados");
            } catch (err) {
                console.error("Erro ao atualizar feriado:", err);
                res.status(500).send("Erro ao atualizar feriado");
            }
        });

        // DELETAR FERiado
        app.post("/feriados/delete/:id", async (req, res) => {
            try {
                await FeriadoModel.delete(req.params.id);
                res.redirect("/feriados");
            } catch (err) {
                console.error("Erro ao deletar feriado:", err);
                res.status(500).send("Erro ao deletar feriado");
            }
        });

    }
}

module.exports = FeriadoController;
