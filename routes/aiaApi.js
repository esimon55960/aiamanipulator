const express = require('express')
const AIAFile = require('../lib/AIAFile')
const AIAResource = require('../lib/aiaContent/AIAResource')
const SessionHelper = require('../lib/util/SessionHelper')
const driveApi = require('../lib/google/DriveApi')

const ACTION_RENAME_SCREEN = 'renameScreen'
const ACTION_COPY_SCREEN = 'copyScreen'
const ACTION_UNLOAD = 'unload'
const MAX_OPEN_FILES_PER_TEAM = 3

const router = express.Router()

router.post('/aia', function (req, res, next) {
    if (req.groupCache.getFiles().length >= MAX_OPEN_FILES_PER_TEAM) {
        SessionHelper.storeMessage(req, 'A maximum of ' + MAX_OPEN_FILES_PER_TEAM +
            ' files can be opened. Unload a file and retry the operation')
        res.redirect('back')
        return
    }

    req.logger.info('Loading AIA file', {name: req.files.aiaFile.name, fileSize: req.files.aiaFile.data.length})

    let aiaFile = new AIAFile(req.files.aiaFile.name)
    aiaFile.loadAsync(req, req.files.aiaFile.data).then(() => {
        req.logger.info('Done loading AIA file')
        req.groupCache.addFile(aiaFile)
        res.redirect('back')
    }).catch((err) => {
        req.logger.error('Unexpected error processing AIA file.', err)
        SessionHelper.storeMessage(req, 'Unexpected error processing AIA file. Cause: ' + err)
        res.redirect('back').addFile
    })
})

router.post('/aia/loadFromGoogle', function(req, res, next) {
    const filePos = req.body.filePos
    const primaryFileSplit = req.body.fileInfo.split('|')
    const fileId = primaryFileSplit[0]
    const name = primaryFileSplit[1]
    req.logger.info('loading google file', {fileId: fileId, name: name})

    const aiaFile = new AIAFile(name, fileId)
    driveApi.downloadFile(req, fileId).then(fileRes => {
        return aiaFile.loadFromStream(req, fileRes.data)
    }).then(() => {
        req.groupCache.addFile(aiaFile)
        res.redirect('back')
    }).catch((err) => {
        req.logger.error('Unexpected error processing AIA file.', err)
        SessionHelper.storeMessage(req, 'Unexpected error processing AIA file. Cause: ' + err)
        res.redirect('back')
    })
})

router.post('/aia/saveToGoogle', function(req, res, next) {
    const fileName = req.body.fileName
    const aiaFile = req.groupCache.getFile(fileName)
    if (aiaFile) {
        req.logger.info('Saving file to google.', {name: aiaFile.name, version: aiaFile.version})
        const data = aiaFile.getReadStream(req)
        driveApi.saveFile(req, aiaFile.fileId, data).then(fileRes => {
            req.logger.info('Completed saving file to google.')
            SessionHelper.storeMessage(req, `File ${fileName} saved to google.`)
            res.redirect('back')
        }).catch((err) => {
            req.logger.error('Unexpected error saving AIA file.', err)
            SessionHelper.storeMessage(req, 'Unexpected error processing AIA file. Cause: ' + err)
            res.redirect('back')
        })
    } else {
        SessionHelper.storeMessage(req, 'AIA File was not found')
        res.redirect('back')
    }
})

router.get('/aia/:fileName', function(req, res, next) {
    req.logger.info('getting: name=' + req.params.fileName)
    const aiaFile = req.groupCache.getFile(req.params.fileName)
    if (aiaFile) {
        req.logger.info('Downloading file', {name: aiaFile.name, version: aiaFile.version})
        res.setHeader('content-type', 'application/octet-stream');
        aiaFile.getReadStream(req).pipe(res);
    } else {
        SessionHelper.storeMessage(req, 'AIA File was not found')
        res.redirect('back')
    }
})

router.post('/aia/modify', function(req, res, next) {
    const fileName =  req.body.fileName
    const version = req.body.version

    req.logger.info('Modify AIA File', {fileName: fileName})
    const aiaFile = req.groupCache.getFile(fileName)
    if (!aiaFile) {
        SessionHelper.storeMessage(req, 'AIA File was not found')
        res.redirect('back')
    } else if (aiaFile && version && version != aiaFile.version) {
        SessionHelper.storeMessage(req, 'AIA File was modified by somebody else. Please try again.')
        res.redirect('back')
    } else  {
        processModifyAction(req, aiaFile).then(() => {
            req.logger.info('Modify AIA File complete', {fileName: fileName})
            res.redirect('back')
        }).catch((err) => {
            req.logger.error('Error processing the modify request', err)
            SessionHelper.storeMessage(req, 'Error processing the AIA file modification request. Cause: ' + err)
            res.redirect('back')
        })
    }
})

function copyScreen(req, aiaFile, screenName, targetFileName, targetVersion) {
    const targetAiaFile = req.groupCache.getFile(targetFileName)
    if (!targetAiaFile) {
        return Promise.reject('Target AIA File was not found')
    } else if (targetVersion != targetAiaFile.version) {
        return Promise.reject('Target AIA File was modified by somebody else. Please try again')
    } else  {
        if (AIAResource.isResource(screenName)) {
            return targetAiaFile.copyResourceAsync(req, aiaFile, screenName)
        } else {
            return targetAiaFile.copyScreenAsync(req, aiaFile, screenName)
        }
    }
}

function processModifyAction(req, aiaFile) {
    const action =  req.body.action
    req.logger.info('Found file to modify', {action: action, name: aiaFile.name, version: aiaFile.version})
    switch (action) {
        case ACTION_RENAME_SCREEN:
            const origName = req.body.originalName.trim()
            const newName = req.body.newName.trim()
            return aiaFile.renameScreenAsync(req, origName, newName)
        case ACTION_COPY_SCREEN:
            const screenName = req.body.screenName
            const delim = req.body.targetNameAndVersion.lastIndexOf('_')
            const targetFileName = req.body.targetNameAndVersion.substring(0, delim)
            const targetVersion = req.body.targetNameAndVersion.substring(delim + 1)
            return copyScreen(req, aiaFile, screenName, targetFileName, targetVersion)
        case ACTION_UNLOAD:
            req.logger.info('Removing file', {name:  aiaFile.name})
            req.groupCache.removeFile(aiaFile.name)
            aiaFile.unloadFile(req)
            return Promise.resolve(true)
        default:
            req.logger.error('Unknown modify action', {action: action})
            return Promise.reject({message: 'Unknown modify action', action: action})
    }
}

module.exports = router
