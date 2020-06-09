const chalk = require('chalk');

let silent = false;
const updateSilent = s => silent = s;
const log = t => !silent && console.log(t);

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

const replaceLast = (find, replace, string) => {
  const lastIndex = string.lastIndexOf(find);

  if (lastIndex === -1) {
    return string;
  }

  const beginString = string.substring(0, lastIndex);
  const endString = string.substring(lastIndex + find.length);

  return beginString + replace + endString;
};

const random = (min, max) => Math.ceil(Math.random() * (max - min) + min) * 1000;

const withTimer = fn => setTimeout(fn, random(0, 7));

const immediately = fn => fn();

module.exports = {
  log,
  paintStatus,
  random,
  startMessage,
  withTimer,
  immediately,
  replaceLast,
  updateSilent
};
