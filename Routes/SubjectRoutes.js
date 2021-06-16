const router = require('../Routing/Router')
const Subject = require('../Db/Subject')
const Middleware = require("../CustomMiddleware/Middleware")
const DefaultResponse = require("../Routing/DefaultResponse");

const routePrefix = '/subjects'
const RouteWithPrefix = (path) => routePrefix + path

const Required = {
    AddSubjectBody: ['name', 'description']
}

router.get(RouteWithPrefix('/all'), Middleware.CheckAuthTeacher,
    (req, res) => {
        Subject.GetAll()
            .then(result => {
                res["json"](result)
            })
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

router.post(RouteWithPrefix(''), Middleware.CheckAuthTeacher,
    (req, res) => Middleware.CheckFieldsBody(req, res, Required.AddSubjectBody),
    (req, res) => {
        let user_ID = req["user"]["ID"]
        let subjectName = req["body"][Required.AddSubjectBody[0]]
        let description = req["body"][Required.AddSubjectBody[1]]
        Subject.AddSubject(user_ID, subjectName, description)
            .then(result => res["json"](result, 201))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

router.get(RouteWithPrefix(''), Middleware.CheckAuthTeacher,
    (req, res) => {
        let user_ID = req["user"]["ID"]
        Subject.GetTeachersSubjects(user_ID)
            .then(result => res["json"](result[0]))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)