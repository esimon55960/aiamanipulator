const fs = require('fs');
const os = require('os');
const rimraf = require('rimraf')

class FileUtils {
    constructor() {}

    getRootAiaFolder() {
        const directory = this._rootAiaFolder()
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory)
        }
        return directory
    }

    clearRootAiaFolder() {
        console.info('Initialize AIA Folder to empty state')
        const aiaFolderPath = this._rootAiaFolder()
        rimraf.sync(aiaFolderPath);
    }

    clearGroupFolder(groupFolder) {
        console.info('Clear the group folder at ' + groupFolder)
        const directory = this._rootAiaFolder() + '/' + groupFolder
        rimraf.sync(directory);
    }

    _rootAiaFolder() {
        const directory = os.tmpdir() + '/ai-manipulator'
        return directory
    }
}

module.exports = new FileUtils()
