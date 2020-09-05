---
title: Description
---
## 概要
Sifo 以 `sifo-model` 为内核，以 schema 作为描述页面结构的数据格式，使用插件式的开发模式，可为页面提供灵活的定制与扩展能力。包含但不限于：页面结构的修改、渲染组件的替换、组件属性的变更、组件事件的监听与阻断等。结合不同的模型插件，可以实现更加丰富的功能。    
`sifo-singleton` 是全局扩展容器，各类定制扩展插件、组件统一注册到其中。
`sifo-react` 实现了在 React 框架下对 sifo-model 的封装；  
`sifo-vue` 实现了在 Vue 框架下对 sifo-model 的封装；  

## 技术介绍

### sifo-model
sifo-model 主要包含三个方面：schema、components 和 plugin。
*  schema

schema 描述了页面结构，格式如下：    
```json
{
  "id": "cid001",
  "component": "Container",
  "attributes": {
    "label": "L001"
  },
  "children": [
    {
      "component": "Input",
      "id": "field01",
      "attributes": {
        "rules": {}
      }
    }
  ]
}
```
schema 是以节点来代表每一个分块，每个节点主要包含 id、component、attributes 和 children。其中，id 是节点的唯一标识，插件是以 id 为识别要素； component 是指渲染组件的名称；attributes 是节点的属性；children 代表子节点。
* plugin（插件）

插件包含三类：modelPlugin（模型插件）、pagePlugin （页面插件）和 componentPlugin（组件插件），各类插件在不同的sifo-model生命周期中执行不同的功能，以实现需要的能力。

