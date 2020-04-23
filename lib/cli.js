#!/usr/bin/env node

const argv = require('yargs');
const path = require('path');

const {startMessage, updateSilent} = require('./utils');
const web = require('./proxy-web');
const files = require('./proxy-files');

let webServer;
let filesServer;

argv
.usage('Usage: $0 <command> [options]')
.command('web', 'runs in web mode', args => {
  args.option('port', {
    alias: ['p'],
    require: true,
    type: 'number',
    describe: 'Port to be used by the local server',
  }).option('target', {
    alias: ['t'],
    require: true,
    type: 'string',
    describe: 'Address of the server to send your requests',
  })
  .example('$0 web --port 3000 --target https://api.github.com');
}, argv => {
  startMessage(argv.port, argv.target);
  web(argv);
})
.command('mock', 'runs in mock mode', args => {
  args.option('port', {
    alias: ['p'],
    require: true,
    type: 'number',
    describe: 'Port to be used by the local server',
  }).option('directory', {
    alias: ['d'],
    require: true,
    type: 'string',
    describe: 'Directory to read the mock files',
  })
  .option('fileExtension', {
    alias: ['fe'],
    type: 'string',
    default: 'json',
    describe: 'File exntesion of the mock files',
  })
  .option('keepExtensions', {
    alias: ['ke'],
    type: 'boolean',
    default: true,
    describe: 'If the request ends with a file extension, use it instead',
  })
  .option('slowMode', {
    alias: ['sm'],
    type: 'boolean',
    default: false,
    describe: 'Applies a random delay between 0 and 7s to the response',
  })
  .example('$0 mock --port 3000 --directory ./mocks --fileExtension json')
  .example('$0 mock --port 3000 --directory ./mocks --slowMode --keepExtensions ');
}, argv => {
  startMessage(argv.port, argv.directory);
  files(argv);
})
.command('run', 'runs loading the configuration from a file [--config]', args => {
  args.option('config', {
    alias: ['c'],
    require: true,
    describe: 'path to the javascript configuration file',
  })
  .example('$0 run --config ./proxy-config.js');
}, argv => {
  const configPath = path.resolve(process.cwd(), argv.config);
  const {mode, port, target, directory, silent, ...config} = require(configPath);

  updateSilent(silent);
  if (mode === 'web') {
    startMessage(port, target);
    webServer = web({port, target, ...config});
  }
  if (mode === 'mock') {
    startMessage(port, directory);
    filesServer = files({port, directory, ...config});
  }
})
.help('help')
.argv;

process.on('SIGTERM', () => {
  webServer && webServer.close();
  filesServer && filesServer.close();
});
