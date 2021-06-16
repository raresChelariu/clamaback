

function warningRedefiningRouteAction(httpMethod, httpTemplatePath) {
    console.log(`Warning - redefining route handler for ${httpMethod} ${httpTemplatePath}`)
}
const RequestHelper = require('./RequestHelper')
const DefaultResponse = require("./DefaultResponse");
class Router {
    /**
     * The dictionary used to store (route, action) pairs.
     * Each route will be stored in their corresponding method dictionary
     * @type {{patch: {}, post: {}, get: {}, delete: {}, put: {}}}
     */
    static #serverRoutes = {
        get: {},
        post: {},
        put: {},
        delete: {},
        patch: {},
    }

    /** Adds a new GET route to the server
     * @param {string} templatePath
     * @param {Function} requestListeners
     */
    static get(templatePath, ...requestListeners) {
        if (this.#serverRoutes.get[templatePath])
            warningRedefiningRouteAction('GET', templatePath)
        this.#serverRoutes.get[templatePath] = requestListeners
    }
    /** Adds a new POST route to the server
     * @param {string} templatePath
     * @param  requestListener
     */
    static post(templatePath, ...requestListener) {
        if (this.#serverRoutes.post[templatePath])
            warningRedefiningRouteAction('POST', templatePath)
        this.#serverRoutes.post[templatePath] = requestListener
    }
    /** Adds a new PUT route to the server
     * @param {string} templatePath
     * @param {Function} requestListener
     */
    static put(templatePath, ...requestListener) {
        if (this.#serverRoutes.put[templatePath])
            warningRedefiningRouteAction('PUT', templatePath)
        this.#serverRoutes.put[templatePath] = requestListener
    }
    /** Adds a new DELETE route to the server
     * @param {string} templatePath
     * @param {Function} requestListener
     */
    static delete(templatePath, ...requestListener) {
        if (this.#serverRoutes.delete[templatePath])
            warningRedefiningRouteAction('DELETE', templatePath)
        this.#serverRoutes.delete[templatePath] = requestListener
    }
    /** Adds a new PATCH route to the server
     * @param {string} templatePath
     * @param {Function} requestListener
     */
    static patch(templatePath, ...requestListener) {
        if (this.#serverRoutes.patch[templatePath])
            warningRedefiningRouteAction('PATCH', templatePath)
        this.#serverRoutes.patch[templatePath] = requestListener
    }

    /**
     * For a given request returns the proper action (listener).
     * In case of an error (either http method not supported, either no action implemented for the given request),
     * it will return null and write a specific response.
     * @param req
     * @param res
     * @return {null|Array<RequestListener>}
     */
    static #getRouteListener(req, res) {
        let givenPath = RequestHelper.GetPathFromReq(req)
        if (givenPath[-1] === '/')
            givenPath = givenPath.slice(0, -1)
        let method = req.method.toLowerCase()
        let errObj = {
            givenPath : givenPath,
            method : method
        }
        if (!this.#serverRoutes[method]) {
            DefaultResponse.Error(res, DefaultResponse.Messages.HttpMethodNotSupported, errObj)
            return null
        }
        let listener = this.#serverRoutes[method][givenPath]
        if (!listener) {
            DefaultResponse.Error(res, DefaultResponse.Messages.NonexistentRoute, errObj)
            return null
        }
        return listener
    }
    static ExecuteListener(req, res) {
        let actions = Router.#getRouteListener(req, res)
        if (null === actions)
            return;
        for (let i = 0; i < actions.length; i++) {
            let currentAction = actions[i]
            let goNext = currentAction(req, res)
            if (!goNext)
                return
        }
    }
}

module.exports = Router