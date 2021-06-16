const DbUtils = require('./DbUtils')

class Grades {
    static Queries = {
        findAll() {
            return {
                sql: 'select * from grade',
                values: []
            }
        },
        findStudentGrades(student_acc_ID) {
            return {
                sql: 'select * from grade where student_ID in (select ID from student where student_ID=?)',
                values: [student_acc_ID]
            }
        },
        AddGrade(student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment) {
            return {
                sql: 'call Grade_Add(?, ?, ?, ?, ?)',
                values: [student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment]
            }
        }
    }
    static findAll() {
        return DbUtils.Query(Grades.Queries.findAll())
    }
    static findStudentGrades(student_account_id) {
        return DbUtils.Query(Grades.Queries.findStudentGrades())
    }
    static addSimpleGrade(student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment) {
        return DbUtils.Query(Grades.Queries.AddGrade(student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment))
    }
}

module.exports = Grades