# sifo-model 
## 前端插件管理模型
schema plugins management model

Sifo Model 是一个前端插件管理模型，以schema为基本数据结构，以三类插件：模型插件、页面插件、组件插件组合来实现特定功能。每类插件皆可串联多个，可灵活进行功能扩展。

## SifoModel 类

*SifoModel实例化参数*

参数          | 说明        | 类型 | 是否必传 | 默认值
-------------|-------------|-----|-----|-----
namespace    | 命名空间     | string | 是 | - |
refreshApi   | 刷新执行接口， 参数为callback，如有，应在刷新完成后回调 | function | 是 | - |
schema       | schema      | object | 是 | - |
plugins      | 插件         | array：[{ componentPlugin, pagePlugin, modelPlugin }, { modelPlugin: otherModelPlugin }] | 是 | - |
modelOptions | 模型选项，详情见参数说明 | object | 否 | - |


### modelOptions参数说明

参数 | 说明 | 类型 | 是否必传 | 默认值
-----|-----|-----|-----|-----
externals | 任意外部信息 | object | 否 | {} |
components | 组件 | object | 否 | {} |
modelApiRef | 模型接口外传方法，调用参数为 mApi（接口构建完成时） 或 null（模型销毁时） | function: mApi => void | 否 | - |
getModelPluginArgs | 获取模型插件实例化时的构造函数参数, 构造参数也可在传入 modelPlugin 时提供, 见后文 argsProvider | function:(modelPluginId, info) => ([arg1, arg2, ...]) | 否 | - |

> 代码示例
```javascript
import SifoModel from '@schema-plugin-flow/sifo-model';
//
const plugins = [
  { componentPlugin, pagePlugin, modelPlugin: ModelPluginA }, 
  {
    modelPlugin: {
      plugin: ModelPluginB,
      argsProvider: (mId, info) => {
        return [arg1, arg2];
      }
    }
  }
];
const refreshApi = (callback) => {
  // do refresh
  callback(); 
};
const modelApiRef = (mApi) => {};
const modelOptions = {
  modelApiRef,
};
const sifoModel = new SifoModel(
    namespace,
    refreshApi,
    schema,
    plugins,
    modelOptions);
// 运行
sifoModel.run();
// do something ...
// 销毁
sifoModel.destroy();
```

## schema 格式规范
```javascript
{
  "id": "id001",// 节点唯一标识，不可重复，插件都是以此id进行节点区分。
  "component": "Container",
  "attributes": {
    "label": "L001"
  },
  "children": [
    {
      "component": "Container",
      "attributes": {
        "id": "id002",// 如节点id未定义，将尝试使用此id。只在实例化时取一次。
        "rules": {}
      },
      "children": [
        {
        }
      ]
    }
  ]
}
```

## 模型生命周期与插件生命周期方法
模型在实例化后，调用实例的 `run` 方法触发生命周期执行。插件可按需注册生命周期方法，每个生命周期方法后的【】标注表示其在整个模型生命周期上的执行次序，方法详情见下文。一般来说，生命周期方法的参数为：
*`params:{ mApi, event }`*
其中 `mApi` 是模型接口，详细说明见下文。
      
在模型销毁前，调用实例的 `destroy` 方法将先后触发页面插件和模型插件的 `onDestroy` 生命周期方法，插件可在此时进行一些数据清除等操作。

* `render`：【12】说明：非显式方法，模型渲染，调用的是实例化参数 refreshApi方法。

#### componentPlugin 组件插件
  *type: object*
  * `onComponentInitial`:【9】说明：组件初始化
  * `afterPageRender`: 【15】说明：页面渲染后, 这时组件一般（不能保证）已经渲染

> 代码示例
```javascript
const changeHandler = (context, value, ...args) => {
  const { event, mApi } = context;
  const { key, eventName, next, stop, getAttributes } = event;
  const newValue = value + 'test';
  // event.getOldAttributes(key);// 获取操作前的属性
  // mApi.getAttributes(key);
  mApi.setAttributes(key,{
    value: newValue,
    label: "testLabel",
  });
  event.next(newValue, ...args);//修改对后续插件的入参
  // event.stop();//阻止后续插件的执行
};
const componentPlugin = {
  // 为id为subject的schema节点注册组件插件
  subject:{
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        label:'test',
      });
      mApi.addEventListener(event.key, 'onChange', changeHandler);
      mApi.watch(event.key,(ctx, updates, oldState)=>{
        // updates 是触发观测的变更，oldState是变更前的状态
      });
    },
    afterPageRender: params => {
      const { event, mApi } = params;
    }
  }
}
```

#### pagePlugin 页面插件
  *type: object*
  * `onNodePreprocess`:【2】说明： 对节点动态修改
  * `onPageInitial`:【8】说明：页面初始化
  * `beforeRender`:【10】说明：渲染前
  * `afterRender`:【14】说明：渲染后
  * `onDestroy`: 【17】 说明：`destroy` 被调用时触发

