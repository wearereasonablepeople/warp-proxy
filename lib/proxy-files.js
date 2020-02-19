const chalk = require('chalk');
const http = require('http');
const path = require('path');
const fs = require('fs');
const pump = require('pump');

const {paintStatus, log} = require('./utils');

const run = (port, directory) => {
  const filesProxy = http.createServer();

  const files = (req, res) => {
    console.log(directory, req.method, req.url);
    const filePath = path.join(directory, req.method, `${req.url}.json`);
    let status = paintStatus(res.statusCode);
    const method = chalk.bold(req.method);

    fs.exists(filePath, exist => {
      if (!exist) {
        status = paintStatus(404);
        log(chalk.bgYellowBright.black.bold(`WARNING! THERE IS NO MOCK FILE FOR ${req.url}`));
      }
      pump(fs.createReadStream(filePath), res, log(`${status} [${method}] ${filePath}`));
    });
  };

  filesProxy.on('request', files);
  filesProxy.listen(port);
};

module.exports = run;
