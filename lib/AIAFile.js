const fs = require('fs');
const Promise = require("bluebird")
const Zip = require('node-zip')
const JSZip = require("jszip")
const AIABlock = require('./aiaContent/AIABlock')
const AIAProperties = require('./aiaContent/AIAProperties')
const AIAScreen = require('./aiaContent/AIAScreen')
const FileUtils = require('./util/FileUtils')

class AIAFile {
    constructor(name) {
        this.name = name
        this.version = 0
        this.properties = undefined
        this.screens = []
    }

    /**
    Returns a promise that resolves when content is done loadign
    */
    loadAsync(req, data) {
        const path = this._osPathForVersion(req, this.version)
        fs.writeFileSync(path, data)
        req.logger.info('Storing AIA file at ' + path)
        return this._parseZipFile(req, data).then((zip) => {
            req.logger.info('Zip loaded. We should store it now. files.keys=' + Object.keys(zip.files))
        })
    }

    getReadStream(req) {
        const path = this._osPathForVersion(req, this.version)
        const rstream = fs.createReadStream(path)
        return rstream
    }

    renameScreenAsync(req, originalName, newScreenName) {
        req.logger.info('Renaming screen', {originalName: originalName, newScreenName: newScreenName})
        if (originalName == newScreenName) {
            return Promise.reject('The new screen name is same as old name')
        }
        const newScreen = this._findScreen(newScreenName)
        if (newScreen) {
            return Promise.reject('The target screen name already exists')
        }
        const origScreen = this._findScreen(originalName)
        if (!origScreen) {
            return Promise.reject('The screen being renamed was not found')
        }

        return this._loadCachedZip(req).then((zip) => {
            const newName = this._deriveFileName(origScreen.name, newScreenName, '.scm')
            req.logger.info('renaming screen', {originalName: origScreen.name, newName: newName})
            const renameContent = origScreen.getRenameContent(newScreenName)
            zip.file(newName, renameContent)
            zip.remove(origScreen.name)
            const originalBlockName = this._deriveFileName(origScreen.name, originalName, '.bky')
            return zip.file(originalBlockName).async('string').then((blockContent) => {
                const newBlockName = this._deriveFileName(origScreen.name, newScreenName, '.bky')
                zip.file(newBlockName, blockContent)
                zip.remove(originalBlockName)
            }).then(() => {
                return this._persistNewVersion(req, zip).then(() => {
                    origScreen.updateScreenName(newName, newScreenName)
                })
            })
        })
    }

    copyScreenAsync(req, sourceAiaFile, screenName) {
        req.logger.info('Copy screen', {src: sourceAiaFile.name, tgt: this.name, screenName: screenName})
        const srcScreen = sourceAiaFile._findScreen(screenName)
        if (!srcScreen) {
            return Promise.reject('The screen being copied was not found')
        }
        if (this.screens.length == 0) {
            return Promise.reject('There are no screens in the target AIA file so we cannot determine target screen path. ' +
                ' Add a screen to the target and retry.')
        }
        const targetBasePath = this.screens[0].name
        const targetScreenFile = this._deriveFileName(targetBasePath, screenName, '.scm')
        const targetBlockFile = this._deriveFileName(targetBasePath, screenName, '.bky')

        let blockContent
        return sourceAiaFile._loadCachedZip(req).then((zip) => {
            const blockName = this._deriveFileName(srcScreen.name, screenName, '.bky')
            req.logger.info('Loaded source zip. Getting content now', {blockName: blockName})
            return zip.file(blockName).async('string')
        }).then((content) => {
            blockContent = content
            req.logger.info('Loading the target zip now')
            return this._loadCachedZip(req)
        }).then((zip) => {
            req.logger.info('Setting screen and block files into target zip')
            const screenContent = srcScreen.getRenameContent(screenName)
            zip.file(targetScreenFile, screenContent)
            zip.file(targetBlockFile, blockContent)
            return this._persistNewVersion(req, zip)
        }).then(() => {
            req.logger.info('Store the new screen internally')
            this._removeScreen(screenName)
            const screen = srcScreen.clone();
            screen.updateScreenName(targetScreenFile, screenName)
            this.screens.push(screen)
        })
    }

    /**
    Take an existing path and modify the name and extension
    */
    _deriveFileName(path, newName, extension) {
        const basePath = path.substring(0, path.lastIndexOf('/'))
        const newPath = basePath + '/' + newName + extension
        return newPath
    }
    /**
    Returns a promise that resolves to a JSZip object that will be loaded from
    our temporary directory
    */
    _loadCachedZip(req) {
        const path = this._osPathForVersion(req, this.version)
        const data = fs.readFileSync(path)
        return JSZip.loadAsync(data)
    }

    _parseZipFile(req, data) {
        req.logger.info('Loading zip')
        let zip = new JSZip()
        return zip.loadAsync(data).then((zip) => {
            req.logger.info('Zip object created.')
            this.files = zip.files;
            if (zip.files) {
                return Promise.map(Object.keys(zip.files), ((key) => {
                    const fileInfo = zip.files[key];
                    req.logger.info('File Info: ' + fileInfo.name + ", is directory=" + fileInfo.dir)
                    return this._loadContent(req, fileInfo)
                })).then((result) => {
                    req.logger.info('Done iterating zip file contents')
                    return zip
                })
            } else {
                req.logger.info('Zip file has no contents. Not sure if this is possible except bad inputs')
            }
            return zip
        })
    }

    _loadContent(req, fileInfo) {
        if (fileInfo.name.endsWith('project.properties')) {
            this.properties = new AIAProperties()
            return this.properties.load(req, fileInfo)
        } else if (fileInfo.name.endsWith('.scm')) {
            let screen = new AIAScreen()
            this.screens.push(screen)
            return screen.load(req, fileInfo)
        } else if (fileInfo.name.endsWith('.bky')) {
            let block = new AIABlock()
            return block.load(req, fileInfo)
        } else {
            return Promise.resolve(true)
        }
    }

    _persistNewVersion(req, zip) {
        return new Promise((resolve, reject) => {
            const newVersion = this.version + 1
            const newPath = this._osPathForVersion(req, newVersion)
            const zipStream = zip.generateNodeStream({
                type:'nodebuffer',
                compression: "DEFLATE",
                streamFiles:true})
            zipStream.pipe(fs.createWriteStream(newPath).on('finish', (() => {
                req.logger.info('File updated as new version', {newPath: newPath})
                const oldPath = this._osPathForVersion(req, this.version)
                this.version = newVersion
                fs.unlinkSync(oldPath)
                req.logger.info('Removed old file version. Version update complete', {oldPath: oldPath})
                resolve(true)
            })))
        })
    }

    _osPathForVersion(req, version) {
        const directory = this._ensureTempFolder(req)
        const path = directory + '/' + this.name + '_' + version;
        return path
    }

    _ensureTempFolder(req) {
        const directory = FileUtils.getRootAiaFolder() + '/' + req.session.user.group;
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory)
        }
        return directory
    }

    _findScreen(screenName) {
        for (let i=0; i < this.screens.length; i++) {
            if (this.screens[i].screenName == screenName) {
                return this.screens[i]
            }
        }
        return null
    }

    _removeScreen(screenName) {
        for (let i=0; i < this.screens.length; i++) {
            if (this.screens[i].screenName == screenName) {
                this.screens.splice(i, 1)
                break
            }
        }
    }

}

module.exports = AIAFile
