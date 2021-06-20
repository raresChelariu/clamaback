const router = require("../Routing/Router");
const Middleware = require("../CustomMiddleware/Middleware")
const ServerJwt = require("../CustomMiddleware/ServerJwt");

const routePrefix = '/attendance'
const RouteWithPrefix = (path) => routePrefix + path

/**
 * Gets attendance token for auth student based on school_class_id query param
 */
router.get(RouteWithPrefix(''),
    Middleware.CheckAuthStudent,
    (req, res) => Middleware.CheckFieldsQueryParams(req, res, ['school_class_id']),
    (req, res) => {

        let expirationOneYear = 60 * 60 * 24 * 365
        let response = {
            attendance_token: ServerJwt.sign({
                user: req.user,
                school_class_id: req['query'].school_class_id,
                date: Date.now()
            }, expirationOneYear)
        }
        res['json'](response)
    }
)
/**
 * Check if the attendance token is valid
 */
router.get(RouteWithPrefix('/validate'),
    (req, res) => Middleware.CheckFieldsQueryParams(req, res, ['attendance_token']),
    (req, res) => {
        let token = req.query['attendance_token']
        try {
            let payload = ServerJwt.verify(token)
            res['json'](payload)
        }
        catch (e) {
            res['json']({
                error: {errorMessage:  'Invalid attendance code'}
            })
        }
    }
)
