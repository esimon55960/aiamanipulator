const STUB_BLOCK_CONTENT =
    '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '  <block type="text" id="VpOBOLRh{%!|zt(vm#u%" x="undefined" y="undefined">' +
    '    <field name="TEXT">Stub block that can be deleted.</field>' +
    '  </block>' +
    '  <yacodeblocks ya-version="167" language-version="21"></yacodeblocks>' +
    '</xml>'

class AIABlock {
    constructor(src) {
    }

    load(req, fileInfo) {
        return fileInfo.async('string').then((content) => {
            req.logger.info('Loaded block info. name=' + fileInfo.name + ', size=' + content.length)
        })
    }
}

module.exports = AIABlock
