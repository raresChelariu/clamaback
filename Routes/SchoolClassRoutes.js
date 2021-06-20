const router = require('../Routing/Router')
const Middleware = require("../CustomMiddleware/Middleware")
const DefaultResponse = require("../Routing/DefaultResponse");
const SchoolClass = require("../Db/SchoolClass");

const routePrefix = '/schoolclasses'
const RouteWithPrefix = (path) => routePrefix + path

const Required = {
    GetSchoolClassesOfSubjectQuery: ['teacher_id', 'subject_name'],
    AddSchoolClassBody: ['subject_name', "school_class_name"]
}

router.get(RouteWithPrefix('/all'), Middleware.CheckAuthTeacher,
    (req, res) => {
        SchoolClass.GetAll()
            .then(result => res["json"](result))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

router.get(RouteWithPrefix('/subject'), Middleware.CheckAuth, (req, res) => Middleware.CheckFieldsQueryParams(req, res, Required.GetSchoolClassesOfSubjectQuery),
    (req, res) => {
        let user_ID = req["query"][Required.GetSchoolClassesOfSubjectQuery[0]]
        let subjectName = req["query"][Required.GetSchoolClassesOfSubjectQuery[1]]

        SchoolClass.GetSchoolClassesOfTeachersSubject(user_ID, subjectName)
            .then(result => res["json"](result[0]))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

router.post(RouteWithPrefix(''), Middleware.CheckAuthTeacher, (req, res) => Middleware.CheckFieldsBody(req, res, Required.AddSchoolClassBody),
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

router.post(RouteWithPrefix('/student/add'),
    Middleware.CheckAuthTeacher,
    (req, res) => Middleware.CheckFieldsBody(req, res, ['student_id', 'school_class_id']),
    (req, res) => {
        SchoolClass.AddStudentToSchoolClass(req.body["student_id"], req.body["school_class_id"])
            .then(result => res["json"](result, 201))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)

router.post(RouteWithPrefix('/student/deny'),
    Middleware.CheckAuthTeacher,
    (req, res) => Middleware.CheckFieldsBody(req, res, ['student_id', 'school_class_id']),
    (req, res) => {
        SchoolClass.DenyStudentToSchoolClass(req.body["student_id"], req.body["school_class_id"])
            .then(result => res["json"](result, 201))
            .catch(e => {
                DefaultResponse.DbPredefinedError(res, e)
            })
    }
)