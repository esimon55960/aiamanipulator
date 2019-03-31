
var cacheData = {}

class GroupCache {
    constructor() {
        this.files = []
        this.primary = undefined
        this.secondary = undefined
    }

    setPrimary(aiaFile) {
        this.primary = aiaFile
    }
    getPrimary(aiaFile) {
        return this.primary
    }

    setSecondary(aiaFile) {
        this.secondary = aiaFile
    }
    getSecondary(aiaFile) {
        return this.secondary
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

    /**
     * Clears all the files from this cache
     */
    clearCache() {
        this.files = []
        this.primary = undefined
        this.secondary = undefined
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
