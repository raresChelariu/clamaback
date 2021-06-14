const DbUtils = require('./DbUtils')

class Account {

    static AccountTypes = {
        Teacher: 'teacher',
        Student: 'student',
        Invalid: 'Invalid account type'
    }
    /**
     * Computes a hash for a given string.
     * Code from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
     * @param {string} str
     * @return {string} hash
     */
    static #hash = (str) => {
        let hash = 0, i, chr;
        if (str.length === 0)
            return hash + '';
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash + '';
    }
    static Queries = {
        RegisterProc: function (email, pass, first_name, last_name, account_type) {
            return {
                sql: 'call Account_Add(?, ?, ?, ?, ?)',
                values: [email, pass, first_name, last_name, account_type]
            }
        }, LoginProc: function (email, pass) {
            return {
                sql: 'call Account_Login(?, ?)',
                values: [email, pass]
            }
        },
        findAll: function () {
            return {
                sql: 'SELECT * FROM account',
                values: []
            }
        },

    }

    static GetAll() {
        return DbUtils.Query(Account.Queries.findAll())
    }

    static Login(email, pass) {
        pass = Account.#hash(pass)
        return DbUtils.Query(Account.Queries.LoginProc(email, pass))
    }

    static Register(email, pass, first_name, last_name, account_type) {
        pass = Account.#hash(pass)
        return DbUtils.Query(Account.Queries.RegisterProc(email, pass, first_name, last_name, account_type))
    }

}

module.exports = Account