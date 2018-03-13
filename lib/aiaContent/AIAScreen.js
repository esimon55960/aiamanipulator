
const TAG_BEGIN = '#|'
const TAG_END = '|#'
const TAG_CONTENT_TYPE = '$JSON'
const TAG_NEWLINE = '\n'

class AIAScreen {
    constructor(src) {
        this.content = undefined
        this.name = undefined
        this.screenName = undefined
        this.title = undefined
    }

    clone() {
        const screen = Object.assign(new AIAScreen(), this)
        return screen
    }

    load(req, fileInfo) {
        this.name = fileInfo.name
        return fileInfo.async('string').then((content) => {
            this.content = this._parseContent(req, content)
            this.screenName = this.content.Properties['$Name']
            this.title = this.content.Properties['Title']
        })
    }

    /**
    Returns content as it would exist for a new screen name. This object is not
    changed however because we want to make sure everything commited to disk first.
    Once updated zip is persisted, use updateScreenName to finalize the internal
    update
    */
    getRenameContent(newScreenName) {
        const newContent = Object.assign({}, this.content)
        newContent.Properties['$Name'] = newScreenName
        const result = TAG_BEGIN + TAG_NEWLINE + TAG_CONTENT_TYPE + TAG_NEWLINE +
            JSON.stringify(newContent) +
            TAG_NEWLINE + TAG_END
        return result
    }

    updateScreenName(name, screenName) {
        this.name = name
        this.content.Properties['$Name'] = screenName
        this.screenName = screenName
    }

    _parseContent(req, content) {
        if (!content.startsWith(TAG_BEGIN) || !content.endsWith(TAG_END)) {
            req.logger.info('ScreenContent=' + content)
            throw new Error('Screen content missing opening and ending tags. Possible invalid input')
        }
        if (content.indexOf(TAG_CONTENT_TYPE) < 0) {
            req.logger.info('ScreenContent=' + content)
            throw new Error('Missing content type tag "' + TAG_CONTENT_TYPE + '" in screen. Possible invalid input')
        }
        const jsonText = content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1 )
        return JSON.parse(jsonText)
    }
}

module.exports = AIAScreen
