const router = require('../Routing/Router')
const Account = require('../Db/Account')
const Middleware = require("../CustomMiddleware/Middleware")
const ServerJwt = require("../CustomMiddleware/ServerJwt");
const DefaultResponse = require("../Routing/DefaultResponse");

const routePrefix = '/accounts'
const RouteWithPrefix = (path) => routePrefix + path

const Required = {
    LoginBody: ['email', 'pass'],
    RegisterBody: ['email', 'pass', 'first_name', 'last_name', 'account_type']
}

router.post(RouteWithPrefix('/register'),
    (req, res) => Middleware.CheckFieldsBody(req, res, Required.RegisterBody),
    (req, res) => {
        Account.Register(req["body"]["email"], req["body"]["pass"], req["body"]["first_name"], req["body"]["last_name"], req["body"]["account_type"])
            .then((result) => {
                let payload = result[0][0]
                let response = {user: payload, token: ServerJwt.sign(payload)}
                res["json"](response, 201)
            })
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

router.post(RouteWithPrefix('/login'), (req, res) => Middleware.CheckFieldsBody(req, res, Required.LoginBody),
    (req, res) => {
        Account.Login(req["body"]["email"], req["body"]["pass"])
            .then((result) => {
                let payload = result[0][0]
                let response = {user: payload, token: ServerJwt.sign(payload)}
                res["json"](response)
            })
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)
router.get(RouteWithPrefix(''), Middleware.AuthMiddleware,
    (req, res) => {
        Account.GetAll()
            .then(result => {
                res["json"](result[0])
            })
            .catch(e => {
            DefaultResponse.DbPredefinedError(res, e)
        })
    }
)

