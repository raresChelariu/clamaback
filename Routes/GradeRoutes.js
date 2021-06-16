const router = require('../Routing/Router')
const Middleware = require("../CustomMiddleware/Middleware")
const DefaultResponse = require("../Routing/DefaultResponse")
const Grades = require("../Db/Grades");

const routePrefix = '/grades'
const RouteWithPrefix = (path) => routePrefix + path

const Required = {
    findStudentGrades: ['student_acc_id'],
    addGrade: ['student_acc_ID', 'school_class_ID', 'score_current', 'score_ceiling', 'teacher_comment'],
    addAssignmentGrade: ['assignment_ID', 'student_acc_ID', 'school_class_ID', 'score_current', 'score_ceiling', 'teacher_comment']
}

router.get(RouteWithPrefix('/all'), (req, res) => {
    Grades.findAll()
        .then(result => {
            res["json"](result)
        })
        .catch(e => DefaultResponse.DbPredefinedError(res, e))
})


// noinspection DuplicatedCode
router.post(RouteWithPrefix('/assignment'),
    Middleware.CheckAuthTeacher,
    (req, res) => Middleware.CheckFieldsBody(req, res, Required.addAssignmentGrade),
    (req, res) => {
        let teacherID = req['user']['ID']
        let assignment_ID = req['body'][Required.addAssignmentGrade[0]]
        let student_acc_ID = req['body'][Required.addAssignmentGrade[1]]
        let school_class_ID = req['body'][Required.addAssignmentGrade[2]]
        let score_current = req['body'][Required.addAssignmentGrade[3]]
        let score_ceiling = req['body'][Required.addAssignmentGrade[4]]
        let teacher_comment = req['body'][Required.addAssignmentGrade[5]]

        Grades.addAssignmentGrade(teacherID, assignment_ID, student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment)
            .then(result => res['json'](result))
            .catch(e => DefaultResponse.DbPredefinedError(res, e))
    }
)

// noinspection DuplicatedCode
router.post(RouteWithPrefix(''),
    Middleware.CheckAuthTeacher,
    (req, res) => Middleware.CheckFieldsBody(req, res, Required.addGrade),
    (req, res) => {
        let teacherID = req['user']['ID']
        let student_acc_ID = req['body'][Required.addAssignmentGrade[0]]
        let school_class_ID = req['body'][Required.addAssignmentGrade[1]]
        let score_current = req['body'][Required.addAssignmentGrade[2]]
        let score_ceiling = req['body'][Required.addAssignmentGrade[3]]
        let teacher_comment = req['body'][Required.addAssignmentGrade[4]]

        Grades.addSimpleGrade(teacherID, student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment)
            .then(result => res['json'](result))
            .catch(e => DefaultResponse.DbPredefinedError(res, e))
    }
)
router.get(RouteWithPrefix('/student'),
    Middleware.AuthMiddleware,
    (req, res) => Middleware.CheckFieldsQueryParams(req, res, Required.findStudentGrades),
    (req, res) => {
        let stud_acc_id = req['query'][Required.findStudentGrades[0]]
        Grades.findStudentGrades(stud_acc_id)
            .then(result => res['json'](result))
            .catch(e => DefaultResponse.DbPredefinedError(res, e))
    }
)