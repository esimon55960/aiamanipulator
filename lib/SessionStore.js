
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const FILESTORE_OPTIONS = {};

const SESSION_OPTIONS = {
    //Uncomment this line if we want file backed sessions. Note however, I had some issues with that not
    // working correct. Properties set on the session would sometimes not get saved properly. I suspect it was
    // because the file system was updated async. But that is just a guess.
    //store: new FileStore(FILESTORE_OPTIONS),
    secret: 'io-8-vn3-48lj023cgsdhfSDKHEHLF',
    resave: false,
    saveUninitialized: false,
    name: 'aiamanipulator'
}

module.exports = session(SESSION_OPTIONS)
