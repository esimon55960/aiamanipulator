const express = require('express')
const router = express.Router()
const NodeCache = require( "node-cache" )
const googleSessionCache = new NodeCache({ 
    stdTTL: 60*60*6,        // cache for 6 hours
    useClones:  false       // we want raw object so we can modify tokens
});

const users = require('../config/users.json');
const GroupCache = require('../lib/GroupCache')
const ApiAccess = require('../lib/google/ApiAccess')
const FileUtils = require('../lib/util/FileUtils')

const GOOGLE_AUTH_URI = '/googleapi/auth'

/*
Route handler for the Google OAuth registerAuthCallback
Note: This must be before the middleware handler
*/
router.get(GOOGLE_AUTH_URI, (req, res, next) => {
    req.logger.info('Got Google auth code redirect. Handle that now')
    var apiAccess = lookupApiAccess(req)
    apiAccess.processAuthCode(req, res).then(gotTokens => {
        if (gotTokens) {
            const target = req.query.state;
            req.logger.info('Got google oAuth token. Redirect to ' + target)
            res.redirect(target)
        } else {
            res.status(401).send('Not authorized')
        }
    })
})

/*
  Middleare that forces user authentication
*/
router.use((req, res, next) => {
    // create the google API if necessary
    var apiAccess = lookupApiAccess(req)

    if (!apiAccess.isLoggedIn(req)) {
        var authorizeUrl = apiAccess.getLoginFlowUrl(req, res)
        authorizeUrl += '&state=' + encodeURIComponent(req.originalUrl)
        req.logger.info('User is not logged in yet. Get google to authenticate.', {authorizeUrl: authorizeUrl})
        res.redirect(authorizeUrl)
        return;
    }
    req.logger.info('Google has authenticated. Check if user is valid.')
    if (req.session && req.session.user) {
        req.logger.info('Session already exists for ' + JSON.stringify(req.session.user.username))
        req.groupCache = GroupCache.getGroupCache(req.session.user.group)
        req.apiAccess = apiAccess
        next();
    } else {
        const userName = apiAccess.getUserName(req)
        const user = _findUser(userName)
        if (user) {
            req.session.user = user
            req.apiAccess = apiAccess
            req.groupCache = GroupCache.getGroupCache(req.session.user.group)
            req.groupCache.clearCache()
            FileUtils.clearGroupFolder(req.session.user.group)
            req.logger.info('User is authorized', {username: user.username})
            next()
        } else {
            req.logger.console.warn('User is not valid', {username: userName})
            res.status(403).send('Forbidden');
        }
    }
})

function lookupApiAccess(req) {
    // make sure session exists
    if (!req.session) {
        req.logger.info('Creating the session object. Should that already exist?')
        req.session = {}
    }

    // lookup the API in a cache by id. The underlying google object is not
    // serializable, so we just serialize the id in the session
    var apiAccess
    if (!req.session.apiAccessId) {
        apiAccess = new ApiAccess(GOOGLE_AUTH_URI)
        req.session.apiAccessId = apiAccess.getId()
        googleSessionCache.set(apiAccess.getId(), apiAccess)
    } else {
        apiAccess = googleSessionCache.get(req.session.apiAccessId)
    }
    return apiAccess
}

function _findUser(userName) {
    for (let i=0; i < users.users.length; i++) {
        const thisUser = users.users[i];
        if (thisUser.username == userName) {
            return thisUser
        }
    }
    return null
}

module.exports = router
