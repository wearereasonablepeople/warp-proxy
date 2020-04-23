const {startMessage, updateSilent} = require('./utils');
const web = require('./proxy-web');
const files = require('./proxy-files');

let webServer;
let filesServer;

const run = function(configuration) {
  const {mode, port, target, directory, silent, ...config} = configuration;

  updateSilent(silent);
  if (mode === 'web') {
    webServer = web({port, target, ...config});
  }
  if (mode === 'mock') {
    filesServer = files({port, directory, ...config});
  }
};

process.on('SIGTERM', () => {
  webServer && webServer.close();
  filesServer && filesServer.close();
});

module.exports = {
  files,
  web,
  run
};
