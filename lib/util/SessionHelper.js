
class SessionHelper {
    constructor() {}

    storeMessage(req, message) {
        req.logger.info('storing message', {message: message})
        req.session.lastMessage = message
    }

    getAndClearMessage(req) {
        const message = req.session.lastMessage
        req.session.lastMessage = null
        return message
    }
}

module.exports = new SessionHelper()
