'use strict';

const {google} = require('googleapis');
const ApiAccess = require('./ApiAccess')

class DriveApi {
  constructor() {
  }

  /**
   * Lists the names and IDs of AIA files in the users folder
   */
  listFiles(req) {
    const service = this._getDriveService(req)
    const folderId = req.session.user.googleFolderId
    const filter = `name contains '.aia' and '${folderId}' in parents`
    return service.files.list({
        auth: req.apiAccess.getAuth(),
        pageSize: 40,
        fields: 'nextPageToken, files(id, name)',
        orderBy: 'name',
        spaces: 'drive',
        q: filter
    });
  }

  downloadFile(req, fileId) {
    const service = this._getDriveService(req)
    return service.files.get({
      auth: req.apiAccess.getAuth(),
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    })  
  }

  saveFile(req, fileId, data) {
    const service = this._getDriveService(req)
    return service.files.update({
      auth: req.apiAccess.getAuth(),
      fileId: fileId,
      uploadType: 'media',
      media: {
        body: data
      }
    }).then( uploadRes => {
      req.logger.info('Uploading complete')
    })
  }

  _getDriveService(req) {
    var driveService = req.apiAccess.driveService
    if (!driveService) {
      driveService = google.drive({
        version: 'v3'
      });
      req.apiAccess.driveService = driveService
    }
    return driveService
  }
}


module.exports = new DriveApi()