> 代码示例
```javascript
const watchSubject = ({ mApi, event }, changes) => {
  mApi.setAttributes('test', {
    checked: changes.isTest === true
  });
};
const pagePlugin = {
  onNodePreprocess: (node, informations) => {
    return node;
  },
  onPageInitial: params => {
    const { event, mApi } = params;
    // do something...
  },
  beforeRender: params => {
    const { event, mApi } = params;
  },
  afterRender: params => {
    const { event, mApi } = params;
    // do something...
    mApi.watch('setTestWatch',(ctx, payload1, payload2)=>{
      console.log('自定义watch', payload1, payload2); // { watchdata: '1111' }, "other"
    });
    setTimeout(() => {
      mApi.dispatchWatch('setTestWatch', { watchdata: '1111' }, "other");
    }, 0);
    mApi.watch('subject', watchSubject);
  },
  onDestroy: parmas => {
    // do something
  }
};
```

#### modelPlugin 模型插件
  *type: class*
  * `onModelInitial`:【1】 说明：非显式方法，等同于new modelPlugin
  * `onNodePreprocess`:【3】说明： 对schema预处理
  * `onComponentsWrap`: 【4】说明：组件包装
  * `onSchemaInstantiated`:【5】 说明：schema实例化
  * `onModelApiCreated`: 【6】说明：模型接口创建，仅在此周期内能够修改mApi接口
  * `onModelApiReady`: 【7】说明：mApi 装饰完成
  * `onReadyToRender`:【11】 说明：即将进行渲染
  * `afterRender`:【13】说明：渲染后
  * `onDestroy`: 【17】 说明：`destroy` 被调用时触发

> 代码示例
```javascript
class modelPlugin {
  // 用来标识模型插件身份
  static ID = 'xxx_model_plugin';
  constructor(props) {
    const { test } = props;// 从getModelPluginArgs来
    this.schemaInstance = null;
    this.mApi = null;
  }
  onNodePreprocess = (node, informations) => {
    const { instanceId, namespace, externals } = informations;
    return node;
  }
  onComponentsWrap = components => {
    return wrappedComponents;
  }
  onSchemaInstantiated = params => {
    const { event } = params;
    const { schemaInstance } = event;
    // 将实例保存起来
    this.schemaInstance = schemaInstance;
    // 从id节点（传id时）或根节点向下层遍历
    this.schemaInstance.loopDown((node) => {
        if ('test' === node.id) {
          node.marked = true;
          // ...
          return false;// 返回false，则不再继续遍历
        };
        if(node.id === 'endNode'){
          return 'continue';// 返回 continue，则不再沿此分支上继续遍历，但依然遍历兄弟分支
        }
      }[, id]);
    // 从id节点向根节点遍历
    this.schemaInstance.loopUp((node)=>{},id);
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    const { applyModelApiMiddleware } = event;
    // 定义setAttributes中间件
    const setAttrsMiddleware = next => (...args) => {
      console.log('modeltest: setAttributes in mApi');
      // do something ...
      return next(...args);
    }
    // 对mApi的setAttributes方法进行再组装
    applyModelApiMiddleware('setAttributes', setAttrsMiddleware);
    // 为mApi新增formatFunc方法
    applyModelApiMiddleware('formatFunc', (next, isEnd) => value => {
      console.log('modeltest: formatFunc in mApi', this.mApi.testFunc, args);
      let formatValue = value;
      if (invalidate(value)){
        // 是最后一个方法
        if (isEnd) {
          return 'invalidate';
        }
      } else {
        formatValue = format(value);
      }
      return next(formatValue);
    });
  }
  onModelApiReady = params => {
    const { mApi, event } = params;
  }
  onReadyToRender = params => {
    const { mApi, event } = params;
  }
  afterRender = params => {}
  onDestroy = parmas => {
    // do something
  }
}
```

使用示例
```javascript
const plugins = [
  {
    modelPlugin: ModelPluginA,
    pagePlugin: {}
  },
  {
    modelPlugin: {
      plugin: ModelPluginB,
      // 提供实例化构造参数
      argsProvider: (mId, info) => {
        return [arg1, arg2];
      }
    }
  }
]
```

