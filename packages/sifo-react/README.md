# sifo-react

sifo-react 是组装了[sifo-model](https://www.npmjs.com/package/@schema-plugin-flow/sifo-model)、[sifo-singleton](https://www.npmjs.com/package/@schema-plugin-flow/sifo-singleton) 的一个React组件。      

sifo-react 以 sifo-model 为内核，使用插件式的开发模式，为页面提供了多级定制与扩展能力。包含但不限于：页面结构的修改、渲染组件的替换、组件属性的变更、组件事件的监听与阻断等。结合不同的模型插件，可以实现更加丰富的特定功能。

* ![插件示例](https://img.alicdn.com/tfs/TB1HOQYe6MZ7e4jSZFOXXX7epXa-1264-698.gif)

## codesandbox.io
* sifo-react
  * [sifo-react-quick-start](https://codesandbox.io/s/sifo-react-quick-start-lhmyu)    
  * [sifo-react-decorator](https://codesandbox.io/s/sifo-react-test-decorator-sef79)    
  * [sifo-mplg-form-antd](https://codesandbox.io/s/sifo-react-form-antd-o0hoq)     
  * [sifo-react-mplg-optimize](https://codesandbox.io/s/sifo-react-mplg-optimize-sfmts)  

## SifoApp (sifo-react) Props

参数          | 说明        | 类型 | 是否必传 | 默认值
-------------|-------------|-----|-----|-----
namespace    | 命名空间，这是一个功能集合的主要标识，第三方将根据命名空间来进行功能扩展     | string | 是 | - |
schema       | schema，描述了页面结构      | object | 是 | - |
components | 组件 | object | 是 | {} |
plugins      | 插件，分为模型插件、页面插件和组件插件         | array：[{ componentPlugin, pagePlugin, modelPlugin }, { modelPlugin: otherModelPlugin }] | 否 | [] |
externals | 任意其它信息 | object | 否 | {} |
modelApiRef | 模型接口外传方法，调用参数为 mApi（接口构建完成时） 或 null（模型销毁时） | function | 否 |
openLogger | 是否在控制台打印出执行日志，不建议在生产环境使用 | bool | 否 | false |
getModelPluginArgs | 获取模型插件实例化时的构造函数参数 | function:(modelPluginId, info) => ([arg1, arg2, ...]) | 否 | | - |
className | 样式类 |string | 否 |  |

## QuickStart
下面的例子演示了如何监听一个按钮组件的点击事件，并在点击事件中修改其它组件的属性，同时也演示了多个插件的情形。想了解更多的功能请参考`sifo-model`
```javascript
import React from 'react';
import SifoApp from '@schema-plugin-flow/sifo-react';
// 一些组件
const Container = props => <div {...props} />;
const Slogan = ({ content, ...other }) => <h2 {...other}>{content}</h2>;
const Button = props => <button {...props}>click to change</button>;
// schema 定义了初始的页面结构
const schema = {
  component: "Container",
  id: 'mainId',
  attributes: {},
  children: [
    {
      component: "Slogan",
      id: 'slogan_id',
      attributes: {
        content: 'hello world'
      }
    },
    {
      component: "Button",
      id: 'test_btn_id',
      attributes: {}
    }
  ]
};
// 组件插件可以实现与组件相关的功能
const componentPlugin1 = {
  test_btn_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', (context, e) => {
        mApi.setAttributes('slogan_id', {
          content: 'hello sifo'
        });
      })
    }
  }
};
// 第二个插件
const componentPlugin2 = {
  test_btn_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', () => {
        console.log('test_btn_id clicked!')
      })
    }
  }
};
const components = { Container, Slogan, Button };
const plugins = [
  { componentPlugin: componentPlugin1 },
  { componentPlugin: componentPlugin2 }
];
class App extends React.Component {
  render() {
    return (
      <SifoApp
        className='quick-start'
        namespace='quick-start'
        components={components}
        schema={schema}
        plugins={plugins}
        openLogger={false}
      />
    );
  }
}
export default App;
```

## 外部扩展
如果一个页面是用 sifo 开发的，开发者可以在不接触原始代码的情况下，对页面进行扩展。这里用到了 `sifo-singleton` 全局扩展容器，只要在目标页面渲染前载入了扩展插件、组件，扩展功能就会在目标页面上生效。

```javascript
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
const singleton = new SifoSingleton('test_namespace');// 对目标命名空间进行扩展
// 插件的功能与使用跟前面的示例完全一致
const plugins = [{ pagePlugin, componentPlugin }];
const components = {};
singleton.registerItem('testExtendId', () => {
  return {
    plugins,
    components,
    openLogger: true, 
  }
});
```

## sifoAppDecorator
为一个组件追加扩展能力时，可用修饰器方式。sifoAppDecorator 第一个参数是命名空间，第二个参数与上文的“SifoApp参数”一致（namespace 和 schema 除外）。此外还增加了如下参数：

参数          | 说明        | 类型 | 是否必传 | 默认值
-------------|-------------|-----|-----|-----
fragments    | 片段列表。片段可以只定义一个id，通过 getFragment 方法获取片段来渲染；也可以传一个 schema，以 schema 的第一层 id 来标识  | array | 否 | - |

被 sifoAppDecorator 修饰的组件，props 中将出现 sifoApp 对象，对象包含 addEventListener、 watch、getFragment 等方法和 mApi 接口。

### sifoAppDecorator 示例
下面的示例包含：
* View 组件标注命名空间为 target_namespace；
* View 组件向外暴露 onSubmit、setState、onChange 事件，扩展件就可以监听与干预这些事件；
* View 注册了 getState、setState 观测，扩展件可以发布相应观测消息来与 View 通信；
* View 定义了 $header 片段，以使扩展件可以在页面指定位置渲染内容。

```javascript
import React from 'react';
import { sifoAppDecorator } from '@schema-plugin-flow/sifo-react';
@sifoAppDecorator('target_namespace', {
  fragments: ['$testFragment', innerSchema], 
  components: {},
  plugins: [], 
  openLogger: true
})
class View extends React.Component {
  constructor(props) {
    super(props);
    const { sifoApp } = props;
    this.state = {};
    // 加入事件监听，这些事件实际上是挂在了以当前命名空间为id的schema节点上
    this.onSubmit = sifoApp.addEventListener('onSubmit', this.onSubmit);
    this.setState = sifoApp.addEventListener('setState', this.setState.bind(this));
    this.onChange = sifoApp.addEventListener('onChange', this.onChange, true); // prepose传入true可使事件先于扩展件注册
    // 注册观测任务
    sifoApp.watch('getState', (context, getter) => {
      getter(this.state);
    });
    sifoApp.watch('setState', (context, state) => {
      this.setState({
        ...state
      });
    });
  }
  onSubmit = () => {
    //...
  }
  onChange = () => {
    //...
  }
  render() {
    // 将声明的片段放到指定的位置，扩展插件就可以在相应位置渲染自定义的内容了
    const testFragment = this.props.sifoApp.getFragment('$testFragment');
    return (
      <Comp>
        {testFragment}
      </Comp>
    )
  }
```
sifoAppDecorator 下的扩展示例

```javascript
import React from 'react';
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
// 
const pagePlugin = {
  onNodePreprocess: (node, info) => {
    const { id, component } = node;
    // sifoAppDecorator 内置了 $sifo-header 和 $sifo-footer 两个节点
    if(id==='$sifo-header'){
      return {
        ...node,
        attributes: {},
        children:['this is ext-header']
      }
    }
    if(id==='$sifo-footer'){
      return {
        ...node,
        children:['this is ext-footer']
      }
    }
    if(id==='$testFragment'){
      return {
        ...node,
        children: [
          {
            component: 'Input',
            id: 'custom'
          }
        ]
      }
    }
    return node;
  },
}
const componentPlugin = {
  // 命名空间认作根节点id
  target_namespace: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onSubmit', (context, e) => {
      });
      mApi.addEventListener(event.key, 'onChange', (context, e) => {
        mApi.dispatchWatch('setState', { testState: 'test' })
      });
      mApi.addEventListener(event.key, 'setState', (e, state) => {
        const nextState = {
          ...state,
          customState: new Date().getMilliseconds()
        };
        e.event.next(nextState);
      });
    }
  },
  custom: {
     onComponentInitial: params => {}
  }
};
const singleton = new SifoSingleton('target_namespace');
singleton.registerItem('this_ext_id', () => {
  return {
    plugins: [
      {
        pagePlugin,
        componentPlugin
      }
    ]
  }
});
//
export default {};
```

## 非标准的组件接入
```javascript
const TestComponent = {
  name: "TestNonStandard", // 组件名
  useSifoRenderProxy: true, // 标注组件需要使用代理
  /**
   * 渲染方法
   * target: dom对象
   * props: 属性
   * update: 是否是更新
   * preInstance: 前一个render调用返回的对象（更新时）
   */
  render: (target, props, update, preInstance) => {
    // Svelte 组件
    // if (!update) {
    //   return renderTest(props, props.children, target); // 返回instance
    // } else {
    //   preInstance.update(props);
    //   return preInstance;
    // }
    ReactDOM.render(React.createElement(Demo, props), target); // react
  },
  /**
   * 卸载方法，如果不传，默认调用 ReactDOM.unmountComponentAtNode(target);
   */
  unmount: (target, instance) => {
    // instance.unmount(target);
    ReactDOM.unmountComponentAtNode(target); // react
  }
  /**
   * 渲染类型：normal 指在每次react节点渲染时调用render方法，rerenderKey 指在 props.rerenderKey 变化时才调用render方法，默认为 normal，也可以在 props.rerenderType 中指定渲染类型。
   */
  rerenderType: "normal",// "normal"|"rerenderKey"
}
```

## 模型插件推荐列表
* [React标记渲染优化插件](../sifo-mplg-react-optimize)
