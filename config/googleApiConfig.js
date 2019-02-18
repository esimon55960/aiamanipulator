module.exports = {
  "web": {
    "client_id":process.env.google_client_id,
    "project_id":process.env.google_project_id,
    "auth_uri":"https://accounts.google.com/o/oauth2/auth",
    "token_uri":"https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
    "client_secret":process.env.google_client_secret,
    "redirect_uris":[
      "http://localhost:3000/googleapi/auth",
      process.env.google_production_auth_url
    ]
  }
};
