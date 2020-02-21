const chalk = require('chalk');
const http = require('http');
const path = require('path');
const fs = require('fs');
const pump = require('pump');

const {paintStatus, log, withTimer, immediately} = require('./utils');

const run = ({port, directory, fileExt = 'json', keepExtensions = true, slowMode = false}) => {
  const invoke = slowMode ? withTimer : immediately;
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
      const status = exist ? req.statusCode : 404;
      const paintedStatus = paintStatus(status);
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
  filesProxy.listen(port);
};

module.exports = run;
