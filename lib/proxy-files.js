const chalk = require('chalk');
const http = require('http');
const path = require('path');
const fs = require('fs');
const pump = require('pump');

const {paintStatus, log, withTimer, immediately, replaceLast} = require('./utils');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*'
};

const mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};

const stripQueryStringFromURL = url => url.replace(/(.+?\/.+)\?.+$/g, '$1');

const run = ({port, directory, fileExt = 'json', keepExtensions = true, slowMode = false}) => {
  const invoke = slowMode ? withTimer : immediately;
  const filesProxy = http.createServer();

  const files = (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      res.end();
      return;
    }

    const strippedURL = stripQueryStringFromURL(req.url);
    const urlFile = strippedURL.split('/').splice(-1).pop() || `index.${fileExt}`;
    const urlFileExt = urlFile.indexOf('.') > -1 ? urlFile.split('.').splice(-1).pop() : null;
    const urlFileName = urlFile.split(`.${urlFileExt}`)[0];
    log(`urlFile=${urlFile} urlFileExt=${urlFileExt} urlFileName=${urlFileName}`);

    const url = replaceLast(urlFile, '', strippedURL);
    log(`url after replaceLast: ${url}`);

    const method = req.method;

    const finalFileExtension = keepExtensions && urlFileExt ? urlFileExt : fileExt;
    const filePath = path.join(directory, method, url, `${urlFileName}.${finalFileExtension}`);

    const type = mime[path.extname(finalFileExtension).slice(1)] || 'text/plain';

    fs.exists(filePath, exist => {
      const status = exist ? 200 : 404;
      const paintedStatus = paintStatus(status);
      res.writeHead(status, {...headers, 'Content-Type': type});

      if (exist) {
        const stream = fs.createReadStream(filePath);
        invoke(() => pump(stream, res, log(`${paintedStatus} ${chalk.bold(method)} ${filePath}`)));
      } else {
        log(`${paintedStatus} ${chalk.bold(method)} ${filePath}`);
        log(chalk.bgYellowBright.black.bold(`File not found: ${filePath}`));

        res.statusCode = status;
        res.end();
      }
    });
  };

  filesProxy.on('request', files);
  filesProxy.on('error', log);
  return filesProxy.listen(port);
};

module.exports = run;
