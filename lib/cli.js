#!/usr/bin/env node

const argv = require('yargs');
const path = require('path');

const {startMessage} = require('./utils');
const web = require('./proxy-web');
const files = require('./proxy-files');

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
  web(argv.port, argv.target);
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
  .example('$0 mock --port 3000 --directory ./mocks --fileExtension json');
}, argv => {
  startMessage(argv.port, argv.directory);
  files(argv.port, argv.directory, argv.fileFormat, argv.keepExtensions);
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
  const {
    mode, port, target, directory, fileFormat, keepExtensions, ...config
  } = require(configPath);

  if (mode === 'web') {
    startMessage(port, target);
    web(port, target, config);
  }
  if (mode === 'mock') {
    startMessage(port, directory);
    files(port, directory, fileFormat, keepExtensions);
  }
})
.help('help')
.argv;
