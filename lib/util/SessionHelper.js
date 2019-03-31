
class SessionHelper {
    constructor() {}

    storeErrorMessage(req, message) {
        req.session.msgInfo = {icon: 'icons8-error-30.png', message: message};
    }

    storeInfoMessage(req, message) {
        req.session.msgInfo = {icon: 'icons8-info-30.png', message: message};
    }

    getAndClearMessage(req) {
        const msgInfo = req.session.msgInfo
        req.session.msgInfo = null
        return msgInfo ? msgInfo : {}
    }
}

module.exports = new SessionHelper()
