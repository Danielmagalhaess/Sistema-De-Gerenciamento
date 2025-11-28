const { body, validationResult } = require("express-validator");
const CalendarModel = require("../model/CalendarModel");

class CalendarController {
    constructor(app) {
        app.post(
            "/calendar",
            [
                body("data_inicio")
                    .exists().withMessage("Data de início é obrigatória")
                    .isISO8601().withMessage("Data deve estar em formato ISO"),
                body("carga_horaria")
                    .exists().withMessage("Carga horária obrigatória")
                    .isInt({ min: 1 }).withMessage("Carga horária deve ser >= 1"),
                body("dias_semana")
                    .exists().withMessage("Dias da semana são obrigatórios")
                    .isArray({ min: 1 }).withMessage("Dias da semana deve ser array")
                    .custom(arr => arr.every(d => Number.isInteger(d) && d >= 0 && d <= 6))
                    .withMessage("Cada dia deve ser número entre 0 e 6")
            ],
            async (req, res) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ erros: errors.array() });
                }

                const { data_inicio, carga_horaria, dias_semana, turma_id } = req.body;

                const calendar = await CalendarModel.Scheadule(
                    new Date(data_inicio),
                    carga_horaria,
                    turma_id,
                    dias_semana                  
                );

                const ultimoDiaAula = CalendarModel.ultimoDiaAula(calendar);


                const feriados = await CalendarModel.buscaFeriado(data_inicio);

                return res.json({
                    calendar,
                    ultimoDiaAula,
                    feriados
                });
            }
        );
    }
}

module.exports = CalendarController;
