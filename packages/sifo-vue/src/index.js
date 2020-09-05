import SifoModel from '@schema-plugin-flow/sifo-model';
import SifoLogger from './modelPlugins/logger';
import renderFactory from './utils/render-factory';
import { getRegisteredItems } from './utils/singleton-utils';
import presetPlugins, { baseOrderPlugins } from './modelPlugins';
import PluginResetter from './modelPlugins/PluginResetter';
import VueOptimize from './modelPlugins/VueOptimize';
/* eslint-disable func-names, object-shorthand */
const SifoApp = {
  name: 'sifo-app',
  beforeCreate: function () {
    const {
      namespace, schema, components: comps,
      plugins, externals, modelApiRef: mApiRef, openLogger = false, getModelPluginArgs,
      optimize = false
    } = this.$options.propsData || {};
    const {
      plugins: customPlugins, components: customComps, openLogger: showLogger = false
    } = getRegisteredItems(namespace);
    const combinedComps = Object.assign({}, comps, customComps);
    // 注册局部组件
    // 不能替换原对象 this.$options.components = { ...combinedComps };
    Object.keys(combinedComps).forEach(name => {
      this.$options.components[name] = combinedComps[name];
    });
    this.refreshCallback = [];
    const combinedPlugins = [...baseOrderPlugins].concat(
      plugins,
      customPlugins,
      ...presetPlugins,
      { modelPlugin: PluginResetter },
    );
    if (openLogger || showLogger) {
      combinedPlugins.push({ modelPlugin: SifoLogger });
    }
    if (optimize) {
      combinedPlugins.push({ modelPlugin: VueOptimize });
    }
    const modelOptions = {
      components: combinedComps,
      modelApiRef: mApi => {
        this.mApi = mApi;
        if (mApiRef) {
          mApiRef(mApi);
        }
      },
      externals,
      getModelPluginArgs: (id, info) => {
        if (id === 'plugin_reset_model_plugin') {
          return [{ openLogger: openLogger || showLogger, needOptimize: optimize }];
        }
        if (id === 'sifo_vue_model_plugin') {
          return { sifoVueInstance: this };
        }
        if (getModelPluginArgs) {
          return getModelPluginArgs(id, info);
        }
        return [];
      }
    };
    const refreshApi = callback => {
      // 触发Vue的变更监听以重渲染
      this.renderCount = this.renderCount > 1000 ? 0 : this.renderCount + 1;
      this.refreshCallback.push(callback);
    };
    this.sifoMode = new SifoModel(
      namespace,
      refreshApi,
      schema,
      combinedPlugins,
      modelOptions
    );
    // store vue node instance when need optimize
    this.sifoAppNodesMap = [];
  },
  created: function () {
  },
  beforeMount: function () {
  },
  mounted: function () {
    this.sifoMode.run();
  },
  updated: function () {
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been re-rendered
      this.invokeRefreshCallback();
    });
  },
  destroyed: function () {
    this.sifoMode.destroy();
    this.sifoMode = null;
    this.mApi = null;
    this.renderSchema = {};
    this.sifoAppNodesMap = null;
  },
  // 把内部属性放到这里
  data: function () {
    return {
      renderCount: 0
    };
  },
  methods: {
    invokeRefreshCallback: function () {
      if (this.refreshCallback && this.refreshCallback.length > 0) {
        const callbacks = this.refreshCallback;
        this.refreshCallback = [];
        callbacks.forEach(callback => {
          callback();
        });
      }
    }
  },
  render: function (createElement) {
    const schema = this.mApi ? this.mApi.getSchema() : {};
    const namespace = this.mApi ? this.mApi.namespace : this.namespace;
    return createElement(
      'div',
      {
        class: 'sifo-vue',
        attrs: {
          'data-sifo-namespace': namespace,
          'data-sifo-render-count': this.renderCount
        }
      },
      [
        renderFactory(schema, createElement, this.sifoAppNodesMap, this.optimize)
      ]
    );
  },
  props: {
    schema: {
      type: Object,
      required: true
    },
    namespace: {
      type: String,
      required: true
    },
    plugins: {
      type: Array
    },
    components: {
      type: Object,
    },
    externals: {
      type: Object,
    },
    modelApiRef: {
      type: Function
    },
    openLogger: {
      type: Boolean
    },
    getModelPluginArgs: {
      type: Function
    },
    optimize: {
      type: Boolean
    }
  }
};

export default SifoApp;
