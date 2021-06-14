const mariadb = require('mariadb')

class DbUtils {
    static #Connection() {
        return mariadb.createConnection({
            host: 'localhost',
            database: 'clama',
            user: 'root',
            password: 'rares123',
            port: 3306,
            socketTimeout: 0,
            connectTimeout: 50000
        })
    }

    static Query(query) {
        return new Promise(((resolve, reject) => {
            DbUtils.#Connection()
                .then(conn => {
                    conn.query(query)
                        .then(result => {
                            resolve(result)
                            conn.destroy()
                        })
                        .catch(err => reject(err))
                })
                .catch((err) => reject(err))
        }))
    }

}

module.exports = DbUtils