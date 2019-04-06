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
        req.logger.warn('Error getting list of files.', {errorJson: JSON.stringify(err)})
        const causeText = err.response && err.response.data ? 
                    `${err.response.data.error}: ${err.response.data.error_description}` : err
        SessionHelper.storeErrorMessage(req, 'Error getting list of files. Cause: ' + causeText)
        res.render('index', {
            user: req.session.user,
            message: SessionHelper.getAndClearMessage(req),
            aiaFiles: req.groupCache.getFiles(),
            googleFiles: [],
            primaryAia: req.groupCache.getPrimary(),
            secondaryAia: req.groupCache.getSecondary()
        })
        //next(err)
    });
})

module.exports = router
