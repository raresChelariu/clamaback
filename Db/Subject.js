const DbUtils = require("./DbUtils");

class Subject {
    static Queries = {
        findAll() {
            return {
                sql: 'SELECT * FROM subject',
                values: []
            }
        },
        addSubjectByTeacherAccountID(user_ID, name, description) {
            return {
                sql: 'call Subject_Add(?, ?, ?)',
                values: [user_ID, name, description]
            }
        },
        findSubjectsOfTeacherByAccountID(user_ID) {
            return {
                sql: 'call Subject_FindByTeacherAccID(?)',
                values: [user_ID]
            }
        }
    }
    static GetAll() {
        return DbUtils.Query(Subject.Queries.findAll())
    }
    static AddSubject(user_ID, name, description) {
        return DbUtils.Query(Subject.Queries.addSubjectByTeacherAccountID(user_ID, name, description))
    }
    static GetTeachersSubjects(user_ID) {
        return DbUtils.Query(Subject.Queries.findSubjectsOfTeacherByAccountID(user_ID))
    }
}

module.exports = Subject