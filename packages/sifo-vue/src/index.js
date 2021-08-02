/**
 * @author FrominXu
 */
import SifoModel from '@schema-plugin-flow/sifo-model';
import SifoLogger from './modelPlugins/logger';
import renderFactory from './utils/render-factory';
import { getRegisteredItems } from './utils/singleton-utils';
import presetPlugins, { baseOrderPlugins } from './modelPlugins';
import PluginResetter from './modelPlugins/PluginResetter';
import VueOptimize from './modelPlugins/VueOptimize';
import sifoAppDecorator from './sifoAppDecorator';

/* eslint-disable func-names, object-shorthand */
const SifoApp = {
  name: 'sifo-app',
  beforeCreate: function () {
    this.refreshCallback = [];
    this.sifoRendered = false;
    // store vue node instance when need optimize
    this.sifoAppNodesMap = {};
    const {
      namespace, schema, components: comps,
      plugins, externals, modelApiRef: mApiRef, openLogger = false, getModelPluginArgs,
      optimize = false
    } = this.$options.propsData || {};
    const {
      plugins: customPlugins, components: customComps, openLogger: showLogger = false
    } = getRegisteredItems(namespace);
    const combinedComps = Object.assign({}, comps, customComps);
    const combinedPlugins = [...baseOrderPlugins].concat(
      plugins,
      customPlugins,
      ...presetPlugins,
      {
        modelPlugin: {
          plugin: PluginResetter,
          argsProvider: () => {
            return [{ openLogger: openLogger || showLogger, needOptimize: optimize }];
          }
        }
      }
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
      if (this.sifoRendered) {
        this.renderCount = this.renderCount > 1000 ? 0 : this.renderCount + 1;
      }
      // 未sifoRendered时，将在mounted后调用callback
      this.refreshCallback.push(callback);
    };
    this.sifoMode = new SifoModel(
      namespace,
      refreshApi,
      schema,
      combinedPlugins,
      modelOptions
    );
    // 将执行放到此处，使模型插件的componentWrap方法可生效
    this.sifoMode.run();
    const wrappedComponents = this.mApi.getComponents();
    // 注册局部组件，在此处执行可获取到包装后的组件
    // 不能替换原对象 this.$options.components = { ...combinedComps };
    Object.keys(wrappedComponents).forEach(name => {
      this.$options.components[name] = wrappedComponents[name];
    });
  },
  created: function () {
  },
  beforeMount: function () {
  },
  mounted: function () {
    // this.sifoMode.run();
    this.sifoRendered = true;
    // 由于sifoMode.run提前执行了，这里需要触发一次以使afterRender周期执行
    this.invokeRefreshCallback();
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
    const components = this.mApi ? this.mApi.getComponents() : {};
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
        renderFactory(schema, createElement, components, this.sifoAppNodesMap, this.optimize)
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
    },
    sifoExtProps: {
      type: Object,
    }
  }
};

export { sifoAppDecorator };
export default SifoApp;
