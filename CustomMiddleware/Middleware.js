const DefaultResponse = require("../Routing/DefaultResponse")
const jwt = require("./ServerJwt")
const Account = require("../Db/Account")

class Middleware {
    /**
     * Method called before treating a request.
     * Checks if the jwt token is valid. Returns the payload of the jwt if successful.
     * Otherwise, sends error response.
     * @param {Request} req
     * @param {ServerResponse} res
     */
    static AuthMiddleware = (req, res) => Middleware.CheckAuth(req, res)
    static CheckAuthTeacher = (req, res) => {
        if (false === Middleware.CheckAuth(req, res)) {
            return false
        }
        if (Account.AccountTypes.Teacher !== req["user"]["account_type"]) {
            DefaultResponse.Error(res, DefaultResponse.Messages.UnauthorizedTeacherNeeded, null, 401)
            return false
        }
        return true
    }
    static CheckAuthStudent = (req, res) => {
        if (false === Middleware.CheckAuth(req, res)) {
            return false
        }
        if (Account.AccountTypes.Student !== req["user"]["account_type"]) {
            DefaultResponse.Error(res, DefaultResponse.Messages.UnauthorizedStudentNeeded, null, 401)
            return false
        }
        return true
    }
    static CheckAuth(req, res) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) {
            res.statusCode = 401
            res.end()
        }
        try {
            req["user"] = jwt.verify(token)
            return true
        } catch (e) {
            DefaultResponse.Error(res, DefaultResponse.Messages.RequestInvalidJwt, e)
            return false
        }
    }

    static #RequiredFieldsPresent(required, given) {
        for (let i = 0; i < required.length; i++)
            if (-1 === given.indexOf(required[i]))
                return false;
        return true;
    }

    static #MiddlewareRequiredFields(given, res, required, givenName) {
        let valid = Middleware.#RequiredFieldsPresent(given, required)
        if (valid)
            return true;
        let msg = `Not all fields present in ${givenName}`
        DefaultResponse.Error(res, msg, {required: required, given: given})
        return false;
    }

    static CheckFieldsBody(req, res, required) {
        let key = 'body'
        return Middleware.#MiddlewareRequiredFields(req[key], res, required, key);
    }
    static CheckFieldsQueryParams(req, res, required) {
        let key = 'query'
        return Middleware.#MiddlewareRequiredFields(req[key], res, required, key);
    }

}

module.exports = Middleware