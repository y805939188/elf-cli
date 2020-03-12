const chalk = require('chalk');
const ora = require('ora');
const execa = require('execa');
const { promisify } = require('util'); // 把异步处理成promise的
const downloadGitRepo = promisify(require('download-git-repo')); // 下载repo的

// const minimist = require('minimist'); // 解析命令行参数 process.argv,有的项目用arg。
// const fs = require('fs-extra'); // 这个是操作文件的库，node自带的库需要写很多的hack
// const home = require('user-home'); // 用于获取用户的根目录
// const tildify = require('tildify'); // 将绝对路径转换成带波浪符的路径
// const chalk = require('chalk'); // 用于高亮终端打印出的信息
// const rm = require('rimraf').sync; // 相当于UNIX的“rm -rf”命令

const log = (color, ...text) => console.log(chalk[color](...text));

async function executeCommand (command, args, cwd) {
  try {
    const child = await execa(command, args, {
      cwd,
      stdio: ['inherit', 'inherit', 'inherit']
    });
    if (child.command === 'npm') {
      child.on('close', code => {
        if (code !== 0) {
          return `command failed: ${command} ${args.join(' ')}`;
        }
        return true;
      });
    } else {
      return true;
    }
  } catch (err) {
    log('red', '这里发生了错误', err)
    return false;
  }
}

const doWorkWithLoading = async (text, cb, ...args) => {
  const spinner = ora(text);
  spinner.start();
  try {
    const res = await cb(...args);
    spinner.succeed();
    return { succeed: res || true };
  } catch (err) {
    spinner.fail();
    return { fail: err };
  }
};

const downloadTemplate = async (origin, cache) => {
  const { fail } = await doWorkWithLoading('正在加载模板...', downloadGitRepo, origin, cache);
  if (fail) return (log('red', '下载模板失败') || false);
  return (log('green', '模板下载成功') || true);
}

module.exports = {
  log,
  executeCommand,
  downloadTemplate,
  doWorkWithLoading,
}
