
const GIT_REPOS = 'https://api.github.com/users/y805939188/repos';
// const GIT_REACT_TEMPLATE = 'https://api.github.com/repos/y805939188/unstable_react_widget_template';
const GIT_REACT_TEMPLATE = 'github.com:y805939188/unstable_react_widget_template';
const GIT_REACT_TEMPLATE_PD4 = 'github.com:y805939188/unstable_react_widget_template#master-pd4';
const GIT_VUE_TEMPLATE = '';
const GIT_ANGULAR_TEMPLATE =  '';

// 一般模板下载完了之后对其做一个缓存
const CACHE_DIRECTORY = `${process.env[ // 获取当前平台的根目录
  process.platform /** 判断平台 */ === 'darwin' /** mac平台 */ ? 'HOME' : 'USERPROFILE'
]}/.template`;

module.exports = {
  GIT_API: {
    GIT_REPOS,
    GIT_REACT_TEMPLATE,
    GIT_REACT_TEMPLATE_PD4,
    GIT_VUE_TEMPLATE,
    GIT_ANGULAR_TEMPLATE,
  },
  CACHE_DIRECTORY,
};
