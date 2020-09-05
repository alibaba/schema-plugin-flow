<template>
  <div class="complex-demo">
    控制实例数: {{count}}
    <button v-bind:style="{ margin: '0 8px' }" v-on:click="count++">add</button>
    <button v-bind:style="{ margin: '0 8px' }" v-on:click="count--">delete</button>
    <sifo-app
      v-for="item in items"
      :key="item.itemNo"
      :namespace="namespace"
      :externals="item"
      class="vue-app"
      :class="{ 'even': item.itemNo%2==0, 'odd': item.itemNo%2==1 }"
      :plugins="plugins"
      :schema="schema"
      :components="components"
      :modelApiRef="modelApiRef"
      :getModelPluginArgs="getModelPluginArgs"
      :openLogger="openLogger"
      :optimize="true"
    />
  </div>
</template>

<script>
import SifoApp from "@schema-plugin-flow/sifo-vue";
import schema from "./schema.json";
import plugins from "./plugins";
import components from './components';
// 实际是独立的js
import "./plugins/extend-in-anotherjs";
export default {
  name: "complex-demo",
  components: { SifoApp },
  data: function(){
    return {
      count: 1,
    };
  },
  beforeCreate: function () {
    const sifoAppProps = {
      namespace: "complex-sifo-demo",
      plugins,
      components,
      schema,
      openLogger: true,
    };
    Object.keys(sifoAppProps).forEach(key=>{
      this[key]=sifoAppProps[key];
    });
  },
  methods: {
    modelApiRef: (api) => {
      console.log("root mApi ref: ", api);
    },
    getModelPluginArgs: () => {
      return [];
    },
  },
  computed: {
    items: function () {
      let result = [];
      for (let i = 1; i <= this.count; i++) {
        result.push({
          itemNo: i,
          itemTitle: 'title'
        });
      }
      return result;
    },
  },
  props: {},
};
</script>

<style>
</style>
