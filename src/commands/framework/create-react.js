const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const inquirer = require('inquirer'); // 控制台文交互的
const {
  log,
  generator,
  executeCommand,
  downloadTemplate,
  doWorkWithLoading,
} = require('../../utils');
const { GIT_API: { GIT_REACT_TEMPLATE }, CACHE_DIRECTORY } = require('../../constants');

const FORCE_DOWNLOAD = [
  {
    type: 'list',
    message: '检测到您本地已经存在该模板缓存, 是否重新下载(会覆盖之前的版本)',
    name: 'isDownload',
    default: "否",
    choices: [ "是", "否" ],
    filter: val => val === '是',
  }
];




// const installDependence = async (dest, { visualization, style }) => {
//   console.log('这里的地址是', visualization, style);
//   log('green', '正在安装依赖');
//   // const npm = await executeCommand('npm', ['install'], dest);
//   // console.log('这里的npm是', npm)
//   const npm = true;
//   if (!npm) return log('red', '安装依赖失败');
//   if (style) {
//     log('green', `正在安装${style}`);

//     log('red', `安装${style}失败`);
//   }
//   if (visualization) {
//     log('green', `正在安装${visualization}`);

//     log('red', `安装${visualization}失败`);
//   }
// }

const FRAMEWORK = 'REACT_TEMPLATE';
const REACT_TEMPLATE_CACHE_PATH = path.join(CACHE_DIRECTORY, FRAMEWORK);
const CURRENT_PATH = path.join(process.cwd());
const createReactWidget = async ({ name, author, visualization, style }) => {
  const CURRENT_WIDGET_PATH = path.join(CURRENT_PATH, name);
  const CUSTOM_OPTIONS = { widgetName: name, widgetAuthor: author, visualization };
  if (!fs.existsSync(REACT_TEMPLATE_CACHE_PATH)) {
    // 不存在该地址
    const isSucceed = await downloadTemplate(GIT_REACT_TEMPLATE, REACT_TEMPLATE_CACHE_PATH);
    if (isSucceed) {
      const isSucceed = await generator(REACT_TEMPLATE_CACHE_PATH, CURRENT_WIDGET_PATH, CUSTOM_OPTIONS);
      console.log('这里的成败是', isSucceed);
      if (!isSucceed) return log('red', '生成模板发生意外而终止');
      installDependence(CURRENT_WIDGET_PATH, { visualization, style });
    }
    else log('red', '下载模板失败, 原因未知');
  } else {
    const { isDownload } = await inquirer.prompt(FORCE_DOWNLOAD);
    if (isDownload) await downloadTemplate(GIT_REACT_TEMPLATE, REACT_TEMPLATE_CACHE_PATH);
    // const isSucceed = await generator(REACT_TEMPLATE_CACHE_PATH, CURRENT_WIDGET_PATH, CUSTOM_OPTIONS);


    const isSucceed = await generator('/Users/dingyubo/Desktop/my-cli/ding-cli-test', '/Users/dingyubo/Desktop/my-cli/ding-test', CUSTOM_OPTIONS);
    if (!isSucceed) return log('red', '生成模板发生意外而终止');
    installDependence(CURRENT_WIDGET_PATH, { visualization, style });
  }
}

module.exports = createReactWidget;
