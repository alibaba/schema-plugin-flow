# sifo-vue

sifo-vue 是组装了[sifo-model](https://www.npmjs.com/package/@schema-plugin-flow/sifo-model)、[sifo-singleton](https://www.npmjs.com/package/@schema-plugin-flow/sifo-singleton) 的一个 Vue 组件。      

sifo-vue 以 sifo-model 为内核，使用插件式的开发模式，为页面提供了多级定制与扩展能力。包含但不限于：页面结构的修改、渲染组件的替换、组件属性的变更、组件事件的监听与阻断等。结合不同的模型插件，可以实现更加丰富的特定功能。

* ![插件示例](https://img.alicdn.com/tfs/TB1HOQYe6MZ7e4jSZFOXXX7epXa-1264-698.gif)

## codesandbox.io
* sifo-vue
  * [sifo-vue-quick-start](https://codesandbox.io/s/sifo-vue-quick-start-7668x)    
  * [sifo-vue-decorator](https://codesandbox.io/s/sifo-vue-test-decorator-4b9j4)    
  * [sifo-vue-use-optimize](https://codesandbox.io/s/sifo-vue-use-optimize-4n6nz)    
  * [sifo-mplg-form-antdv](https://codesandbox.io/s/sifo-vue-form-antdv-q4yc4)   

## SifoApp (sifo-vue) Props

参数          | 说明        | 类型 | 是否必传 | 默认值
-------------|-------------|-----|-----|-----
namespace    | 命名空间，这是一个功能集合的主要标识，第三方将根据命名空间来进行功能扩展     | string | 是 | - |
schema       | schema，描述了页面结构      | object | 是 | - |
components | 组件，引入局部组件时传入，全局组件不需传 | object | 否 | {} |
plugins      | 插件，分为模型插件、页面插件和组件插件         | array：[{ componentPlugin, pagePlugin, modelPlugin }, { modelPlugin: otherModelPlugin }] | 否 | [] |
externals | 任意其它信息 | object | 否 | {} |
sifoExtProps | 任意对象，mApi.getSifoExtProps 可以取到即时的值，这点与 externals 相区别 | object | 否 |{}|
modelApiRef | 模型接口外传方法，调用参数为 mApi（接口构建完成时） 或 null（模型销毁时） | function | 否 |
openLogger | 是否在控制台打印出执行日志，不建议在生产环境使用 | bool | 否 | false |
optimize | 是否进行渲染优化，sifo-vue 是 top-down 的渲染模式，在复杂页面可以启用此参数 | bool | 否 | false |
getModelPluginArgs | 获取模型插件实例化时的构造函数参数 | function:(modelPluginId, info) => ([arg1, arg2, ...]) | 否 | | - |
class | 样式类 | vue.class规范 | 否 |  |

## 扩展的 mApi 模型接口

*mApi说明*

| 方法名            | 参数/类型               | 返回值类型             | 描述       |
| ---------------- | -----------------------| --------------------- | ---------------------------------------------------------------------------------------------------|
| getSifoVueInstance     | ✘                      |   VueComponent            |   获取 sifo-vue 的组件实例   |
| getSifoExtProps  | ✘                    |   任意对象            |   获取 SifoApp.sifoExtProps 即时的值   |
| createElement     | (component, attribute, children)                      |   VueComponent            |   vue 的 createElement 方法   |
| renderSlot     | (nodeId, props)                      |   VueComponent            |   渲染作用域插槽的方法 ，将带slot标的指定schema节点（参数nodeId即节点id）渲染成 scopedSlots 中的节点对象，使用方法见后文   |

## attributes

| 属性名            | 类型               | 默认值             | 描述       |
| ---------------- | -----------------------| --------------------- | ---------------------------------------------------------------------------------------------------|
| muteRenderOptimizeMark     | bool            |       false        |    当节点上此属性为true时，该节点不受渲染优化标记的控制，按照普通渲染模式渲染，但仍然受父组件的渲染与否影响   |

## 如何使用
* 项目

  * extend.js
    ```javascript
    import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
    const singleton = new SifoSingleton('quick-start'); // target namespace
    singleton.registerItem('testExtendId', () => {
      return {
        plugins,
        components
      }
    });
    ```

  * app.js
    ```javascript
    const App = {
      template: `
        <sifo-app
          :namespace="namespace"
          class="quick-start-demo"
          :plugins="plugins"
          :components="components"
          :schema="schema"
          :openLogger="openLogger"
        />
      `
    };
    new Vue({
      render: (h) => h(App,
      {
        props: {
          namespace: 'quick-start'
        }
      }
      )
    }).$mount("#app");
    ```

* runtime
  * load extend js
  * load app js

    你应该在 sifoApp 渲染前加载扩展 js 资源

    ```html
    <script src="extend.js"></script>
    <script src="app.js"></script>
    ```


## QuickStart
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

## 外部扩展
如果一个页面是用 sifo 开发的，开发者可以在不接触原始代码的情况下，对页面进行扩展。这里用到了 `sifo-singleton` 全局扩展容器，只要在目标页面渲染前载入了扩展插件、组件，扩展功能就会在目标页面上生效。

```javascript
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
const singleton = new SifoSingleton('quick-start');// 对目标命名空间进行扩展
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

### renderSlot 使用示例
```js
    const CompA = {
      template: `
        <div>
          <slot name="toslot" propa="val1" propb="val2">
        </div>
      `
    };
    const CompSlotItem = {
      template: `
        <div>
          {{ propa }}
          {{ propb }}
        </div>
      `,
      props: ['propa','propb']
    };
```
```js
const schema = {
  component: 'CompA',
  id: 'compa-id',
  children:[
    {
      component: 'CompSlotItem',
      id: 't-slot-id',
      attributes: {
        slot: 'toslot'
      }
    }
  ]
};
mApi.setAttributes('compa-id', {
  scopedSlots: {
    // 有具名插槽时，无名（default）插槽要显式写，否则无法刷新
    toslot: function ({ propa, propb }) {
      return mApi.renderSlot('t-slot-id', { propa, propb });
    }
  }
})
```

## sifoAppDecorator
为一个组件追加扩展能力时，可用修饰器方式。sifoAppDecorator 第一个参数是命名空间，第二个参数与上文的“SifoApp参数”一致（namespace 和 schema 除外）。此外还增加了如下参数：

参数          | 说明        | 类型 | 是否必传 | 默认值
-------------|-------------|-----|-----|-----
fragments    | 片段列表。片段可以只定义一个id，通过 getFragment 方法获取片段来渲染；也可以传一个 schema，以 schema 的第一层 id 来标识  | array | 否 | - |

被 sifoAppDecorator 修饰的组件，props 中将出现 sifoApp 对象，对象包含 addEventListener、 watch、getFragment 等方法和 mApi 接口。

### sifoAppDecorator 示例
下面的示例包含：
* 修饰 TestDecorator 组件，并返回修饰后的 App 组件；
* App 组件标注命名空间为 test-sifo-decorator；
* TestDecorator 组件向外暴露 click 事件，扩展件就可以监听与干预这些事件；
* TestDecorator 注册了 updateData、getData 观测，扩展件可以发布相应观测消息来与 App 通信；
* TestDecorator 定义了 $dynamic_panel, $static_panel 片段，以使扩展件可以在页面指定位置渲染内容。
完整示例请参照[这里](https://github.com/alibaba/schema-plugin-flow/blob/master/examples-vue/src/demos/test-decorator.js)

1. 对TestDecorator组件加修饰
```js
import { sifoAppDecorator } from "@schema-plugin-flow/sifo-vue";
import TestDecorator from './test-decorator-target.vue';
//
const componentPlugin = {
  'test-sifo-decorator': {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'click', (ctx, ...arg) => {
        console.log('decorator: clicked', ctx, arg);
      });
    }
  }
};
const plugins = [{ componentPlugin }];
const App = sifoAppDecorator('test-sifo-decorator', {
  externals: { aa: 1 },
  plugins,
  fragments: ['$dynamic_panel', '$static_panel'],
  class: "decorator-test",
  openLogger: false
})(TestDecorator);
export default App;
```
2. TestDecorator 组件
```js
<template>
  <div>
    <div>
      <span>count：{{ count }}</span>
      <button v-bind:style="{ margin: '4px 8px' }" v-on:click="count++">
        add count
      </button>
    </div>
    <div>
      <button v-bind:style="{ margin: '4px 0' }" @click="click">
        fire click method
      </button>
    </div>
    <div>
      不传参片段：
      <component v-bind:is="staticFragment"></component>
    </div>
    <div>
      动态传参数片段：
      <component v-bind:is="getDynamicFragment()"></component>
    </div>
  </div>
</template>
//
<script--xxx-->
// this is the Vue Component who will be decorated.
const TestDecorator = {
  name: "decorator-test",
  components: {},
  data: function () {
    return {
      count: 0,
      staticFragment: this.sifoApp.getFragment("$static_panel"),
    };
  },
  created: function () {
    this.sifoApp.watch("updateData", (ctx, key, val) => {
      if (key === "count") {
        this.count++;
      }
    });
    this.sifoApp.watch("getData", (e, getter) => {
      getter({
        count: this.count,
      });
    });
    // prepose传入true可使事件先于扩展件注册，在希望外部能够覆盖（扩展）内部方法时可使用
    this.clickFn = this.sifoApp.addEventListener("click", (...args) => {
      console.log("target: clicked");
    }, true);
  },
  methods: {
    click: function (...args) {
      // 建议不要直接在模板上绑定clickFn，否则可能带来非预期问题
      this.clickFn(...args);
    },
    getDynamicFragment: function () {
      return this.sifoApp.getFragment("$dynamic_panel", {
        value: `count: ${this.count}`,
      });
    },
  },
  destroyed() {
    console.log("destroyed");
  },
  // declare sifoApp property
  props: ["sifoApp"],
};
export default TestDecorator;
</script--xxx-->
```

3. sifoAppDecorator 下的外部扩展示例
```js
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import { Input, Button } from "ant-design-vue";
//
const customOnChange = (context, e) => {
  const { event, mApi } = context;
  const { key } = event;
  mApi.setAttributes(key, { value: e.target.value + 'extVal' });
}
const pagePlugin = {
  onNodePreprocess: (node, info) => {
    const { id, component } = node;
    if (id === '$sifo-header') {
      return {
        ...node,
        attributes: {
          style: {
            color: "green"
          }
        },
        children: ['这是扩展的header']
      }
    }
    if (id === '$dynamic_panel' || id === '$static_panel') {
      // 将片段直接换成新的组件，这个组件就可以拿到getFragment的参数
      return {
        ...node,
        component: 'Input',
        attributes: {
          ...node.attributes,
          others: {
            ok: false
          }
        }
      }
    }
    if (id === '$sifo-footer') {
      return {
        ...node,
        attributes: {
          style: {
            border: "1px solid green",
            padding: "4px"
          }
        },
        children: [
          {
            component: 'div',
            children: ['这是扩展的footer']
          },
          {
            component: 'Button',
            id: 'updateDataBtn',
            children: ['updateCount']
          }]
      }
    }
    return node;
  },
}
const componentPlugin = {
  'test-sifo-decorator': {
    onComponentInitial: params => {
      const { event, mApi } = params;
      let fcount = 0;
      mApi.addEventListener(event.key, 'click', (context, e) => {
        //context.event.stop();
        console.log('ext: click', context, e);
        mApi.setAttributes('$static_panel', {
          value: `ext click fired: ${++fcount}`
        });
      });
    }
  },
  $dynamic_panel: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'change', customOnChange);
    }
  },
  $static_panel: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'change', customOnChange);
    }
  },
  updateDataBtn: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'click', () => {
        mApi.dispatchWatch('getData', data => {
          console.log('old data:', data);
        });
        mApi.dispatchWatch('updateData', 'count');
      });
    }
  }
};
const singleton = new SifoSingleton('test-sifo-decorator');
singleton.registerItem('ccc', () => {
  return {
    plugins: [
      {
        pagePlugin,
        componentPlugin
      }
    ],
    components: {
      Input, Button
    },
    openLogger: true
  };
});
//
export default singleton;
```