const AuthModel = require("../model/AuthModel");

class AuthController {
    constructor(app) {
        // Página de login
        app.get("/", (req, res) => {
            res.render("Auth/index.ejs", {
                invalido: "",
                senhaInvalida: "",
                usuarioInvalido: ""
            });
        });

        // Processa login
        app.post("/auth", async (req, res) => {
            const nif = req.body.usuario?.trim();
            const senha = req.body.senha?.trim();

            const auth = new AuthModel(nif, senha);
            const resultado = await auth.login();

            if (resultado.sucesso) {
                const usuario = resultado.usuario;

                // Atualiza último acesso
                const now = new Date();
                await AuthModel.updateUltimoAcesso(usuario.id_usuario, now);

                // Armazena usuário e permissões na sessão
                req.session.usuario = usuario;
                req.session.permissoes = resultado.permissoes;

                // Verifica se é o primeiro login
                if (usuario.ja_logou === 0) {
                    // Redireciona para a página de alteração de senha
                    res.redirect("/usuarios/mudar-senha");
                } else {
                    // Redireciona para a página principal
                    res.redirect("/home");
                }
            } else {
                res.render("Auth/index.ejs", resultado);
            }
        });

        app.get("/usuarios/mudar-senha", (req, res) => {
            if (!req.session.usuario) return res.redirect("/"); // se não estiver logado, vai para login
        
            res.render("Auth/novaSenha", {
                usuario: req.session.usuario,
                erro: ""
            });
        });

        app.post("/usuarios/mudar-senha", async (req, res) => {
            if (!req.session.usuario) return res.redirect("/");
        
            const { nova_senha, confirmar_senha } = req.body;
        
            if (!nova_senha || !confirmar_senha || nova_senha !== confirmar_senha) {
                return res.render("Auth/novaSenha", {
                    usuario: req.session.usuario,
                    erro: "As senhas não conferem"
                });
            }
        
            const bcrypt = require("bcrypt");
            const hash = await bcrypt.hash(nova_senha, 10);
        
            await AuthModel.updateSenha(req.session.usuario.id_usuario, hash);
            await AuthModel.updateJaLogou(req.session.usuario.id_usuario); // atualiza ja_logou para 1
        
            // Atualiza a sessão
            req.session.usuario.ja_logou = 1;
            req.session.primeiroAcessoHome = true;
            req.session.primeiroAcessoEdit = true;
            req.session.primeiroAcessoCreate = true;
            

        
            res.redirect("/home");
        });

        // Logout
        app.get("/logout", (req, res) => {
            req.session.destroy(err => {
                if (err) console.error(err);
                res.redirect("/");
            });
        });
    }
}

module.exports = AuthController;
