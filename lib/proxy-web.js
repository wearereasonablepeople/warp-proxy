const chalk = require('chalk');
const httpProxy = require('http-proxy');
const {Agent} = require('https');
const {parse} = require('url');

const {paintStatus, log} = require('./utils');

const run = ({port, target, config = {}}) => {
  const baseUrl = parse(target);

  const webProxy = httpProxy.createProxyServer({
    target: baseUrl,
    secure: false,
    changeOrigin: true,
    agent: new Agent({rejectUnauthorized: false || config.secure}),
    proxyTimeout: 1000 * 60 * 5,
    timeout: 1000 * 60 * 5,
    ...config
  });

  const web = (proxyRes, req) => {
    if (proxyRes.statusCode === 500) {
      proxyRes.on('data', chunk => {
        log(`\n${chunk}\n`);
      });
    }
    const status = paintStatus(proxyRes.statusCode);
    const method = chalk.bold(req.method);
    log(`${status} [${method}] ${baseUrl.protocol}//${baseUrl.host}${req.url}`);
  };

  webProxy.on('proxyRes', web);
  webProxy.on('econnreset', () => log('Connection closed'));
  webProxy.on('error', err => log(`Connection error: ${err}`));

  webProxy.listen(port);
};

module.exports = run;
