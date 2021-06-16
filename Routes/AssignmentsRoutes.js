const router = require('../Routing/Router')
const Middleware = require("../CustomMiddleware/Middleware")
const DefaultResponse = require("../Routing/DefaultResponse");
const Assignment = require('./../Db/Assignment')

const routePrefix = '/assignments'
const RouteWithPrefix = (path) => routePrefix + path

const Required = {
    AddAssignmentBody: ['teacher_account_ID', 'school_class_ID', 'task'],
    GetClassAssignmentsQuery: ['school_class_id']

}

router.get(RouteWithPrefix('/all'), (req, res) => {
    Assignment.GetAll()
        .then(result => {
            res["json"](result)
        })
        .catch(e => DefaultResponse.DbPredefinedError(res, e))
})

router.post(RouteWithPrefix(''),
    Middleware.CheckAuthTeacher,
    (req, res) => Middleware.CheckFieldsBody(req, res, Required.AddAssignmentBody),
    (req, res) => {
        let teacher_ID = req["user"]["ID"]
        let school_class_ID = req["body"][Required.AddAssignmentBody[1]]
        let task = req["body"][Required.AddAssignmentBody[2]]
        Assignment.AddAssignment(teacher_ID, school_class_ID, task)
            .then(result => res["json"](result))
            .catch(e => DefaultResponse.DbPredefinedError(res, e))
    }
)
router.get(RouteWithPrefix('/schoolclass'),
    Middleware.CheckAuth,
    (req, res) => Middleware.CheckFieldsQueryParams(req, res, Required.GetClassAssignmentsQuery),
    (req, res) => {
        let school_class_ID = req["query"][Required.GetClassAssignmentsQuery[0]]
        Assignment.GetClassAssignments(school_class_ID)
            .then(result => res["json"](result))
            .catch(e => DefaultResponse.DbPredefinedError(res, e))
    }
)
