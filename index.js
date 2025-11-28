const express = require("express")
const path = require("path")
const session = require("express-session")
const HomeController = require("./mvc/controllers/HomeController")
const AuthController = require("./mvc/controllers/AuthController")
const CreateController = require("./mvc/controllers/CreateController")
const EditController = require("./mvc/controllers/EditController")
const DeleteController = require("./mvc/controllers/DeleteController");
const FeriadoController = require("./mvc/controllers/FeriadoController");
const CalendarController = require("./mvc/controllers/CalendarController");
const DocenteController = require("./mvc/controllers/DocenteController");
const UsuarioController = require("./mvc/controllers/UsuarioController");
const CursoController = require("./mvc/controllers/CursoController");


class Server
{

    app
    porta = 3000
    
    constructor()
    {
        this.app = express()
        this.porta = 3000
        this.on()
        this.configurarMiddlewares() 
        this.configurarViewEngine()
        this.configurarRotas()
    }

    configurarViewEngine() 
    {
        this.app.set("view engine", "ejs")
        this.app.set("views", "mvc/views")
        this.app.use(express.urlencoded({extended: true}))
        this.app.use(express.json())
        this.app.use(express.static(path.join(__dirname, 'mvc/views/public')));
    }

    configurarMiddlewares() {
        // Configuração de sessão
        this.app.use(session({
            secret: "senai-portal",   // pode mudar pra algo mais seguro
            resave: false,
            saveUninitialized: false
        }))
    }

 configurarRotas() {
    const createController = new CreateController(this.app); // instância do CreateController
    new HomeController(this.app, createController); // passa para HomeController
    new AuthController(this.app);
    new EditController(this.app);
    new DeleteController(this.app);
    new FeriadoController(this.app);
    new CalendarController(this.app);
    new DocenteController(this.app);
    new UsuarioController(this.app);
    new CursoController(this.app);
}

    on()
    {
        this.app.listen(this.porta)
    }
}

new Server()
