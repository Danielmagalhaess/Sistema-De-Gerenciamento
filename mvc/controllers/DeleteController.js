const DeleteModel = require("../model/deleteModel");

class DeleteController {
    constructor(app) {
        this.app = app;
        this.rotas();
    }

    rotas() {
        // Rota para deletar um curso específico
        this.app.post("/delete/:id", this.deleteCurso.bind(this));
    }

    async deleteCurso(req, res) {
        const { id } = req.params;

        try {
            await DeleteModel.deleteCursoCompleto(id);
            req.session.mensagem = { texto: "Curso excluído com sucesso!" };
            res.redirect("/home");
        } catch (err) {
            console.error(err);
            req.session.mensagem = { texto: "Erro ao excluir o curso!" };
            res.redirect("/home");
        }
    }
}

module.exports = DeleteController;
