const { promisify } = require('util');
const metalsmith = require('metalsmith'); // 遍历文件夹的
const { render } = require('consolidate').ejs; // 模板引擎的集合
const ejsRender = promisify(render);
const renamer = require('metalsmith-renamer');

// 还要处理 tsx中的<>以及样式文件
const reactGenerator = async (origin, dest, CUSTOM_OPTIONS) => {
  const TEMP_CUSTOM_OPTIONS = Object.assign({}, CUSTOM_OPTIONS);
  TEMP_CUSTOM_OPTIONS.style && (TEMP_CUSTOM_OPTIONS.style === 'stylus' && (TEMP_CUSTOM_OPTIONS.style = 'styl'));
  TEMP_CUSTOM_OPTIONS.style && (TEMP_CUSTOM_OPTIONS.style === 'sass' && (TEMP_CUSTOM_OPTIONS.style = 'scss'));
  const { visualization = '', style } = TEMP_CUSTOM_OPTIONS;
  return await new Promise((res, rej) => {
    metalsmith(__dirname) // 第一个参数没有用
      .source(origin) // 所以需要传个source 传了source之后 上面传的那个路径就没用了
      .destination(dest) // 输出的目的地
      .ignore(['node_modules', '.git'])
      .use((files, metal, done) => {
        // 干掉不需要的文件 临时办法 之后再改成更auto
        if (visualization === 'D3') {
          delete files['src/echarts.img.tsx'];
          delete files['src/echarts.tsx'];
          delete files['src/index.tsx'];
          delete files['src/service/index.tsx'];
          delete files['src/components/train-process/index.tsx'];
          delete files['src/components/train-process/training-process-tab.tsx'];
          delete files['src/components/train-process/index.css.ejs'];
          delete files['src/components/train-process/conf/auc.tsx'];
          delete files['src/components/train-process/conf/axis.tsx'];
          delete files['src/components/train-process/conf/logloss.tsx'];
        } else if (visualization === 'Echarts') {
          delete files['src/d3-widget.tsx'];
          delete files['src/index.tsx'];
        } else if (visualization === null) {
          delete files['src/echarts.img.tsx'];
          delete files['src/echarts.tsx'];
          delete files['src/d3-widget.tsx'];
          delete files['src/service/index.tsx'];
          delete files['src/components/train-process/index.tsx'];
          delete files['src/components/train-process/training-process-tab.tsx'];
          delete files['src/components/train-process/index.css.ejs'];
          delete files['src/components/train-process/conf/auc.tsx'];
          delete files['src/components/train-process/conf/axis.tsx'];
          delete files['src/components/train-process/conf/logloss.tsx'];
        }
        done();
      })
      .use(renamer({
        // 把预置的d3或者echarts的example重命名
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
        // 处理webpack中的样式预处理语言的配置
        Object.entries(files).forEach(async ([ fileName, file ]) => {
          if (fileName === 'config/webpack/webpack.config.ejs') {
            const content = file.contents.toString();
            const res = await ejsRender(content, TEMP_CUSTOM_OPTIONS);
            file.contents = Buffer.from(res); // 它会自动输入到目录下的
          }
        });
        done();
      })
      .use((files, metal, done) => {
        // 修改tsx文件中引入的样式文件后缀
        Object.entries(files).forEach(async ([ fileName, file ]) => {
          if (fileName.includes('.tsx')) {
            const content = file.contents.toString();
            if (content.includes('<%')) {
              const res = await ejsRender(content, TEMP_CUSTOM_OPTIONS);
              file.contents = Buffer.from(res);
            }
          }
        });
        done();
      })
      .use((files, metal, done) => {
        // 根据使用者传进来的style修改样式文件内容
        Object.entries(files).forEach(async ([ fileName, file ]) => {
          if (fileName.includes('.css.ejs')) {
            const content = file.contents.toString();
            const res = await ejsRender(content, TEMP_CUSTOM_OPTIONS);
            file.contents = Buffer.from(res);
          }
        });
        done();
      })
      .use(renamer({
        // 把webpack配置文件中的ejs和样式文件的ejs后缀都干掉
        filesToRename: {
          pattern: '**',
          rename: (name) => {
            if (name.includes('.ejs')) {
              if (name.includes('.js')) return name.replace('.ejs', '');
              if (name.includes('.css')) return name.replace('.css.ejs', `.${style}`);
              return name.replace('.ejs', '.js');
            }
            return name;
          }
        }
      }))
      .use((files, metal, done) => {
        Object.entries(files).forEach(async ([ fileName, file ]) => {
          if (fileName === 'package.json' || fileName.includes('.js') || fileName.includes('.json')) {
            const content = file.contents.toString();
            if (content.includes('<%')) {
              // 说明是个模板引擎
              const res = await ejsRender(content, TEMP_CUSTOM_OPTIONS);
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

module.exports = reactGenerator;
