#!/usr/bin/env node

const argv = require('yargs');
const path = require('path');

const {startMessage} = require('./utils');
const web = require('./proxy-web');
const files = require('./proxy-files');

argv
.usage('Usage: $0 <command> [options]')
.command('web', 'starts the server in web mode', args => {
  args.option('port', {
    alias: ['p'],
    require: true,
    describe: 'port to be used by the local server',
  }).option('target', {
    alias: ['t'],
    require: true,
    describe: 'address of the server to send your requests',
  })
  .example('$0 web --port 3000 --target http://my.api.com');
}, argv => {
  startMessage(argv.port, argv.target);
  web(argv.port, argv.target);
})
.command('mock', 'starts the server in mock mode', args => {
  args.option('port', {
    alias: ['p'],
    require: true,
    describe: 'port to be used by the local server',
  }).option('directory', {
    alias: ['d'],
    require: true,
    describe: 'directory to read the mock files',
  })
  .example('$0 mock --port 3000 --directory ./mocks');
}, argv => {
  startMessage(argv.port, argv.directory);
  files(argv.port, argv.directory);
})
.command('run', 'starts the server using a configuration [--config]', args => {
  args.option('config', {
    alias: ['c'],
    require: true,
    describe: 'path to the javascript configuration file',
  })
  .example('$0 run --config ./proxy-config.js');
}, argv => {
  const configPath = path.resolve(process.cwd(), argv.config);
  const {mode, port, target, directory, ...config} = require(configPath);

  if (mode === 'web') {
    startMessage(port, target);
    web(port, target, config);
  }
  if (mode === 'mock') {
    startMessage(port, directory);
    files(port, directory);
  }
})
.argv;
