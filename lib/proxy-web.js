const chalk = require('chalk');
const httpProxy = require('http-proxy');
const {Agent} = require('https');
const {parse} = require('url');

const {paintStatus, log} = require('./utils');

const run = (port, target) => {
  const baseUrl = parse(target);
  const config = {};

  const webProxy = httpProxy.createProxyServer({
    target: baseUrl,
    secure: false,
    changeOrigin: true,
    agent: new Agent({rejectUnauthorized: false || config.secure}),
    ...config
  });

  const web = (proxyRes, req, res) => {
    if (proxyRes.statusCode === 500) {
      proxyRes.on('data', chunk => {
        log(`\n${chunk}\n`);
      });
    }
    const status = paintStatus(res.statusCode);
    const method = chalk.bold(req.method);
    log(`${status} [${method}] ${baseUrl.protocol}//${baseUrl.host}${req.url}`);
  };

  webProxy.on('proxyRes', web);
  webProxy.listen(port);
};

module.exports = run;
