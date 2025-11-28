const CreateModel = require("../model/CreateModel");
const verificarSenhaAlterada = require("../model/verficarSenhaAlterada");
const autenticar = require("../model/middlewares");

class HomeController {
    constructor(app) {
        app.get("/home", autenticar, verificarSenhaAlterada, async (req, res) => {
            try {
                const cursosDb = await CreateModel.getAllCursos();
                const cursosCompletos = [];

                for (const curso of cursosDb) {
                    const turmas = await CreateModel.getTurmasByCurso(curso.id_curso);

                    for (const turma of turmas) {
                        // Busca horários da turma
                        const horarios = await CreateModel.getHorariosByTurma(turma.id_turma);

                        // Agrupa horários iguais por dias
                        const horariosAgrupados = {};
                        for (const h of horarios) {
                            if (!h.horario_inicio || !h.horario_fim) continue;

                            // Remove os segundos
                            const inicio = h.horario_inicio.substring(0, 5); // HH:MM
                            const fim = h.horario_fim.substring(0, 5);       // HH:MM

                            const key = `${inicio} às ${fim}`;
                            if (!horariosAgrupados[key]) horariosAgrupados[key] = [];
                            horariosAgrupados[key].push(h.dia_semana);
                        }

                        // Transforma em texto legível, agrupando dias com o mesmo horário
                        const horariosTexto = Object.entries(horariosAgrupados)
                            .map(([horario, dias]) => `${dias.join(' e ')} - ${horario}`)
                            .join('<br>'); // <br> para quebrar linha no HTML

                          // Aqui pega o nome do curso correto
                        const nomeCurso = await CreateModel.getNomeCursoByCurso(curso.id_curso);

                        // Array de dias para gerar o calendário
                        const diasArray = horarios.map(h => h.dia_semana); // ["Segunda", "Sábado"]

                        // Monta o objeto do curso completo
                        cursosCompletos.push({
                            id: curso.id_curso,
                            nome: nomeCurso,
                            nivel: curso.nivel || "-",
                            nome_sgset: turma.nome_sgset || "-",
                            docente: turma.nome_docente || "-",
                            local: turma.local || "-",
                            turno: turma.turno || "-",
                            dias: horariosTexto || "-",
                            diasArray: diasArray, // para o calendário
                            dataInicio: turma.inicio ? turma.inicio.toISOString().split("T")[0] : "-",
                            dataTermino: turma.termino ? turma.termino.toISOString().split("T")[0] : "-",
                            cargaHoraria: turma.carga_horaria || "-",
                            vagas: turma.vagas || "-",
                            matriculas: turma.matriculas || 0,
                            statusCurso: turma.status || "sem-cor",
                            preco: curso.preco || 0,
                            parcelas_max: curso.parcelas_max || 0,
                            id_turma: turma.id_turma
                        });
                    }
                }

                // Garante que o usuário exista
                const usuario = req.session.usuario || {};

                const showTour = req.session.primeiroAcessoHome === true;

                if (showTour) req.session.primeiroAcessoHome = false;


                res.render("Home/home", { cursos: cursosCompletos, usuario, showTour });


            } catch (err) {
                console.error("Erro ao carregar cursos:", err);
                res.send("Erro ao carregar cursos");
            }
        });
    }
}

module.exports = HomeController;