## 生命周期关系图
![生命周期说明图](https://img.alicdn.com/imgextra/i2/O1CN01M2rVnq1I73QoQX4sD_!!6000000000845-2-tps-1554-2466.png)

## mApi 模型接口

*mApi说明*

| 方法名            | 参数/类型               | 返回值类型             | 描述       |
| ---------------- | -----------------------| --------------------- | ---------------------------------------------------------------------------------------------------|
| namespace        | ✘                      | string              | 命名空间，非方法      |
| instanceId       | ✘                      | string              | 模型实例Id，非方法      |
| getExternals     | ()                     | object              | 获取externals数据      |
| getGlobalData    | ([key: string])        | object              | 获取存储在key值下的数据对象，globalData是一个公共数据容器                                                                       |
| setGlobalData    | (key: string, value)   | ✘                   | 存储一个指定key的数据对象 |
| getAttributes    | (id: string)           | object              | 获取指定节点的属性（`attributes`）值，若 schema 中无对应id，则返回`undefined`    |
| setAttributes    | (id: string, attributes: object [, refreshImmediately: bool = true]) | instanceOf(Promise) | 设置指定id节点的 `attributes` ，`refreshImmediately` 表示是否立即刷新，默认为true, 批量设置属性时建议传入false,在设置完后调用refresh接口批量刷新 |
| replaceComponent | (id: string, componentName: string) | ✘      | 更换schema上标识的渲染组件名      |
| getComponentName | (id: string) | string|undefined      | 获取指定id的渲染组件名      |
| queryNodeIds | (selector: string/Function, direction?: 'loopDown'/'loopUp', startId?: string) | string[]      | 按指定条件查询 schema 节点 id 列表， selector 格式如："component==Input"、 "attributes.rules.required==true"、 node => (node.component == 'Input')； direction 遍历方向，默认 loopDown； startId 遍历的起始节点 id，loopDown 时默认从根节点开始    |
| addEventListener | (id: string, eventName: string, handler: function [, prepose: bool = false]) | ✘      | 组件注册监听事件，详细说明见下文 |
| removeEventListener | (id: string, eventName: string, handler: function [, prepose: bool = false]) | ✘      | 组件注销监听事件     |
| hasEventListener | (id: string, eventName: string) | bool      | 对指定组件事件是否有进行监听     |
| watch | (key: string, handler: function) | ✘      | 注册观测事件，一般用于观测指定id节点(key参数)的属性变化，也可用于自定义观测，详细说明见下文 |
| removeWatch | (key: string, handler: function) | ✘      | 注销观测     |
| dispatchWatch | (key: string [, payload1: any, payload2: any, ...]) | ✘      | 分发观测事件，只允许对自定义观测进行分发，节点属性变化由setAttributes分发     |
| reloadPage       | (object?: { [externals] [, schema] [, plugins] [, components] })    | ✘        | 创建新实例，重新加载页面，reloadPage 将重跑所有生命周期。               |
| refresh          | ()                     | instanceOf(Promise) | 强制刷新页面，一般是在批量更新了节点属性后调用 |
| getInitialSchema | ()                     | object              | 获取初始schema        |
| getSchema        | ()                     | object              | 获取渲染时schema       |
| getComponents    | ()                     | object              | 获取渲染时components     |

## mApi 附加说明
* `addEventListener`：
  * 优先级高于普通属性，即注册的监听事件会覆盖相应eventName的普通属性。
  * prepose 参数表示是否将事件注册前置，即先于非前置注册的事件触发，默认不前置，同一级别内遵循先注册先触发原则。移除事件监听时 prepose 参数需要与注册时的 prepose 参数相一致。
  * event handler 的参数第一位是`context`，context包含`event`和`mApi`。context后是事件原始参数，依照原始参数顺序排列。
  * event.key 是 addEventListener 的对象 id（即id参数）。
  * event.getOldAttributes(id) 可获取事件开始执行前指定id的属性。mApi.getAttributes 可获取事件执行到当前时，指定id的属性。要特别指出的是，event handler 内直接用 mApi.getAttributes 得到的属性不能保证是最终属性，如果需要获取事件执行结束后的最终属性（因为事件监听方法后可能还有其它插件注册了事件监听），可在 mApi.setAttributes(...).then 等异步方法回调内实现。
  * event.getUpdatedStates() 可获取事件执行到当前时，所有发生过更新的节点属性。
  * event.next(...args) 可修改对后续插件的入参（不包含context），无修改时不需调用。
  * event.stop() 将阻止后续插件的执行。
  * 有些事件需要返回值，可以在事件后直接 return 返回值，event.eventReturnValue 记录前一个插件事件（如有）的返回值。

* `watch`：
  * watch 一般用于观测指定 id 节点(即key参数)的属性变化，也可用于自定义观测。此处的观测应与 `addEventListener` 的组件事件监听相区别：组件事件触发源是相应的 `component`，而观测事件触发源是 mApi.dispatchWatch 或 mApi.setAttributes 。
  * watch 本质上是一种特殊的 EventListener，其 event handler 与 `addEventListener` 的 event handler 完全一致，相应参数说明与注意事项请参照上文。
  * event handler 的事件原始参数，在观测属性变化时，参数分别是`相应id节点属性的变更`和`变更前的属性`；在自定义观测时，是 dispatchWatch 传的参数。
  * event.key 是 watch 的对象名，即观测的节点 id 或自定义观测的事件名。
  * mApi.dispatchWatch 分发观测事件，只允许对自定义观测进行分发，节点属性变化由 setAttributes 分发。在串联插件的 event handler 中引起的属性变化，是在所有 event handler 执行完成后用最终变化状态进行事件分发。
  * 在 event handler 中执行 setAttributes 时，应注意避免引起循环触发。同时也要注意不应滥用 watch，否则将增加状态维护的复杂度。
