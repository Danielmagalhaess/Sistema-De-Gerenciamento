const CreateModel = require("../model/CreateModel");
const verificarSenhaAlterada = require("../model/verficarSenhaAlterada");
const autenticar = require("../model/middlewares");


class CreateController {
    constructor(app) {
        // Renderiza o formulário de criação
        app.get("/create", autenticar, verificarSenhaAlterada, async (req, res) => {
            // Garantir que usuario sempre existe
            const usuario = req.session.usuario || {};

             // Bloquear assistentes sociais
            if (usuario.cargo === "asa") {
                return res.status(403).send("Acesso negado");
            }
            try {
                const docentes = await CreateModel.getAllDocentes();
                const nomesCursos = await CreateModel.getAllNomeCursos();
                const showTour = req.session.primeiroAcessoCreate === true;

                if (showTour) req.session.primeiroAcessoCreate = false;


                res.render("Home/create.ejs", { docentes, nomesCursos, showTour });

            } catch (err) {
                console.error(err);
                res.send("Erro ao carregar o formulário");
            }
        }); 
        
        app.get("/api/feriados", async (req, res) => {
            try {
                const ano = parseInt(req.query.ano);
                const feriados = await CreateModel.getFeriadosFormatados(ano);
                res.json([...feriados]); // transforma Set → array
            } catch (err) {
                console.error(err);
                res.status(500).send("Erro ao buscar feriados");
            }
        });
    

        // Recebe os dados do formulário
        app.post("/add", autenticar, async (req, res) => {
            try {
                const data = req.body;

                function limparValor(valor) {
                    if (!valor) return 0;
                    // Remove os pontos de milhar e substitui vírgula por ponto
                    return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
                }

                // Cria o curso
                const idCurso = await CreateModel.createCurso({
                    nivel: data.nivelCurso,
                    preco: limparValor(data.valorInteiro),
                    parcelas_max: parseInt(data.numeroParcelas || 1)
                });

                 // Verificar se nomeCurso é um número (ID) ou nome e buscar ID
                 let idNomeCurso;
                 if (isNaN(data.nomeCurso)) {
                     // Se for nome, buscar no banco de dados
                     const curso = await CreateModel.buscarCursoPorNome(data.nomeCurso);
                     if (!curso) {
                         return res.status(400).send("Curso com esse nome não encontrado");
                     }
                     idNomeCurso = curso.id_nome_curso;
                 } else {
                     idNomeCurso = parseInt(data.nomeCurso, 10);
                 }
 
                 // Vincular ao nome do curso
                 await CreateModel.vincularNomeCurso({
                     id_curso: idCurso,
                     id_nome_curso: idNomeCurso
                 });
                 
                // Trata os dias da semana corretamente
                let diasSelecionados = data.dias_semana;
                if (!Array.isArray(diasSelecionados)) {
                    diasSelecionados = diasSelecionados ? [diasSelecionados] : [];
                }

                // Cria a turma associada
                const idTurma = await CreateModel.createTurma({
                    id_curso: idCurso,
                    nome_sgset: data.nomeTurma,
                    docente: data.docente,
                    local: data.local,
                    turno: data.turno,
                    dias: diasSelecionados.join(', '),
                    horario_inicio: data.horarioInicio,
                    horario_fim: data.horarioFim,
                    inicio: data.dataInicio,
                    termino: data.dataTermino,
                    carga_horaria: parseInt(data.cargaHoraria || 0),
                    vagas: parseInt(data.vagas || 0),
                    matriculas: parseInt(data.matriculasRealizadas || 0),
                    status: data.statusCurso || "sem-cor"
                });
   
                const docenteId = parseInt(data.id_docente, 10);
                if (!isNaN(docenteId)) {
                    await CreateModel.addDocenteTurma({
                        id_turma: idTurma,
                        id_docente: docenteId
                    });
                } else {
                    console.warn("ID de docente inválido ou não fornecido.");
                }

                if (data.cursoPago === "on" && limparValor(data.valorMensal) > 0) {
                    await CreateModel.createParcelas({
                        id_curso: idCurso,
                        qtd_parcelas: parseInt(data.numeroParcelas || 1),
                        valor_parcela: limparValor(data.valorMensal)
                    });
                }

                const dias = [
                    { nome: "Segunda", ativo: data.segunda_ativa, inicio: data.horario_inicio_segunda, fim: data.horario_fim_segunda },
                    { nome: "Terça", ativo: data.terca_ativa, inicio: data.horario_inicio_terca, fim: data.horario_fim_terca },
                    { nome: "Quarta", ativo: data.quarta_ativa, inicio: data.horario_inicio_quarta, fim: data.horario_fim_quarta },
                    { nome: "Quinta", ativo: data.quinta_ativa, inicio: data.horario_inicio_quinta, fim: data.horario_fim_quinta },
                    { nome: "Sexta", ativo: data.sexta_ativa, inicio: data.horario_inicio_sexta, fim: data.horario_fim_sexta },
                    { nome: "Sábado", ativo: data.sabado_ativa, inicio: data.horario_inicio_sabado, fim: data.horario_fim_sabado },
                  ];
                  
                  for (let d of dias) {
                    if (d.ativo) {
                      await CreateModel.createHorarioTurma({
                        id_turma: idTurma,
                        dia_semana: d.nome,
                        horario_inicio: d.inicio,
                        horario_fim: d.fim,
                      });
                    }
                  }

                // gera dias letivos considerando feriados, dias da semana e carga horária
                await CreateModel.gerarDiasLetivos(idTurma);

                res.redirect("/home");
            } catch (err) {
                console.error(err);
                res.send("Erro ao criar curso");
            }
        });
    }
}

module.exports = CreateController;
