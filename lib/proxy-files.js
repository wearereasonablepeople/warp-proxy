const chalk = require('chalk');
const http = require('http');
const path = require('path');
const fs = require('fs');
const pump = require('pump');

const {paintStatus, log} = require('./utils');

const run = (port, directory, fileExt, keepExtensions) => {
  const filesProxy = http.createServer();

  const files = (req, res) => {
    const urlFile = req.url.split('/').splice(-1).pop() || `index.${fileExt}`;
    const urlFileExt = urlFile.indexOf('.') > -1 ? urlFile.split('.').splice(-1).pop() : null;
    const urlFileName = urlFile.split(`.${urlFileExt}`)[0];

    const url = req.url.replace(urlFile, '');
    const method = req.method;

    const finalFileExtension = keepExtensions && urlFileExt ? urlFileExt : fileExt;
    const filePath = path.join(directory, method, url, `${urlFileName}.${finalFileExtension}`);

    fs.exists(filePath, exist => {
      if (!exist) {
        res.statusCode = 404;
        log(chalk.bgYellowBright.black.bold(`WARNING! THERE IS NO MOCK FILE FOR ${req.url}`));
      }
      const status = paintStatus(res.statusCode);
      pump(fs.createReadStream(filePath), res, log(`${status}[${chalk.bold(method)}] ${filePath}`));
    });
  };

  filesProxy.on('request', files);
  filesProxy.listen(port);
};

module.exports = run;
