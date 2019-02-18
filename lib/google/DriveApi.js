'use strict';

const {google} = require('googleapis');
const ApiAccess = require('ApiAccess')

class DriveApi {
  constructor() {
  }

  /**
   * Lists the names and IDs of up to 10 files.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  listFiles(req, res) {
    const service = google.drive('v3');
    service.files.list(
      {
        auth: ApiAccess.getAuth(),
        pageSize: 40,
        fields: 'nextPageToken, files(id, name)',
      },
      (err, result) => {
        if (err) {
          req.logger.error('The API returned an error.', err);
          throw err;
        }
        const files = result.data.files;
        if (files.length === 0) {
          req.logger.info('No files found.');
        } else {
          req.logger.info('Files:');
          for (const file of files) {
            req.logger.info(`${file.name} (${file.id})`);
          }
        }
      }
    );
  }
}


module.exports = new DriveApi()
