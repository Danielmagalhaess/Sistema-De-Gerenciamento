const mysql = require("mysql2/promise")

connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    database: 'gerenciamento_1',
    password: ''
})
  

module.exports = connection