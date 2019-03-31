# AI Manipulator

  Service for manipulating MIT App inventor files.

## Setup
Clone the repo
```
git clone https://github.com/esimon55960/aiamanipulator
```

Install dependencies
```
npm install
```

Copy users.template.json to users.json and update the users/pw

start server locally
```
node app.js
```
## Development Notes
https://aiamanipulator.mybluemix.net/

### Google Drive access
Google API Activation for google drive
https://console.developers.google.com/apis/credentials?project=api-project-188408953265

### Google API
Node.js wrapper
https://www.npmjs.com/package/googleapis

Username information
https://developers.google.com/identity/protocols/OpenIDConnect

File API
https://developers.google.com/drive/api/v3/reference/files/get

Download
https://developers.google.com/drive/api/v3/manage-downloads#examples

Redirect URI
https://aiamanipulator.mybluemix.net/driveauth

ClientID
 188408953265-abrb73hbqpcpjaghcbpjiivo5tvrm3p9.apps.googleusercontent.com

### debugging
    See directions here:
        https://medium.com/the-node-js-collection/debugging-node-js-with-google-chrome-4965b5f910f4
    1. Start node with special parameter
        node --inspect app.js
    2. Start chrome
    3. Type about:inspect in chrome address bar
    4. Select the Application
    5. Add folder to the work space where source code exists
    6. You might get permission error. Look for the Allow button at top.
