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

  webProxy.on('proxyRes', (proxyRes, req) => {
    if (proxyRes.statusCode === 500) {
      proxyRes.on('data', chunk => {
        log(`\n${chunk}\n`);
      });
    }
    const status = paintStatus(proxyRes.statusCode);
    const method = chalk.bold(req.method);
    const path = req.url.replace(/^\//, '');
    log(`${status} [${method}] ${target}${path ? `/${path}` : ''}`);
  });
  webProxy.on('econnreset', (_, req, res) => {
    log('Connection closed');
    req.destroy();
    res.end();
  });
  webProxy.on('error', (err, req, res) => {
    log(`Connection error: ${err}`);
    req.destroy();
    res.end();
  });

  return webProxy.listen(port);
};

module.exports = run;
