// Middleware para proteger rotas
function autenticar(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect("/"); // redireciona para login
    }
    next();
}

module.exports = autenticar;
