const express = require('express')
const router = express.Router()
const driveApi = require('../lib/google/DriveApi')

const SessionHelper = require('../lib/util/SessionHelper')

router.get('/', function (req, res, next) {
    driveApi.listFiles(req).then(result => {
        const files = result.data.files;
        req.logger.info('Got file list with length=' + files.length)
    
        res.render('index', {
            user: req.session.user,
            message: SessionHelper.getAndClearMessage(req),
            aiaFiles: req.groupCache.getFiles(),
            googleFiles: files,
            primaryAia: req.groupCache.getPrimary(),
            secondaryAia: req.groupCache.getSecondary()
        });
    }).catch( err => {
        next(err)
    });
})

module.exports = router
