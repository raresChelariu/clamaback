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
                sql: 'select grade.*, assignment_grades.assignment_ID from grade left join assignment_grades on grade.ID = assignment_grades.grade_ID where student_ID in (select ID from student where student.account_ID=?)',
                values: [student_acc_ID]
            }
        },
        AddGrade(teacher_acc_ID, student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment) {
            return {
                sql: 'call Grade_Add(?, ?, ?, ?, ?, ?)',
                values: [student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment]
            }
        },
        AddAssignmentGrade(teacher_acc_ID, assignment_ID, student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment) {
            return {
                sql: 'call Grade_AddForAssignment(?, ?, ?, ?, ?, ?, ?)',
                values: [teacher_acc_ID, assignment_ID, student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment]
            }
        },
    }

    static findAll() {
        return DbUtils.Query(Grades.Queries.findAll())
    }

    static findStudentGrades(student_account_id) {
        return DbUtils.Query(Grades.Queries.findStudentGrades(student_account_id))
    }

    static addAssignmentGrade(assignment_ID, student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment) {
        return DbUtils.Query(Grades.Queries.AddAssignmentGrade(assignment_ID, student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment))
    }

    static addSimpleGrade(student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment) {
        return DbUtils.Query(Grades.Queries.AddGrade(student_acc_ID, school_class_ID, score_current, score_ceiling, teacher_comment))
    }

}

module.exports = Grades