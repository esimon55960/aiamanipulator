const express = require('express')
const SessionHelper = require('../lib/util/SessionHelper')

const router = express.Router()

router.get('/logout', function(req, res, next) {
    if (req.session) {
        if (req.session.user) {
            req.logger.info('Logging out user', {username: req.session.user.username})
        } else {
            req.logger.info('Terminating session, but there is no user. ')
        }
        req.session.destroy()
    } else {
        req.logger.info('Logging out but there is no session, so do nothing')
    }

    res.render('logout', {
    });
})

module.exports = router
