const express = require('express')
const app = express()
const fileUpload = require('express-fileupload')
const fileUtils = require('./lib/util/FileUtils')

const PORT = (process.env.PORT || 3000)
// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
    console.error('Uncaught exception')
    console.error(err)
})

fileUtils.clearRootAiaFolder()

app.set('trust proxy', 1)
app.set('view engine', 'pug')
app.set('views', './views')
app.use('/public', express.static('./public'));

app.use(function(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
})

let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))
app.use(fileUpload());

app.use(require('./lib/logger').middleware());
app.use (function (req, res, next) {
    if (req.secure || process.env.BLUEMIX_REGION === undefined) {
        next();
    } else {
        const targetUrl = 'https://' + req.headers.host + req.url
        req.logger.info('Detected http protocol. Redirect to https', {targetUrl: targetUrl});
        res.redirect(targetUrl);
    }
})

app.use(require('./lib/SessionStore'));
app.use(require('./lib/UserAuth').middleware());
app.use(require('./routes/index'));
app.use(require('./routes/logout'));
app.use(require('./routes/aiaApi'));

app.listen(PORT, () => {
  console.log('Server started and listening on port ', + PORT)
})
