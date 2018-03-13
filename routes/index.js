var express = require('express')
var router = express.Router()

const SessionHelper = require('../lib/util/SessionHelper')

router.get('/', function (req, res, next) {
    res.render('index', {
        user: req.session.user,
        message: SessionHelper.getAndClearMessage(req),
        aiaFiles: req.groupCache.getFiles()
    });
})

module.exports = router
