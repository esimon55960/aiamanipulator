const crypto = require('crypto')

const STUB_BLOCK_CONTENT =
    '<xml xmlns="http://www.w3.org/1999/xhtml">\n' +
    '  <block type="text" id="${UID}" x="undefined" y="undefined">\n' +
    '    <field name="TEXT">Stub block that should be deleted once real content is created.</field>\n' +
    '  </block>\n' +
    '  <yacodeblocks ya-version="167" language-version="21"></yacodeblocks>\n' +
    '</xml>'

class AIABlock {
    constructor() {
        this.length = 0
    }

    load(req, fileInfo) {
        return fileInfo.async('string').then((content) => {
            this.length = content.length
            req.logger.info('Loaded block info. name=' + fileInfo.name + ', size=' + content.length)
        })
    }

    isEmpty() {
        return this.length == 0
    }

    getStubbedContent() {
        const buf = crypto.randomBytes(20);
        const id = buf.toString('base64')
        const uniqueStub = STUB_BLOCK_CONTENT.replace('${UID}', id)
        return uniqueStub
    }
}

module.exports = AIABlock
