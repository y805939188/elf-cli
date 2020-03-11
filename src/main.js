const path = require('path');
const program = require('commander');
const { version } = require('../package.json');

const actions = {
  start: {
    description: 'start create a widget',
    alias: 'S',
    examples: [ 'vi-cli start' ],
  },
  '*': {
    description: 'command not found',
  },
};

Object.entries(actions).forEach(([key, value]) => {
  program
    .command(key)
    .description(value.description)
    .alias(value.alias)
    .action(() => {
      if (key === '*') {
        console.log('错误的命令');
      } else {
        require(path.join(__dirname, 'commands', key))(process.argv.slice(3));
      }
    });
});

program.on('--help', () => {});

program.version(version).parse(process.argv);
