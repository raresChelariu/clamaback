const url = require('url')
const DefaultResponse = require("./DefaultResponse");

// noinspection JSDeprecatedSymbols
class RequestHelper {
    req
    bodyFormat

    constructor(req, bodyFormat = 'JSON') {
        this.req = req
        this.bodyFormat = bodyFormat
    }
    static RunResponseHelpers(res) {
        res.json = function jsonResponse(content, statusCode = 200) {
            this.writeHead(statusCode, { 'Content-Type': 'application/json' })
            this.end(JSON.stringify(content))
        }
        res.plain = function plainResponse(content, statusCode = 200) {
            this.writeHead(statusCode, { 'Content-Type': 'text/plain' })
            this.end(content)
        }
        res.html = function htmlResponse(content, statusCode = 200) {
            this.writeHead(statusCode, {'Content-Type': 'text/html'})
            this.end(content)
        }
    }

    async RunRequestHelpers() {
        this.req["path"] = RequestHelper.GetPathFromReq(this.req)
        this.QueryParamsHelper()
        if ('GET' === this.req.method) {
            this.req["rawBody"] = ''
            return
        }
        await this.BodyRawHelper().then((bodyString) => {
            this.req["rawBody"] = bodyString
            if ('JSON' === this.bodyFormat) {
                this.BodyJSONHelper()
            }
        }).catch(e => console.log(e))

    }
    /**
     * Extracts path from request url. For www.google.com/users/books?id=1 will extract '/users/books'
     * @param {IncomingMessage} req
     * @return {string}
     */
    static GetPathFromReq(req) {
        return url.parse(req.url, true).pathname
    }

    QueryParamsHelper() {
        this.req["query"] = url.parse(this.req.url, true).query
    }

    BodyJSONHelper() {
        try {
            this.req["body"] = JSON.parse(this.req["rawBody"])
        } catch (e) {
            throw DefaultResponse.Messages.RequestBodyInvalidJSON
        }
    }

    BodyRawHelper() {
        return new Promise((resolve, reject) => {
            let bodyString = ''
            this.req.on('data', (chunk) => {
                bodyString += chunk
                if (bodyString.length > 1e7) {
                    reject(DefaultResponse.Messages.RequestBodyTooBig)
                }
            })
            this.req.on('end', () => {
                resolve(bodyString)
            })
        })
    }
}

module.exports = RequestHelper