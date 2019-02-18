const express = require('express')
const router = express.Router()

const users = require('../config/users.json');
const GroupCache = require('../lib/GroupCache')
const ApiAccess = require('../lib/google/ApiAccess')
const GOOGLE_AUTH_URI = '/googleapi/auth'

/*
  Middleare that forces user authentication
*/
router.use((req, res, next) => {
    if (!req.session) {
        req.logger.info('Creating the session object. Should that already exist?')
        req.session = {}
    }
    // create the google API if necessary
    if (!req.session.apiAccess) {
        req.session.apiAccess = new ApiAccess(GOOGLE_AUTH_URI)
    }

    if (!req.session.apiAccess.isLoggedIn(req, res)) {
        var authorizeUrl = req.session.apiAccess.getLoginFlowUrl(req, res)
        authorizeUrl += '&target=' + encodeURIComponent(req.originalUrl)
        req.logger.info('authorizeUrl=' + authorizeUrl)
        res.redirect(authorizeUrl)
        return;
    } else {
      req.logger.info('Already logged in. Go to next')
      //TODO: Make sure user is setup? That should be handled via the Auth callback
      next()
    }
/*
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
    */
})

/*
Route handler for the Google OAuth registerAuthCallback
*/
router.get(GOOGLE_AUTH_URI, (req, res, next) => {
    req.logger.info('Got Google auth code redirect. Handle that now')
    req.session.apiAccess.processAuthCode(req, res)
})

function _findUser(userCred) {
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

module.exports = router
