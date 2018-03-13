
const auth = require('basic-auth')
const users = require('../config/users.json');
const GroupCache = require('./GroupCache')

const BASIC_AUTH_REALM = 'Basic realm="AI Manipulator"'
const INACTIVITY_TIMEOUT = 30 * 60 * 1000

class UserAuth {
    constructor() {
    }

    middleware() {
        return ((req, res, next) => {
            // if inactivity timeout, treat as session not existing
            if (req.session && req.session.lastActivity && req.session.lastActivity + INACTIVITY_TIMEOUT < Date.now() ) {
                req.logger.info('Sessiong timed out. User must re-authenticate')
                req.session.user = null
                req.session.lastActivity = null
                req.session.firstLoginDone = false
            }

            if (!req.session || !req.session.firstLoginDone) {
                req.logger.info('Brand new session. Make sure user gets prompted to login at least once')
                req.session.firstLoginDone = true
                res.setHeader('WWW-Authenticate', BASIC_AUTH_REALM)
                res.status(401).send();
            } else if (req.session && req.session.user) {
                req.logger.info('Session already exists for ' + JSON.stringify(req.session.user.username))
                req.groupCache = GroupCache.getGroupCache(req.session.user.group)
                req.session.lastActivity = Date.now()
                next();
            } else {
                const userCred = auth(req)
                const user = this._findUser(userCred)
                if (user) {
                    const userWithoutPW = Object.assign({}, user, {password: '****'})
                    req.session.user = userWithoutPW
                    req.session.lastActivity = Date.now()
                    req.groupCache = GroupCache.getGroupCache(req.session.user.group)
                    req.logger.info('User authenticated', {username: user.username})
                    next()
                } else {
                    req.logger.info('New session detected. Prompt for credentials')
                    res.setHeader('WWW-Authenticate', BASIC_AUTH_REALM)
                    res.status(401).send();
                }
            }
        })
    }

    _findUser(userCred) {
        if (!userCred || !userCred.name || !userCred.pass) {
            return null
        }

        for (let i=0; i < users.users.length; i++) {
            const thisUser = users.users[i];
            if (thisUser.username == userCred.name && thisUser.password == userCred.pass) {
                return thisUser
            }
        }
        return null
    }

}

module.exports = new UserAuth();
