const DbUtils = require('./DbUtils')

class Assignment{
    static Queries = {
        findAll() {
            return {
                sql: 'SELECT * FROM assignment',
                values: []
            }
        },
        AddAssignment(teacher_account_ID, school_class_ID, task) {
            return {
                sql: 'call Assignment_Add(?, ?, ?)',
                values: [teacher_account_ID, school_class_ID, task]
            }
        },
        GetClassAssignments(school_class_ID) {
            return {
                sql: 'SELECT * FROM assignment WHERE school_class_ID=?',
                values: [school_class_ID]
            }
        },
        ValidSolutionUpload(student_ID, assignment_ID, file_name) {
            return {
                sql: 'call Solution_ValidUpload(?, ?, ?)',
                values: [student_ID, assignment_ID, file_name]
            }
        }
    }
    /**
     * [DEVELOPMENT ONLY] Gets all assignments.
     * @return {Promise<>}
     * @constructor
     */
    static GetAll() {
        return DbUtils.Query(Assignment.Queries.findAll())
    }

    /** Adds an assignment.
     * Throws error for invalid/nonexistent IDs. Throws error if class doesn't belong to teacher.
     * @param {number} teacher_account_ID
     * @param {number} school_class_ID
     * @param {string} task
     * @return {Promise}
     * @constructor
     */
    static AddAssignment(teacher_account_ID, school_class_ID, task) {
        return DbUtils.Query(Assignment.Queries.AddAssignment(teacher_account_ID, school_class_ID, task))
    }

    /** Gets all assignments for a given school class, by school class ID.
     * Throws error if ID is invalid/nonexistent.
     * @param school_class_ID
     * @return {Promise}
     */
    static GetClassAssignments(school_class_ID) {
        return DbUtils.Query(Assignment.Queries.GetClassAssignments(school_class_ID))
    }
    static ValidSolutionUpload(student_id, assignment_id, file_name) {
        return DbUtils.Query(Assignment.Queries.ValidSolutionUpload(student_id, assignment_id, file_name))
    }
}

module.exports = Assignment