const DbUtils = require('./DbUtils')

class Assignment{
    static Queries = {
        findAll() {
            return {
                sql: 'SELECT * FROM assignment',
                values: []
            }
        },
        AddAssignment(school_class_ID, task) {
            return {
                sql: 'insert into assignment (school_class_ID, task) VALUES (?, ?)',
                values: [school_class_ID, task]
            }
        },
        GetClassAssignments(school_class_ID) {
            return {
                sql: 'SELECT * FROM assignment WHERE school_class_ID=?',
                values: [school_class_ID]
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

    /**
     * @param {number} school_class_ID
     * @param {string} task
     * @return {Promise}
     * @constructor
     */
    static AddAssignment(school_class_ID, task) {
        return DbUtils.Query(Assignment.Queries.AddAssignment(school_class_ID, task))
    }

    static GetClassAssignments(school_class_ID) {
        return DbUtils.Query(Assignment.Queries.GetClassAssignments(school_class_ID))
    }
    static GetTeacherAssignments(teacher_account_ID) {
        return DbUtils.Query(Assignment.Queries.GetTeacherAssignments(teacher_account_ID))
    }
}

module.exports = Assignment