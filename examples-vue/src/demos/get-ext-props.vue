<template>
  <div>
    <button @click="onClick">点击更新extProps</button>
    <p>value:{{ test }}/other:{{ extProps.other }}</p>
    <sifo-app
      :namespace="namespace"
      class="get-ext-props-demo"
      :plugins="plugins"
      :components="components"
      :schema="schema"
      :openLogger="openLogger"
      :sifoExtProps="extProps"
    />
    <div>for decorator
      <decorator-test :sifoExtProps="extProps" />
    </div>
  </div>
</template>

<script>
import SifoApp from "@schema-plugin-flow/sifo-vue";
import TestDecorator from '../demos/test-decorator.js';
// register local components
const components = {
  Container: {
    template: "<div><slot></slot></div>",
  },
  Show: {
    functional: true,
    render: function (createElement, context) {
      const { props } = context;
      const { content, mApi } = props;
      const extProps = mApi.getSifoExtProps();
      console.log("getSifoExtProps in : ", extProps);
      return createElement("h2", {}, [content]);
    },
    props: ["content", "mApi"],
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
      component: "Show",
      id: "show_id",
      attributes: {
        content: "show",
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
const componentPlugin = {
  test_btn_id: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, "click", (context, e) => {
        const extProps = mApi.getSifoExtProps();
        console.log("getSifoExtProps: ", extProps);
      });
    },
  },
  show_id: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        mApi,
      });
    },
  },
};
const plugins = [{ componentPlugin: componentPlugin }];
export default {
  name: "get-ext-props",
  components: { SifoApp, 'decorator-test': TestDecorator },
  beforeCreate: function () {
    const sifoAppProps = {
      namespace: "get-ext-props",
      plugins: plugins,
      components,
      schema,
      openLogger: true,
    };
    Object.keys(sifoAppProps).forEach((key) => {
      this[key] = sifoAppProps[key];
    });
  },
  data: function () {
    return {
      test: Math.random().toString().substr(3, 8),
    };
  },
  computed: {
    extProps: function () {
      return {
        value: this.test,
        other: Math.random().toString().substr(3, 8),
      };
    },
  },
  methods: {
    onClick: function () {
      this.test = Math.random().toString().substr(3, 8);
    },
  },
};
</script>