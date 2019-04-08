
var cacheData = {}

class GroupCache {
    constructor() {
        this.primary = undefined
        this.secondary = undefined
    }

    setByPos(filePos, aiaFile) {
        if (filePos == 0) {
            this.primary = aiaFile
        } else {
            this.secondary = aiaFile
        }
    }

    getByPos(filePos) {
        if (filePos == 0) {
            return this.primary
        } else {
            return this.secondary
        }

    }
    getPrimary() {
        return this.primary
    }
    setPrimary(aiaFile) {
        this.primary = aiaFile
    }

    getSecondary() {
        return this.secondary
    }
    setSecondary(aiaFile) {
        this.secondary = aiaFile
    }

    getFile(fileName) {
        if (this.primary && this.primary.name == fileName) {
            return this.primary
        } else if (this.secondary && this.secondary.name == fileName) {
            return this.secondary
        }
    }


    /**
     * Clears all the files from this cache
     */
    clearCache() {
        this.primary = undefined
        this.secondary = undefined
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
