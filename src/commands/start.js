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
    message: '使用哪种样式预处理语言',
    name: 'style',
    default: null,
    choices: [
      'less',
      'sass',
      'stylus',
      '不使用',
    ],
    filter: val => val === '不使用' ? 'css' : val,
  },
  {
    type: 'list',
    message: '使用哪种可视化库',
    name: 'visualization',
    default: null,
    choices: [
      'Echarts',
      'D3',
      '不使用',
    ],
    filter: val => val === '不使用' ? null : val,
  }
];

const start = async (args) => {
  const { framework } = await inquirer.prompt(FRAMEWORK_PROMPT_LIST);
  log('green', `您选择了${framework}`);
  if (framework === 'Vue' || framework === 'Angular') {
    // log('black', `暂时不支持${framework}组件项目的创建`);
    // log('red', `暂时不支持${framework}组件项目的创建`);
    // log('green', `暂时不支持${framework}组件项目的创建`);
    // log('yellow', `暂时不支持${framework}组件项目的创建`);
    // log('blue', `暂时不支持${framework}组件项目的创建`);
    // log('magenta', `暂时不支持${framework}组件项目的创建`);
    // log('cyan', `暂时不支持${framework}组件项目的创建`);
    // log('white', `暂时不支持${framework}组件项目的创建`);
    // log('gray', `暂时不支持${framework}组件项目的创建`);
    // log('grey', `暂时不支持${framework}组件项目的创建`);
    // log('blackBright', `暂时不支持${framework}组件项目的创建`);
    // log('redBright', `暂时不支持${framework}组件项目的创建`);
    // log('greenBright', `暂时不支持${framework}组件项目的创建`);
    return log('yellowBright', `暂时不支持${framework}组件项目的创建`);
    // log('blueBright', `暂时不支持${framework}组件项目的创建`);
    // log('magentaBright', `暂时不支持${framework}组件项目的创建`);
    // log('cyanBright', `暂时不支持${framework}组件项目的创建`);
    // log('whiteBright', `暂时不支持${framework}组件项目的创建`);
  }
  const { name, author, style, visualization } = await inquirer.prompt(WIDGET_INFO_PROMPT_LIST);
  log(
    'green',
    ` Widget的名字是 ${name}\n`,
    `Widget的作者是 ${author}\n`,
    `Widget将 ${style ? `使用${style}` : '不使用样式预处理' }`,
    `Widget将 ${visualization ? `使用${visualization}` : '不使用可视化工具' }`,
  );
  try {
    const isPrd4 = args.find(item => item === '--pd4');
    require(path.join(__dirname, 'framework', `create-${framework}`))({name, author, style, visualization}, isPrd4 && true);
  } catch (err) {
    console.log('发生了错误', err);
  }
}

module.exports = start;
