const jwt = require('jsonwebtoken');
const secret = 'MYLITTLEJWTSECRET'
const timeExpiresIn = 60 * 60 * 2

class ServerJwt {
    static sign(payload, expiresIn = timeExpiresIn) {
        return jwt.sign(payload, secret, {expiresIn: expiresIn})
    }

    static verify(token) {
        return jwt.verify(token, secret);
    }

    static getSecret = () => secret

}

module.exports = ServerJwt