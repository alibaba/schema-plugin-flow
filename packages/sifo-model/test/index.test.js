// 引入基础依赖
import { expect } from 'chai'; // 断言库
import SifoModel from '../lib/index';
//import SifoModel from '../src';
import test_schema from './schema.json';
import test_plugins from './plugins';
import formModelPlugin from './modelPlugin/formModelPlugin';
import optimizeModelPlg from './modelPlugin/reactOptimizeModelPlugin';
import SifoSingleton from './singleton';

// 测试描述语法参照 mocha 官方文档 https://mochajs.org/
let test_Handler_listen = false;
const subjectChangeHandler = (params, ...arg) => {
  const { event, mApi } = params;
  test_Handler_listen = true;
  console.log('+++++++++++subject test change handle', arg);
}
let singleton_fired = false;

describe('===============model init empty schema=================', () => {
  let mApi = null;
  let namespace = 'test01',
    refreshApi = (callback) => { callback() },
    externals = { initValue: 'value' },
    components = {},
    modelApiRef = (api) => { console.log('mapi ref'); mApi = api; },
    modelOptions = {
      externals,
      components,
      modelApiRef,
    };
  const sifoModel = new SifoModel(
    namespace,
    refreshApi,
    {},// schema
    [],//plugins,
    modelOptions);
  sifoModel.run();
  let schemaNode = mApi.getSchema();
  it('should count correctly', () => {
    expect(mApi).to.be.a('object');
    console.log('empty schema', JSON.stringify(schemaNode));
    // empty setAttributes
    mApi.setAttributes('test', 'a');
    const a = mApi.getAttributes('test');
    expect(a).to.equal(undefined);
    // getExternals
    const externals = mApi.getExternals();
    expect(externals.initValue).to.equal('value');
  })
});

