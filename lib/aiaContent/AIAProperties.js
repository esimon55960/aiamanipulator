
class AIAProperties {
    constructor() {
        this.content = undefined
    }

    load(req, fileInfo) {
        return fileInfo.async('string').then((content) => {
            this.content = content
        })
    }
}

module.exports = AIAProperties
