const DefaultResponse = require("./DefaultResponse");
const jwt = require("./ServerJwt");

class Middleware {
    /**
     * Method called before treating a request.
     * Checks if the jwt token is valid. Returns the payload of the jwt if successful.
     * Otherwise, sends error response.
     * @param {Request} req
     * @param {ServerResponse} res
     */
    static AuthMiddleware = (req, res) => Middleware.CheckJwt(req, res)
    static CheckJwt(req, res) {
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
        DefaultResponse.Error(res, msg, {required : required, given : given})
        return false;
    }

    static CheckRequiredFieldsBody(req, res, required) {
        let key = 'body'
        return Middleware.#MiddlewareRequiredFields(req[key], res, required, key);
    }
    static MiddlewareRequiredFieldsQuery(req, res, required) {
        let key = 'query'
        return Middleware.#MiddlewareRequiredFields(req[key], res, required, key);
    }

}

module.exports = Middleware