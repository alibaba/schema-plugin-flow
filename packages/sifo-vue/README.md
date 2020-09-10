# sifo-vue

sifo-vue 是组装了[sifo-model](../sifo-model)、[sifo-singleton](../sifo-singleton) 的一个 Vue 组件。      

sifo-vue 以 sifo-model 为内核，使用插件式的开发模式，为页面提供了多级定制与扩展能力。包含但不限于：页面结构的修改、渲染组件的替换、组件属性的变更、组件事件的监听与阻断等。结合不同的模型插件，可以实现更加丰富的特定功能。

## SifoApp (sifo-vue) Props

参数          | 说明        | 类型 | 是否必传 | 默认值
-------------|-------------|-----|-----|-----
namespace    | 命名空间，这是一个功能集合的主要标识，第三方将根据命名空间来进行功能扩展     | string | 是 | - |
schema       | schema，描述了页面结构      | object | 是 | - |
components | 组件，引入局部组件时传入，全局组件不需传 | object | 否 | {} |
plugins      | 插件，分为模型插件、页面插件和组件插件         | array：[{ componentPlugin, pagePlugin, modelPlugin }, { modelPlugin: otherModelPlugin }] | 否 | [] |
externals | 任意其它信息 | object | 否 | {} |
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

## attributes

| 属性名            | 类型               | 默认值             | 描述       |
| ---------------- | -----------------------| --------------------- | ---------------------------------------------------------------------------------------------------|
| muteRenderOptimizeMark     | bool            |       false        |    当节点上此属性为true时，该节点不受渲染优化标记的控制，按照普通渲染模式渲染，但仍然受父组件的渲染与否影响   |

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
如果一个页面是用 sifo 开发的，开发者可以在不接触原始代码的情况下，对页面进行扩展。这里用到了 [sifo-singleton](../sifo-singleton) 全局扩展容器，只要在目标页面渲染前载入了扩展插件、组件，扩展功能就会在目标页面上生效。

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

## 示例
* ![插件示例](https://img.alicdn.com/tfs/TB1HOQYe6MZ7e4jSZFOXXX7epXa-1264-698.gif)