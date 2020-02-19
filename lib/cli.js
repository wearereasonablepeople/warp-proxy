#!/usr/bin/env node
const argv = require('yargs');

const {log} = require('./utils');
const web = require('./proxy-web');
const files = require('./proxy-files');

const startingMessage = (port, mode) => (
  log(`
==================================
Server has started at port ${port}
Mode: ${mode}
==================================
`)
);

// eslint-disable-next-line no-unused-expressions
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
  startingMessage(argv.port, 'WEB');
  web(argv.port, argv.target);
})
.command('mock', 'starts the server in mocks mode', args => {
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
  startingMessage(argv.port, 'MOCK');
  files(argv.port, argv.directory);
})
.argv;
