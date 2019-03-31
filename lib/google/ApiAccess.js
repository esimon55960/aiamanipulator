'use strict';

const {google} = require('googleapis');
const uuid = require('uuid')
const jwt_decode = require('jwt-decode')

const scopes = ['openid', 'email', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata.readonly'];

class ApiAccess {
  constructor(authPath) {
    this.client = new google.auth.OAuth2(
      process.env.google_client_id,
      process.env.google_client_secret,
      process.env.google_auth_baseurl + authPath
    )
    this.id = uuid.v4()
    this.userName = undefined
  }

  getId() {
    return this.id
  }

  getAuth() {
    return this.client
  }

  isLoggedIn(req) {
    return  this.client.credentials && 
            this.client.credentials.access_token && 
            this.userName
  }

  getUserName(req) {
    return this.userName
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
        return this.client.getToken(code).then(tokenResponse => {
          this.client.setCredentials(tokenResponse.tokens)
          var jwt = jwt_decode(tokenResponse.tokens.id_token)
          this.userName = jwt.email
          return true
        }).catch(err => {
          req.logger.error('Error getting tokens', err)
          return false
        })
    }
}

module.exports = ApiAccess
