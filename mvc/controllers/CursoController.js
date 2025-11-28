const autenticar = require("../model/middlewares");
const CursoModel = require("../model/CursoModel");
const verificarSenhaAlterada = require("../model/verficarSenhaAlterada");

class CursoController {
    constructor(app) {
        // Página inicial
        // Listar cursos
        app.get("/cursos", autenticar, verificarSenhaAlterada, async (req, res) => {
            try {
                const cursos = await CursoModel.listar();
                res.render("Curso/cursoHome", { cursos }); // Passa os cursos para a view
            } catch (err) {
                console.error(err);
                res.status(500).send("Erro ao listar cursos");
            }
        });

        // Tela de criação
        app.get("/curso/criar", autenticar, verificarSenhaAlterada, (req, res) => {
            res.render("Curso/cursoCreate");
        });

        // Criar curso
        app.post("/curso/criar", autenticar, verificarSenhaAlterada, async (req, res) => {
            try {
                // Garantir que 'cursos' sempre seja array
                let cursosSelecionados = req.body.cursos || []; // se nada for selecionado
                if (!Array.isArray(cursosSelecionados)) cursosSelecionados = [cursosSelecionados];
        
                const dados = {
                    nome: req.body.nome,
                    status: req.body.status,
                    cursos: cursosSelecionados
                };
        
                await CursoModel.criar(dados);
                res.redirect("/cursos");
            } catch (err) {
                console.error(err);
                res.status(500).send("Erro ao criar curso");
            }
        });
        

        
        // Tela de edição do nome do curso
        app.get("/curso/nome/edit/:id", autenticar, verificarSenhaAlterada, async (req, res) => {
            try {
                const idNomeCurso = req.params.id;
                const resultado = await CursoModel.buscarNomePorId(idNomeCurso); // usar versão async
                if (!resultado[0]) return res.status(404).send("Nome do curso não encontrado");
        
                res.render("Curso/cursoEdit", { curso: resultado[0] }); // envia o objeto 'curso'
            } catch (err) {
                console.error(err);
                res.status(500).send("Erro ao buscar curso");
            }
        });

        // Atualizar nome do curso + cursos associados
        app.post("/curso/nome/edit/:id", autenticar, verificarSenhaAlterada, async (req, res) => {
            try {
                const idNomeCurso = req.params.id;
                const dados = {
                    nome: req.body.nome,
                    status: req.body.status,
                    cursos: [] // Se tiver cursos associados, preencha aqui
                };
                await CursoModel.atualizarNomeComCursos(idNomeCurso, dados);
                res.redirect("/cursos");
            } catch (err) {
                console.error(err);
                res.status(500).send("Erro ao atualizar curso");
            }
        });

        // Deletar curso
        app.post("/curso/nome/deletar/:id", autenticar, verificarSenhaAlterada, async (req, res) => {
            try {
                const id = req.params.id;
                await CursoModel.deletar(id);
                res.redirect("/cursos");
            } catch (err) {
                console.error(err);
                res.status(500).send("Erro ao deletar curso");
            }
        });
    }
}

module.exports = CursoController;
