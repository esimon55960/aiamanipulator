
class Logger {
    constructor() {
    }

    middleware() {
        return ((req, res, next) => {
            req.logger = console;
            req.logger.info('Request', {method: req.method, uri: req.originalUrl})
            res.once ('finish', function () {
                req.logger.info('Response', {statusCode: res.statusCode, method: req.method, uri: req.originalUrl})
            })
            next();
        })
    }
}

module.exports = new Logger();