#### Sifo 生命周期详述
Sifo Model 以生命周期为主线来运行，其生命周期中会执行注册的插件，三类插件分别承载不同范畴的职责。用一个人的神经系统举例，一个页面中，模型插件就像大脑，决定了页面的主要能力，比如一个表单模型插件决定了页面具有表单的能力；页面插件就像是脊髓神经，决定了页面整体上的功能，比如页面的初始数据等；模型插件就像周围神经系统，管理各个部件的属性与运作，比如按钮点击事件等。    
Sifo Model 在执行插件生命周期方法，或组件事件触发时，会在上下文中提供 mApi，这个接口是操作 schema 的主要手段，比如有更改属性的 setAttributes，更改渲染组件的  replaceComponent，追加事件监听的 addEventListener 等。     
* 下图是一个完整的生命周期流程与说明    
![生命周期说明图](https://img.alicdn.com/tfs/TB14NFQhoz1gK0jSZLeXXb9kVXa-1036-1643.png)
#### 使用示例
下面来看一些具体的例子    
例一：拿到 schema 后，在页面中修改 schema。这个可以用页面插件的 onNodePreprocess 实现。
```javascript
const pagePlugin = {
  onNodePreprocess: (node, informations) => {
    const { id, children } = node;
    if (node.id === 'typeId'){
      return {
        ...node,
        children: [
          ...children, 
          {
            id: 'testId',
            component: 'Input',
            attributes: {
              value: 'test'
            }
          }
        ]
      }
    }
    return node;
  }
}
```
例二：在组件初始时注入属性和事件，这个是组件插件的职责了。
```js
const componentPlugin = {
  field01: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        label:'字段标签',
      });
      mApi.addEventListener(event.key, 'onChange', (context, value)=> {
        mApi.setAttributes(event.key, {
          value,
        });
      });
    }
  }
}
 ```
例三：希望给 mApi 扩展或赋加通用能力，比如为 setAttributes 方法打印 log，这个应在模型插件的 onModelApiCreated 中，利用中间件来实现。
```js
class modelPlugin {
  // 用来标识模型插件身份
  static ID = 'xxx_model_plugin';
  constructor(props) {
    this.schemaInstance = null;
    this.mApi = null;
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    const { applyModelApiMiddleware } = event;
    // 定义setAttributes中间件
    const setAttrsMiddleware = next => (...args) => {
      // 增加log打印
      console.log('setAttributes: ', args);
      // 执行setAttributes
      return next(...args);
    }
    applyModelApiMiddleware('setAttributes', setAttrsMiddleware);
  }
}
```
例四：查找所有 Select 组件的节点。
```js
mApi.queryNodeIds('component==Select').forEach(id => {
  mApi.setAttributes(id, {
    // ...
  });
});
```
例五：watch 与 dispatchWatch 注册观测任务与发布任务。如果观测的是一个节点的id，在节点属性发生变化时将收到消息。
```js
// 注册观测任务
mApi.watch('aMessage', (context, msg) => {
  console.log(msg); // > this is a msg
});
// 发布任务
mApi.dispatchWatch('aMessage', 'this is a msg');
```
### sifo-react

sifo-react 是封装了 sifo-model 和 sifo-singleton 的一个 React 组件。

#### 快速上手
下面的例子演示了如何监听一个按钮组件的点击事件，并在点击事件中修改其它组件的属性，同时也演示了多个插件的情形。
```jsx
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
        namespace='quick-test'
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
#### 外部扩展

如果一个页面是用 sifo 开发的，第三方可以在不接触原始页面代码的情况下，对页面进行扩展。这里用到了 sifo-singleton ，只要在目标页面渲染前载入了扩展件，扩展功能就会在目标页面上生效。
```js
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
const singleton = new SifoSingleton('test_namespace');// 对目标命名空间进行扩展
// 插件的功能与使用跟前面的示例完全一致
const plugins = [{ pagePlugin, componentPlugin }];
const components = {};
singleton.registerItem('testExtendId', () => {
  return {
    plugins,
    components,
  }
});
```

#### sifoAppDecorator
为一个组件追加扩展能力时，可用修饰器方式。    
下面的示例包含：
* View 组件标注命名空间为 target_namespace；
* View 组件向外暴露 onSubmit、setState、onChange 事件，扩展件就可以监听与干预这些事件；
* View 注册了 getState、setState 观测，扩展件可以发布相应观测消息来与 View 通信；
* View 定义了 $header 片段，以使扩展件可以在页面指定位置渲染内容。
```js
import { sifoAppDecorator } from '@schema-plugin-flow/sifo-react';
@sifoAppDecorator('target_namespace', { fragments: ['$header', innerSchema], components: {},plugins: [], openLogger: true })
class View extends React.Component {
  constructor(props) {
    super(props);
    const { sifoApp } = props;
    this.state = {};
    this.onSubmit = sifoApp.addEventListener('onSubmit', this.onSubmit);
    this.setState = sifoApp.addEventListener('setState', this.setState.bind(this));
    this.onChange = sifoApp.addEventListener('onChange', this.onChange);
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
    const headerFragment = this.props.sifoApp.getFragment('$header');
    return (
      <Comp>
        {headerFragment}
      </Comp>
    )
  }
```

### sifo-vue
sifo-vue 是封装了 sifo-model 和 sifo-singleton 的一个 Vue 组件。

#### 快速上手
下面的例子演示了如何监听一个按钮组件的点击事件，并在点击事件中修改其它组件的属性，同时也演示了多个插件的情形。想了解更多的功能请参考`sifo-model`
```javascript
<template>
  <sifo-app
    :namespace="namespace"
    class="quick-start-demo"
    :plugins="plugins"
    :components="components"
    :schema="schema"
    :openLogger="openLogger"
  />
</template>
// 注意改为script
<script--xxx-->
import SifoApp from "@schema-plugin-flow/sifo-vue";
// register local components
const components = {
  Container: {
    template: "<div><slot></slot></div>",
  },
  Slogan: {
    template: "<h2>{{content}}</h2>",
    props: ["content"],
  },
  Button: {
    template: `<button @click="$emit('click')">click to change</button>`,
  },
};
// schema 定义了初始的页面结构
const schema = {
  component: "Container",
  id: "mainId",
  attributes: {},
  children: [
    {
      component: "Slogan",
      id: "slogan_id",
      attributes: {
        content: "hello world",
      },
    },
    {
      component: "Button",
      id: "test_btn_id",
      attributes: {},
    },
  ],
};
// 组件插件可以实现与组件相关的功能
const componentPlugin1 = {
  test_btn_id: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, "click", () => {
        mApi.setAttributes("slogan_id", {
          content: "hello sifo",
        });
      });
    },
  },
};
// 第二个插件
const componentPlugin2 = {
  test_btn_id: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, "click", () => {
        console.log("test_btn_id clicked!");
      });
    },
  },
};
const plugins = [
  { componentPlugin: componentPlugin1 },
  { componentPlugin: componentPlugin2 },
];
export default {
  name: "quick-start",
  components: { SifoApp },
  beforeCreate: function () {
    const sifoAppProps = {
      namespace: "quick-start",
      plugins: plugins,
      components,
      schema,
      openLogger: true,
    };
    Object.keys(sifoAppProps).forEach((key) => {
      this[key] = sifoAppProps[key];
    });
  },
};
</script--xxx-->
```

#### 外部扩展
同上文 sifo-react 外部扩展部分

## 附录：
#### [1] 扩展涵盖了几个方面：   
* 页面结构的扩展，以现在流行的组件式分块来说，就是指组件的层级关系是不固定的，或者说是动态的，区别于直接代码 hardcode 组件层级关系。
* 渲染元件的扩展，就是说原先用A组件渲染的位置，可能被替换为用B组件渲染。
* 逻辑的扩展，就是说原先的逻辑可能被覆盖，也可能是添加新的逻辑，或追加事件监听。