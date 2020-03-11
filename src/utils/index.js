const chalk = require('chalk');
const ora = require('ora');
const execa = require('execa');
const { promisify } = require('util'); // 把异步处理成promise的
const downloadGitRepo = promisify(require('download-git-repo')); // 下载repo的
const metalsmith = require('metalsmith'); // 遍历文件夹的
const { render } = require('consolidate').ejs; // 模板引擎的集合
const ejsRender = promisify(render);
const renamer = require('metalsmith-renamer');

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

// 下一步该进行安装依赖以及安装可视化库了

const generator = async (origin, dest, CUSTOM_OPTIONS) => {
  const { visualization } = CUSTOM_OPTIONS;
  return await new Promise((res, rej) => {
    metalsmith(__dirname) // 第一个参数没有用
      .source(origin) // 所以需要传个source 传了source之后 上面传的那个路径就没用了
      .destination(dest) // 输出的目的地
      .use(renamer({
        filesToRename: {
          pattern: 'src/**',
          rename: (name) => {
            if (visualization === 'D3' && name === 'd3-widget.tsx') {
              return 'index.tsx';
            } else if (visualization === 'Echarts' && name === 'echarts.tsx') {
              return 'index.tsx';
            }
            return name;
          }
        }
      }))
      .use((files, metal, done) => {
        if (visualization === 'D3') {
          delete files['src/echarts.img.tsx'];
          delete files['src/echarts.tsx'];
        } else if (visualization === 'Echarts') {
          delete files['src/d3-widget.tsx'];
        } else if (visualization === null) {
          delete files['src/echarts.img.tsx'];
          delete files['src/echarts.tsx'];
          delete files['src/d3-widget.tsx'];
        }
        done();
      })
      .use((files, metal, done) => {
        Object.entries(files).forEach(async ([fileName, file]) => {
          if (fileName === 'package.json') {
            const content = file.contents.toString();
            if (content.includes('<%')) {
              // 说明是个模板引擎
              const res = await ejsRender(content, CUSTOM_OPTIONS);
              // 把处理完的结果替换一下
              file.contents = Buffer.from(res); // 它会自动输入到目录下的
            }
          }
        });
        done();
      })
      .build(err => err ? rej(false) : res(true));
  });
}

module.exports = {
  log,
  generator,
  executeCommand,
  downloadTemplate,
  doWorkWithLoading,
}

