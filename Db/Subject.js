class Subject {
    static Queries = {
        findAll: function () {
            return {
                sql: 'SELECT * FROM subject',
                values: []
            }
        },
        addSubjectByUserID: function (name, user_ID) {
            return {
                sql: 'call Subject_Add(?, ?)',
                values: [name, user_ID]
            }
        },
        // findSubjectsOfTeacherbyUserID: function (user_ID) {
        //     return {
        //         sql: 'SELECT * FROM subject WHERE ',
        //         values: [name, user_ID]
        //     }
        // }

    }
}

module.exports = Subject