const os = require('os');
const path = require('path');
const inquirer = require('inquirer');
const { log } = require('../utils');

const FRAMEWORK_PROMPT_LIST = [
  {
    type: 'list',
    message: '您想进行哪种框架的组件开发:',
    name: 'framework',
    default: "React",
    choices: [
      "React组件",
      "Vue组件",
      "Angular组件",
    ],
    filter: val => val.replace('组件', ''),
  }
];

const WIDGET_INFO_PROMPT_LIST = [
  {
    type: 'input',
    message: '请设置项目名称:',
    name: 'name',
    default: 'my-component',
  },
  {
    type: 'input',
    message: '请输入作者:',
    name: 'author',
    default: os.userInfo().username,
  },
  {
    type: 'list',
    message: '使用哪种可视化库',
    name: 'visualization',
    default: null,
    choices: [
      "D3",
      "Echarts",
      "不使用",
    ],
    filter: val => val === '不使用' ? null : val,
  }
];

const start = async (args) => {
  const { framework } = await inquirer.prompt(FRAMEWORK_PROMPT_LIST);
  log('green', `您选择了${framework}`);
  const { name, author, visualization } = await inquirer.prompt(WIDGET_INFO_PROMPT_LIST);
  log(
    'green',
    ` Widget的名字是 ${name}\n`,
    `Widget的作者是 ${author}\n`,
    `Widget将 ${visualization ? `使用${visualization}` : '不使用可视化工具' }`
  );
  try {
    require(path.join(__dirname, 'framework', `create-${framework}`))({name, author, visualization});
  } catch (err) {
    console.log('发生了错误', err);
  }
}

module.exports = start;
