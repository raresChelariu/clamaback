const http = require('http')

const ServerRouter = require('./Router')
const RequestHelper = require('./RequestHelper')
const DefaultResponse = require("./DefaultResponse");

class App {
    PORT
    callbackOnListen
    constructor(PORT, callbackOnListen) {
        this.PORT = PORT
        this.callbackOnListen = callbackOnListen
    }

    listen() {
        const server = http.createServer(async (req, res) => {
            try {
                RequestHelper.RunResponseHelpers(res)
                let reqHelper = new RequestHelper(req)
                await reqHelper.RunRequestHelpers()
                ServerRouter.ExecuteListener(req, res)
            }catch (e) {
                DefaultResponse.Error(res, e, null)
            }
        })
        server.listen(this.PORT, this.callbackOnListen)

    }
}

module.exports = App