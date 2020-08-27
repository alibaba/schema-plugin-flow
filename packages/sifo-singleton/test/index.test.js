// 引入基础依赖
import { expect } from 'chai'; // 断言库
import SifoModel from '@schema-plugin-flow/sifo-model';
import test_schema from './schema.json';
import SifoSingleton from '../lib';

// 测试描述语法参照 mocha 官方文档 https://mochajs.org/

const singleton_comp_plg = {
  subject: {
    onComponentInitial: (params) => {
      console.log('pppppppppppppppp')
      const { mApi, event } = params;
      mApi.addEventListener(event.key, 'onChange', (params) => {
        singleton_fired = true;
        console.log('--------singleton', params.event);
      });
    },
  }
}
let singleton_fired = false;
let singleton_count = 0;
describe('===================start===================', () => {
  let mApi = null;
  let namespace = 'test';
  const singleton = new SifoSingleton('test');
  singleton.registerItem('single1', () => {
    return {
      version: '1.2.0',
      plugins: [{
        componentPlugin: singleton_comp_plg
      }, {
        pagePlugin: {
          onPageInitial: params => {
            console.log('singleton1 page plugin')
          }
        },
      }],
      components: {
        test: 'ss'
      }
    }
  });

  //singleton.registerComponentPlugin(singleton_comp_plg);
  const singleton2 = new SifoSingleton('test');// 应该指向同一个对象
  singleton2.registerItem('single2', (props) => {
    console.log('singleton get props', props);
    return {
      version: '1.1.0',
      plugins: [
        {
          pagePlugin: {
            onPageInitial: params => {
              singleton_count++;
              console.log('singleton2 page plugin')
            }
          },
          componentPlugin: singleton_comp_plg
        }
      ],
      components: {
        Input: () => { }
      }
    }
  })
  let refreshApi = (callback) => { console.log('refresh'); callback() },
    externals = {},
    schema = test_schema,
    //plugins = [singleton.getRegisteredPlugins()],// 传singleton 应该也要拿到singleton2注册的plgs;
    //components = Object.assign({}, singleton.getRegisteredComponents()),
    modelApiRef = (api) => { console.log('api'); mApi = api; };
  const singletonItems = singleton.getRegisteredItems({ getParams: 'testssss' });
  const result = {
    plugins: [],
    components: {},
  };
  console.log('singletonItems:', singletonItems)
  singletonItems.forEach(registerItem => {
    const { components = {} } = registerItem;
    let { plugins = [] } = registerItem;
    if (!Array.isArray(plugins)) {
      plugins = [plugins];
    }
    // 这段逻辑不应该在这里管，逻辑越少，兼容性越好
    const validatedPlugins = plugins.map(plg => {
      const vplg = {};
      // 只支持页面和组件插件
      if (plg.pagePlugin) {
        vplg.pagePlugin = plg.pagePlugin;
      }
      if (plg.componentPlugin) {
        vplg.componentPlugin = plg.componentPlugin;
      }
      return vplg;
    });
    result.plugins = [...result.plugins, ...validatedPlugins];
    result.components = { ...result.components, ...components };
  });
  const { plugins, components } = result;
  let modelOptions = { externals, components, modelApiRef };
  const sifoModel = new SifoModel(
    namespace,
    refreshApi,
    schema,
    plugins,
    modelOptions);
  singleton_count = 0;
  sifoModel.run();
  let schemaNode = mApi.getSchema();
  it('should count correctly', () => {
    expect(mApi).to.be.a('object');
    console.log('mApi', mApi);
    const subjectNode = schemaNode.children[0];
    // singleton onchange 绑定
    expect(subjectNode.attributes.onChange).to.be.a('function');
    singleton_fired = false;
    subjectNode.attributes.onChange("123");// 模仿输入onchange
    expect(singleton_fired).to.equal(true);
    expect(singleton_count).to.equal(1);
    const comps = mApi.getComponents();
    console.log('----------=========+++++++++++++', comps);
    expect(comps['Input']).to.be.a('function');
    console.log('schema', JSON.stringify(schemaNode));
  });
});
