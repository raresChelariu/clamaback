const router = require('../Routing/Router')
const Middleware = require("../Routing/Middleware")
const DefaultResponse = require("../Routing/DefaultResponse");
const SchoolClass = require("../Db/SchoolClass");

const routePrefix = '/schoolclasses'
const RouteWithPrefix = (path) => routePrefix + path

const Required = {
    GetSchoolClassesOfSubjectQuery: ['subject_name'],
    AddSchoolClassBody: ['subject_name', "school_class_name"]
}

router.get(RouteWithPrefix('/all'), Middleware.AuthTeacher,
    (req, res) => {
        SchoolClass.GetAll()
            .then(result => res["json"](result))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

router.get(RouteWithPrefix('/subject'), Middleware.AuthTeacher, (req, res) => Middleware.CheckRequiredFieldsQueryParams(req, res, Required.GetSchoolClassesOfSubjectQuery),
    (req, res) => {
        let user_ID = req["user"]["ID"]
        let subjectName = req["query"][Required.GetSchoolClassesOfSubjectQuery[0]]

        SchoolClass.GetSchoolClassesOfTeachersSubject(user_ID, subjectName)
            .then(result => res["json"](result[0]))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

router.post(RouteWithPrefix(''), Middleware.AuthTeacher, (req, res) => Middleware.CheckRequiredFieldsBody(req, res, Required.AddSchoolClassBody),
    (req, res) => {
        let user_ID = req["user"]["ID"]
        let subjectName = req["body"][Required.AddSchoolClassBody[0]]
        let schoolClassName = req["body"][Required.AddSchoolClassBody[1]]

        SchoolClass.AddSchoolClass(user_ID, subjectName, schoolClassName)
            .then(result => res["json"](result, 201))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

