
const RESOURCE_PREFIX = 'assets/'

class AIAResource {

    constructor(path) {
        this.name = path.substring(RESOURCE_PREFIX.length)
        this.path = path
    }

    static isResource(path) {
        const result = path.startsWith(RESOURCE_PREFIX) && path.length > RESOURCE_PREFIX.length
        return result
    }
}

module.exports = AIAResource
