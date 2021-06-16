const DbUtils = require("./DbUtils")

class SchoolClass {
    static Queries = {
        findAll() {
            return {
                sql: 'SELECT * FROM school_class',
                values: []
            }
        },
        addSchoolClass(user_ID, subjectName, schoolClassName) {
            return {
                sql: 'call SchoolClass_Add(?, ?, ?)',
                values: [user_ID, subjectName, schoolClassName]
            }
        },
        getSchoolClassesOfTeacher(user_ID) {
            return {
                sql: 'call SchoolClass_GetSchoolClassByTeacher(?)',
                values: [user_ID]
            }
        },
        getSchoolClassesOfTeachersSubject(user_ID, subjectName) {
            return {
                sql: 'call SchoolClass_GetSchoolClassByTeachersSubject(?, ?)',
                values: [user_ID, subjectName]
            }
        }
    }

    /**
     * [DEVELOPMENT ONLY] Gets all school classes.
     * @return {Promise<>}
     * @constructor
     */
    static GetAll() {
        return DbUtils.Query(SchoolClass.Queries.findAll())
    }
    
    /**
     * Adds a school class
     * @param {number} user_ID the teachers account ID
     * @param {string} subjectName the name of the subject (ex: LFAC)
     * @param {string} schoolClassName the school class name (ex: Class A3)
     * @return {Promise<>}
     */
    static AddSchoolClass(user_ID, subjectName, schoolClassName) {
        return DbUtils.Query(SchoolClass.Queries.addSchoolClass(user_ID, subjectName, schoolClassName))
    }

    /**
     * Gets all school classes of a teacher by its account ID
     * @param {number} user_ID
     * @return {Promise<>}
     * @constructor
     */
    static GetSchoolClassesOfTeacher(user_ID) {
        return DbUtils.Query(SchoolClass.Queries.getSchoolClassesOfTeacher(user_ID))
    }
    /**
     * Gets all school classes for a subject by teacher's account ID and subject name
     * @param {number} user_ID
     * @param {string} subjectName
     * @return {Promise<>}
     * @constructor
     */
    static GetSchoolClassesOfTeachersSubject(user_ID, subjectName) {
        return DbUtils.Query(SchoolClass.Queries.getSchoolClassesOfTeachersSubject(user_ID, subjectName))
    }
}

module.exports = SchoolClass