const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer'); // 控制台文交互的
const reactGenerator = require('./react-generator');
const {
  log,
  executeCommand,
  downloadTemplate,
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

const installDependence = async (dest, { visualization, style }) => {
  log('green', '正在安装依赖...');
  const npm = await executeCommand('npm', ['install'], dest);
  if (!npm) return (log('red', '安装依赖失败') || false);
  if (style !== 'css') {
    log('green', `正在安装${style}`);
    const dep = ['install', '--save-dev'];
    if (style === 'less') dep.push('less', 'less-loader');
    else if (style === 'sass') dep.push('sass-loader', 'node-sass');
    else if (style === 'stylus') dep.push('stylus-loader', 'stylus');
    const sty = await executeCommand('npm', dep, dest);
    if (sty) log('green', `安装${style}完毕`);
    else return (log('red', `安装${style}失败`) || false);
  }
  if (visualization) {
    log('green', `正在安装${visualization}`);
    const dep = ['install', '--save'];
    if (visualization === 'D3') dep.push('d3', '@types/d3');
    else if (visualization === 'Echarts') dep.push('echarts', '@types/echarts', 'echarts-for-react');
    const visual = await executeCommand('npm', dep, dest);
    if (visual) log('green', `安装${visualization}完毕`);
    else return (log('red', `安装${visualization}失败`) || false);
  }
  return true;
}

const FRAMEWORK = 'REACT_TEMPLATE';
const REACT_TEMPLATE_CACHE_PATH = path.join(CACHE_DIRECTORY, FRAMEWORK);
const CURRENT_PATH = path.join(process.cwd());
const createReactWidget = async ({ name, author, visualization, style }) => {
  const CURRENT_WIDGET_PATH = path.join(CURRENT_PATH, name);
  const CUSTOM_OPTIONS = { widgetName: name, widgetAuthor: author, visualization, style };
  if (!fs.existsSync(REACT_TEMPLATE_CACHE_PATH)) {
    // 不存在该地址
    const isSucceed = await downloadTemplate(GIT_REACT_TEMPLATE, REACT_TEMPLATE_CACHE_PATH);
    if (isSucceed) {
      const isSucceed = await reactGenerator(REACT_TEMPLATE_CACHE_PATH, CURRENT_WIDGET_PATH, CUSTOM_OPTIONS);
      if (!isSucceed) return log('red', '生成模板发生意外而终止');
      const depInstalled = await installDependence(CURRENT_WIDGET_PATH, { visualization, style });
      if (!depInstalled) return;
    }
    else log('red', '下载模板失败, 原因未知');
  } else {
    const { isDownload } = await inquirer.prompt(FORCE_DOWNLOAD);
    if (isDownload) await downloadTemplate(GIT_REACT_TEMPLATE, REACT_TEMPLATE_CACHE_PATH);
    const isSucceed = await reactGenerator(REACT_TEMPLATE_CACHE_PATH, CURRENT_WIDGET_PATH, CUSTOM_OPTIONS);

    // const isSucceed = await reactGenerator('/Users/dingyubo/Desktop/my-cli/temporary', CURRENT_WIDGET_PATH, CUSTOM_OPTIONS);
    if (!isSucceed) return log('red', '生成模板发生意外而终止');
    // return
    const depInstalled = await installDependence(CURRENT_WIDGET_PATH, { visualization, style });
    if (!depInstalled) return;
    log('green', '依赖安装完成');
    log('green', `您可以执行 cd ./${name} 以进入项目`);
    log('green', '进入项目执行 npm run start 即可开始编写react的widget');
  }
}

module.exports = createReactWidget;
