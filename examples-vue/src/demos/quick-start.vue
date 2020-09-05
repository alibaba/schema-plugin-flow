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

<script>
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
</script>