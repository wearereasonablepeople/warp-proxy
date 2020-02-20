const chalk = require('chalk');
const log = console.log;

const paintStatus = status => {
  switch (true) {
    case status <= 399:
      return chalk.bgGreen.black(` ${status} `);

    case status >= 400 && status <= 499:
      return chalk.bgMagenta.black(` ${status} `);

    case status >= 500:
      return chalk.bgRed.black(` ${status} `);

    default:
      return chalk.white(status);
  }
};

const startMessage = (port, target) => log(`

  Server running at ${chalk.blueBright(`http://localhost:${port}`)}
  Proxying requests to ${chalk.cyanBright(target)}

`);

module.exports = {
  log,
  paintStatus,
  startMessage,
};
