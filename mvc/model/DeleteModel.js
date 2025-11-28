const connection = require("./BancoModel");

const DeleteModel = {
    deleteCursoCompleto: async (id_curso) => {
      const sql = 'DELETE FROM cursos WHERE id_curso = ?';
      const [result] = await connection.query(sql, [id_curso]);
      return result;
    }
  };

module.exports = DeleteModel;
