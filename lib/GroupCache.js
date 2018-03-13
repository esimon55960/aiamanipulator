
var cacheData = {}

class GroupCache {
    constructor() {
        this.files = []
    }

    addFile(aiafile) {
        let curIndex = this._findFileIndex(aiafile.name)
        if (curIndex < 0) {
            curIndex = this.files.length;
        }
        this.files[curIndex] = aiafile
    }

    getFiles() {
        return this.files
    }

    getFile(fileName) {
        let curIndex = this._findFileIndex(fileName)
        if (curIndex >= 0) {
            return this.files[curIndex]
        } else {
            return null
        }
    }

    removeFile(fileName) {
        let curIndex = this._findFileIndex(fileName)
        if (curIndex >= 0) {
            const removedItem = this.files[curIndex]
            this.files.splice(curIndex, 1)
            return removedItem
        } else {
            return null
        }
    }

    _findFileIndex(name) {
        for (let i=0; i < this.files.length; i ++) {
            if (this.files[i].name == name) {
                return i
            }
        }
        return -1
    }
}

function getGroupCache(groupName) {
    let cache = cacheData[groupName]
    if (!cache) {
        cache = new GroupCache()
        cacheData[groupName] = cache
    }
    return cache
}

module.exports.getGroupCache = getGroupCache
