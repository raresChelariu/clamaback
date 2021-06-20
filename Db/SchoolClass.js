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
        },
        addStudentToClass(student_acc_ID, school_class_ID) {
            return {
                sql: 'call SchoolClass_AddStudent(?, ?)',
                values: [student_acc_ID, school_class_ID]
            }
        },
        isStudentInClass(student_acc_ID) {
            return {
                sql: 'select * from class_student_association where student_ID in (select ID from student where account_ID=?)',
                values: [student_acc_ID]
            }
        },
        denyStudentToSchoolClass(student_acc_ID, school_class_ID) {
            return {
                sql: 'call SchoolClass_DenyStudent(?, ?)',
                values: [student_acc_ID, school_class_ID]
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


    static AddStudentToSchoolClass(student_acc_ID, school_class_ID) {
        return DbUtils.Query(SchoolClass.Queries.addStudentToClass(student_acc_ID, school_class_ID))
    }
    static IsStudentInSchoolClass(student_acc_ID) {
        return new Promise((resolve, reject) => {
            DbUtils.Query(SchoolClass.Queries.isStudentInClass(student_acc_ID))
                .then(result => {
                    if (result[0].length === 0)
                        reject('Student does not belong to class yet')
                    resolve(result[0][0]['student_class_state'])
                })
                .catch(e => reject(e))
        })
    }
    static DenyStudentToSchoolClass(student_acc_ID, school_class_ID) {
        return DbUtils.Query(SchoolClass.Queries.denyStudentToSchoolClass(student_acc_ID, school_class_ID))
    }
}

module.exports = SchoolClass