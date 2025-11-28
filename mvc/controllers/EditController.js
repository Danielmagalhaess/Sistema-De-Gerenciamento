const EditModel = require("../model/EditModel");
const autenticar = require("../model/middlewares");
const verificarSenhaAlterada = require("../model/verficarSenhaAlterada");

class EditController {
    constructor(app) {
        // ==================== RENDER EDIT ====================
        app.get("/edit/:id_curso", autenticar, verificarSenhaAlterada, async (req, res) => {
            const id_curso = req.params.id_curso;
            const usuario = req.session.usuario || {};
            
            try {
                const curso = await EditModel.getCursoById(id_curso);
                const turmas = await EditModel.getTurmasByCurso(id_curso);
                const turma = turmas[0] || {};
                const parcelas = await EditModel.getParcelasByCurso(id_curso);
                const horarios = turma.id_turma ? await EditModel.getHorariosByTurma(turma.id_turma) : [];
                const docentes = await EditModel.getAllDocentes();
                const nomesCursos = await EditModel.getAllCourseNames();
                const exibir_nome = await EditModel.getCursoComNome(id_curso);
                const showTour = req.session.primeiroAcessoEdit === true;

                if (showTour) req.session.primeiroAcessoEdit = false;

                res.render("Home/edit.ejs", {
                    curso,
                    exibir_nome,
                    turma,
                    parcelas,
                    horarios,
                    docentes,
                    usuario,
                    nomesCursos,
                    showTour
                });

                req.session.primeiroAcesso = false;

            } catch (err) {
                console.error("Erro ao carregar dados para edição:", err);
                res.status(500).send("Erro ao carregar dados para edição");
            }
        });

        // ==================== UPDATE CURSO ====================
        app.post("/edit/:id_curso", autenticar, async (req, res) => {
            const id_curso = req.params.id_curso;
            const data = req.body;
            const usuario = req.session.usuario || {};

            // Converter valores formatados
            function limparValor(valor) {
                if (!valor) return 0;
                return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
            }

            try {

                // Validação back-end: verificar se o curso existe
                if (data.id_nome_curso) {
                    const cursoValido = await EditModel.getCursoNomeById(parseInt(data.id_nome_curso));
                    if (!cursoValido) {
                        return res.status(400).send("Curso inválido. Selecione um curso da lista.");
                    }
                }

                // Validação back-end: verificar se o docente existe (se houver)
                if (data.id_docente) {
                    const docenteValido = await EditModel.getDocenteById(parseInt(data.id_docente));
                    if (!docenteValido) {
                        return res.status(400).send("Docente inválido. Selecione um docente da lista.");
                    }
                }

                // Pegar turma vinculada
                const turmas = await EditModel.getTurmasByCurso(id_curso);
                const turma = turmas[0];
                if (!turma) {
                    console.error("Nenhuma turma encontrada para o curso:", id_curso);
                    return res.status(404).send("Turma não encontrada");
                }

                // Se for usuário ASA (assistente social)
                if (usuario.cargo === "asa") {
                    await EditModel.updateTurmaAsa({
                        id_turma: turma.id_turma,
                        nome_sgset: data.nomeTurma,
                        vagas: parseInt(data.vagas || 0),
                        matriculas: parseInt(data.matriculasRealizadas || 0)
                    });
                } else {
                    // Atualiza nome do curso, se selecionado
                    if (data.id_nome_curso) {
                        await EditModel.updateNomeCurso(id_curso, parseInt(data.id_nome_curso));
                    }

                    // Atualiza curso
                    await EditModel.updateCurso(id_curso, {
                        nivel: data.nivelCurso,
                        preco: limparValor(data.valorInteiro),
                        parcelas_max: parseInt(data.numeroParcelas || 1)
                    });

                    // Atualiza turma
                    await EditModel.updateTurma(turma.id_turma, {
                        nome_sgset: data.nomeTurma,
                        docente: data.id_docente || null,
                        local: data.local,
                        turno: data.turno,
                        inicio: data.dataInicio,
                        termino: data.dataTermino,
                        carga_horaria: parseInt(data.cargaHoraria || 0),
                        vagas: parseInt(data.vagas || 0),
                        matriculas: parseInt(data.matriculasRealizadas || 0),
                        status: data.statusCurso || "sem-cor"
                    });

                    // Atualiza docente
                    if (data.id_docente) {
                        await EditModel.updateDocenteTurma(turma.id_turma, parseInt(data.id_docente));
                    } else {
                        await EditModel.updateDocenteTurma(turma.id_turma, null);
                    }


                    // Atualiza horários
                    const dias = [
                        { nome: "Segunda", ativo: data.segunda_ativa, inicio: data.horario_inicio_segunda, fim: data.horario_fim_segunda },
                        { nome: "Terça", ativo: data.terca_ativa, inicio: data.horario_inicio_terca, fim: data.horario_fim_terca },
                        { nome: "Quarta", ativo: data.quarta_ativa, inicio: data.horario_inicio_quarta, fim: data.horario_fim_quarta },
                        { nome: "Quinta", ativo: data.quinta_ativa, inicio: data.horario_inicio_quinta, fim: data.horario_fim_quinta },
                        { nome: "Sexta", ativo: data.sexta_ativa, inicio: data.horario_inicio_sexta, fim: data.horario_fim_sexta },
                        { nome: "Sábado", ativo: data.sabado_ativa, inicio: data.horario_inicio_sabado, fim: data.horario_fim_sabado },
                    ];

                    // Deleta antigos
                    await EditModel.deleteHorariosTurma(turma.id_turma);

                    // Cria novos
                    for (let dia of dias) {
                        if (dia.ativo) {
                            await EditModel.createHorarioTurma({
                                id_turma: turma.id_turma,
                                dia_semana: dia.nome,
                                horario_inicio: dia.inicio,
                                horario_fim: dia.fim
                            });
                        }
                    }
                }

                res.redirect("/home");
            } catch (err) {
                console.error("Erro ao atualizar curso:", err);
                res.status(500).send("Erro ao atualizar curso");
            }
        });
    }
}

module.exports = EditController;