describe('===================model init===================', () => {
  let mApi = null;
  let namespace = 'test';
  const singleton = new SifoSingleton('test');
  singleton.registerPlugin('modelPlugin', {
  });
  singleton.registerPlugin('componentPlugin', {
    subject: {
      onComponentInitial: (params) => {
        console.log('singleton11111111')
        const { mApi, event } = params;
        mApi.watch('subject', (c, x) => {
          console.log('watch singleton subject-----', x);
        })
        mApi.addEventListener(event.key, 'onChange', (context, ...arg) => {
          singleton_fired = true;
          console.log('--------singleton', context.event.getOldAttributes(event.key).value);
        });
      },
    }
  });
  console.log('optimizeModelPlg.ID', optimizeModelPlg.ID);
  let modelPluginArgs = null;
  let argsProvider = null;
  let refreshApi = (callback) => { console.log('!!!!!!refresh'); callback() },
    externals = {},
    schema = test_schema,
    plugins = [
      test_plugins,
      test_plugins,
      singleton.getRegisteredPlugins(),
      { modelPlugin: optimizeModelPlg },
      { modelPlugin: optimizeModelPlg },
      {
        modelPlugin: {
          plugin: formModelPlugin,
          argsProvider: (id, info) => { 
            argsProvider = 'get';
            console.log('argsProvider', id, info)
            return "this is form mplg args"
          }
        }
      }
    ],
    components = {},
    modelApiRef = (api) => { console.log('api ref', api); mApi = api; },
    modelOptions = {
      externals,
      components,
      modelApiRef,
      getModelPluginArgs: (id, info) => {
        console.log('getModelPluginArgs:', id, info);
        modelPluginArgs = 'test';
        return 'test';
      }
    };
  const sifoModel = new SifoModel(
    namespace,
    refreshApi,
    schema,
    plugins,
    modelOptions);
  sifoModel.run();
  let schemaNode = mApi.getSchema();
  it('should count correctly', () => {
    expect(sifoModel.model.rendered).to.equal(true);
    const tempInst = sifoModel.model.schemaInstance;
    expect(tempInst).to.not.equal(undefined);
    tempInst.loopDown((node) => {
      console.log('loopDown node false:', node.id);
      if (node.id === 'subject111' || node.id === 'test04') throw new Error('loop return false should stop loop');
      if (node.id === 'test03') return false;
    })
    tempInst.loopDown((node) => {
      console.log('loopDown node continue:', node.id);
      if (node.id === 'subject111') throw new Error('loop return continue should not loop down');
      if (node.id === 'test03') return 'continue';
    })
    expect(mApi).to.be.a('object');
    expect(modelPluginArgs).to.eql('test');
    expect(argsProvider).to.eql('get');
    //console.log('mApi', mApi);
    //console.log('getSchema', JSON.stringify(schemaNode));
    const schemaNode2 = schemaNode.children[0];
    const subjectNode = schemaNode2.children[0];
    const test02Node = schemaNode2.children[1];
    // 通用 onchange 绑定
    expect(subjectNode.attributes.onChange).to.be.a('function');
    expect(subjectNode.attributes.onTest).to.be.a('function');
    expect(test02Node.attributes.onChange).to.be.a('function');
    // hasListener
    const hasListener = mApi.hasEventListener('subject', 'onChange');
    expect(hasListener).to.equal(true);
    const hasevent = mApi.hasEventListener('not_id_test', "onChange");
    expect(hasevent).to.equal(false);
    // abnormal event key
    let eventKeyTest = 'subject';
    const objKey = { id: 'subject', valueOf: () => "subject", toString: () => 'subject', eventKey:'otherKey' };
    mApi.addEventListener(objKey, 'ontest', (ctx) => {
      console.log('eventKeyTest', ctx.event.key)
      eventKeyTest = ctx.event.key;
    })
    expect(mApi.getAttributes('subject').ontest).to.be.a('function');
    mApi.getAttributes('subject').ontest();
    expect(eventKeyTest).to.be.equal('otherKey');
    // abnormal event key api
    mApi.addEventListener(null, 'testKey', () => { });
    mApi.addEventListener({}, 'testKey', () => { });
    mApi.addEventListener([], 'testKey', () => { });
    mApi.addEventListener(123, 'testKey', () => { });
    mApi.hasEventListener(null, 'testKey');
    mApi.hasEventListener({}, 'testKey');
    mApi.hasEventListener([], 'testKey');
    mApi.hasEventListener(123, 'testKey');
    mApi.watch(null, () => { });
    mApi.watch({}, () => { });
    mApi.watch([], () => { });
    mApi.watch(123, () => { });
    // watch payloads
    let watchedFirst = false;
    let watchedSecond = false;
    mApi.watch('testpayloads', (ctx, first, second) => {
      watchedFirst = first;
      watchedSecond = second;
    });
    mApi.dispatchWatch('testpayloads', true, true);
    expect(watchedFirst).to.equal(true);
    expect(watchedSecond).to.equal(true);
    // watch attributes and oldState
    mApi.setAttributes('subject', { testforold: '1' });
    let updateval = '';
    let oldval = '';
    mApi.watch('subject', (ctx, update, old) => {
      updateval = update.testforold;
      oldval = old.testforold;
    });
    mApi.setAttributes('subject', { testforold: '2' });
    expect(updateval).to.equal('2');
    expect(oldval).to.equal('1');
    // addEventListener
    mApi.addEventListener('subject', 'onChange', subjectChangeHandler);
    test_Handler_listen = false;
    singleton_fired = false;
    subjectNode.attributes.onChange("33123");// 模仿输入onchange
    expect(test_Handler_listen).to.equal(true);//如果test.plugin应该被stop了，不应该走
    // singleton
    expect(singleton_fired).to.equal(true);
    // 插件onchange赋值
    expect(subjectNode.attributes.value).to.equal('onchange插件赋值');
    // removeEventListener
    mApi.removeEventListener('subject', 'onChange', subjectChangeHandler);
    test_Handler_listen = false;
    subjectNode.attributes.onChange("++++++subject handler should removed");
    expect(test_Handler_listen).to.equal(false);// 测试remove
    // setAttributes
    mApi.setAttributes('subject', { value: '111' });
    expect(subjectNode.attributes.value).to.equal('111');
    // optimize setAttributes
    let tempMark = subjectNode.attributes.__renderOptimizeMark__;
    expect(test02Node.attributes.__renderOptimizeMark__).not.equal(tempMark);
    //console.log('schema------:', JSON.stringify(mApi.getSchema()))
    //因为watch了subject,内会set test04两次，test03一次, test05两次
    let testXMark = mApi.getAttributes('test05').__renderOptimizeMark__
    expect(testXMark).to.equal(schemaNode.attributes.__renderOptimizeMark__);
    console.log('test05:', mApi.getAttributes('test05').test05)
    expect(mApi.getAttributes('test05').test05).to.equal(53);
    // forceRefresh
    mApi.forceRefresh();
    tempMark = subjectNode.attributes.__renderOptimizeMark__;
    //console.log('test02 vs root after forcerefresh')
    expect(test02Node.attributes.__renderOptimizeMark__).to.equal(tempMark);
    expect(tempMark).to.equal(schemaNode.attributes.__renderOptimizeMark__);
    // replaceComponent
    mApi.replaceComponent('test02', "Select1");
    const compName = mApi.getComponentName('test02');
    expect(compName).to.equal("Select1");
    // middleware return
    const middleValue = mApi.formatFunc('formatFunc');
    expect(middleValue).to.equal("formatFunc");
    //console.log('schema setted', JSON.stringify(mApi.getSchema()));
    // queryNodeIds
    const ids = mApi.queryNodeIds("component==Input");
    console.log('ids:', ids);
    expect(ids.length).to.equal(5);
    const ids1 = mApi.queryNodeIds("attributes.dataType==text");
    console.log('ids1:', ids1);
    expect(ids1.length).to.equal(6);
    const ids2 = mApi.queryNodeIds(node => { console.log('ttt:', node.id, node.childrenIds); return node.component == 'Input' });
    console.log('ids2:', ids2);
    expect(ids2.length).to.equal(5);
    const ids3 = mApi.queryNodeIds("component==Input", "loopDown", 'test03');
    console.log('ids3:', ids3);
    expect(ids3.length).to.equal(2);
    const ids4 = mApi.queryNodeIds("component==Input", "loopUp", 'test03');
    console.log('ids4:', ids4);
    expect(ids4.length).to.equal(1);
    const ids5 = mApi.queryNodeIds("attributes.rules.required==true");
    console.log('ids5:', ids5);
    expect(ids5.length).to.equal(3);
    const ids6 = mApi.queryNodeIds("__parentId__==test03");
    console.log('ids6:', ids6);
    expect(ids6.length).to.equal(1);
    const oldmApi = mApi;
    oldmApi.setGlobalData('reloadtest', 1);
    console.log('reloadpagerrrrrrrrrr')
    mApi.reloadPage();
    // reloadpage 有 setTimeout
    setTimeout(() => {
      console.log('after reload')
      const oldData = oldmApi.getGlobalData('reloadtest');
      expect(oldData).to.equal(1);
      const shouldNull = mApi.getGlobalData('reloadtest');
      expect(shouldNull).to.not.equal(1);
      expect(oldmApi === mApi).to.equal(false);
      setTimeout(() => {
        sifoModel.destroy();
        console.log('after destroy: mApi ', mApi);
      }, 100);
    }, 0);
  });
});
