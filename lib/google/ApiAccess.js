'use strict';

const {google} = require('googleapis');

const scopes = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata.readonly'];

class ApiAccess {
  constructor(authPath) {
    this.client = new google.auth.OAuth2(
      process.env.google_client_id,
      process.env.google_client_secret,
      process.env.google_auth_baseurl + authPath
    );
  }

  isLoggedIn(req, res) {
    req.logger.info('current credentials=', {credentials: this.client.credentials})
    return this.client.credentials && this.client.credentials.access_token
  }

  getLoginFlowUrl(req, res) {
    var authorizeUrl = this.client.generateAuthUrl({
      access_type: 'online',     // online, offline
      scope: scopes
    });
    return authorizeUrl
  }

    processAuthCode(req, res) {
        const code = req.query.code;
        const target = req.query.target;
        req.logger.info('Code=' + code)
        req.logger.info('target=' + target)
        this.client.getToken(code, (err, tokens) => {
          if (err) {
            req.logger.error('Error getting oAuth tokens:', err)
            throw err;
          }
          req.logger.info('Tokens=', tokens)
          this.client.setCredentials(tokens)

          req.logger.info('Got google oAuth token. Redirect to ' + target)
          res.redirect(target)
        })
    }
}

module.exports = ApiAccess
