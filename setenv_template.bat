@echo off
rem Duplicate this file to a file called setenv.bat
rem Set the values as needed.


rem Google API secret
set google_project_id=api-project-xxxxx
set google_client_id=xxxxxx.apps.googleusercontent.com
set google_client_secret=xxxxxx

rem Location used for Google authorization callback in production (ie official deploy)
set google_production_auth_baseurl=https://myhost.mybluemix.net

rem Location used for google authorization callback in local development mode
set google_auth_baseurl=http://localhost:3000

rem IBM credentials and details used for Cloud Foundry deploy to bluemix
set CF_USER=bluemix_username
set CF_PASSWORD=bluemix_pw
set CF_REGION=us-south
set CF_ORG=myBluemix_org
set CF_SPACE=dev
set CF_APP_NAME=MyAppName
set CF_HOST=myhost
