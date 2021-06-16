class DefaultResponse {
    static Messages = {
        // ROUTING
        HttpMethodNotSupported: 'Http method not supported',
        NonexistentRoute: 'Nonexistent server route for given request',
        // MIDDLEWARE
        RequestBodyTooBig: 'Request body exceeded the memory cap',
        RequestBodyInvalidJSON: 'Request body has invalid JSON format',
        RequestInvalidJwt: `JWT validation error`,
        UnauthorizedTeacherNeeded: 'Unauthorized : Need to be logged in as teacher',
        UnauthorizedStudentNeeded: 'Unauthorized : Need to be logged in as student',
        // DATABASE
        DatabaseErr: 'Database error',
        InvalidAccountType: 'Account type is invalid. Must be teacher or student',
        CredentialsInvalid: 'Credentials invalid',
        EmailAlreadyInUse: 'Email already in use'
    };

    static Error(res, msg, helperObj, statusCode = 400) {
        res.writeHead(statusCode, {"Content-Type": "application/json"});
        let errObj = {
            errorMessage: msg,
            helperObj: !helperObj ? 'undefined' : JSON.stringify(helperObj)
        }
        res.end(JSON.stringify(errObj))
    }

    static DbPredefinedError(res, e) {
        let err = JSON.stringify(e.message)
        let errMsg = ''
        if (-1 === err.indexOf('$')) {
            errMsg = err
        } else {
            errMsg = err.substring(
                err.indexOf("$") + 1,
                err.lastIndexOf("$")
            )
        }
        DefaultResponse.Error(res, errMsg)
    }
}

module.exports = DefaultResponse