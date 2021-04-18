/**
 * @author FrominXu
 */
import SifoModel from '@schema-plugin-flow/sifo-model';
import SifoLogger from './modelPlugins/logger';
import renderFactory from './utils/render-factory';
import { getRegisteredItems } from './utils/singleton-utils';
import { classifyAttributes } from './modelPlugins/utils';
import presetPlugins, { baseOrderPlugins } from './modelPlugins';
import PluginResetter from './modelPlugins/PluginResetter';
import VueOptimize from './modelPlugins/VueOptimize';

const FragmentContainer = {
  functional: true,
  render(createElement, context) {
    const {
      props
    } = context.data;
    const fragmentId = context.data.attrs['data-sifo-fragment'];
    return createElement(
      'div',
      {
        ...context.data,
        props,
        attrs: {
          ...context.attrs,
          'data-sifo-fragment': fragmentId
        }
      },
      context.children
    );
  }
};

/* eslint-disable func-names, object-shorthand */
const SifoAppContainer = {
  render: function () {
    return null;
  }
};
const Decorator = {
  name: 'sifo-app-decorator',
  beforeCreate: function () {
    this.refreshCallback = [];
    this.sifoRendered = false;
    // store vue node instance when need optimize
    this.sifoAppNodesMap = {};
    const {
      namespace, fragments = [], components, openLogger, initProps,
      plugins, getModelPluginArgs, externals, modelApiRef,
      optimize = false,
    } = this.$options.propsData || {};
    this.optimize = optimize;
    const schema = {
      component: 'SifoAppContainer',
      fragmentId: namespace,
      id: namespace,
      attributes: {
        initProps
      },
      children: [
        {
          component: 'FragmentContainer',
          fragmentId: '$sifo-header',
          id: '$sifo-header',
          attributes: {
            attrs: {
              'data-sifo-fragment': '$sifo-header'
            }
          },
          children: []
        },
        {
          component: 'FragmentContainer',
          fragmentId: '$sifo-footer',
          id: '$sifo-footer',
          attributes: {
            attrs: {
              'data-sifo-fragment': '$sifo-footer'
            }
          },
          children: []
        },
        ...fragments.map(fragment => {
          if (!fragment) return null;
          if (typeof fragment === 'string') {
            return {
              component: 'FragmentContainer',
              fragmentId: fragment,
              id: fragment,
              attributes: {
                attrs: {
                  'data-sifo-fragment': fragment
                }
              },
              children: []
            };
          } else if (typeof fragment === 'object' && fragment.component) {
            return fragment;
          }
          return null;
        })
      ]
    };
    const {
      plugins: customPlugins, components: customComps, openLogger: showLogger = false
    } = getRegisteredItems(namespace);
    const combinedPlugins = [...baseOrderPlugins].concat(
      plugins,
      customPlugins,
      ...presetPlugins,
      {
        modelPlugin: {
          plugin: PluginResetter,
          argsProvider: () => {
            return [{ openLogger: openLogger || showLogger }];
          }
        }
      },
    );
    if (openLogger || showLogger) {
      combinedPlugins.push({ modelPlugin: SifoLogger });
    }
    if (optimize) {
      combinedPlugins.push({ modelPlugin: VueOptimize });
    }
    const combinedComponents = {
      ...components,
      ...customComps,
      FragmentContainer,
      SifoAppContainer
    };
    const mApiRef = mApi => {
      this.mApi = mApi;
      if (modelApiRef) {
        modelApiRef(mApi);
      }
      if (!mApi) { this.sifoApp = null; return; }
      // 在reloadPage 后要重置 sifoApp
      this.sifoApp = {
        mApi: this.mApi,
        watch: (key, handler, ...other) => {
          const watchList = (this.mApi.getAttributes(namespace) || {}).sifoAppWatchList || [];
          // 记录被观测的对象
          this.mApi.setAttributes(namespace, {
            sifoAppWatchList: [...watchList, { [key]: handler }]
          }, false);
          this.mApi.watch(key, handler, ...other);
        },
        /**
         * 不向被修饰对象暴露context，以减少对原方法的侵入，若需要context，可使用mApi的addEventListener方法；
         * 此方法在扩展件之后执行，若需要前置，可传入prepose参数
         */
        addEventListener: (name, func, ...arg) => {
          const middleFunc = (e, ...other) => func(...other);
          this.mApi.addEventListener(namespace, name, middleFunc, ...arg);
          const eventHandlers = this.mApi.getAttributes(namespace).on || {};
          const handler = eventHandlers[name];
          return handler;
        },
        // 支持动态传参
        getFragment: (createElement, key, prps = {}) => {
          // 按节点id获取片段
          const item = ((this.mApi.getSchema() || {}).children || [])
            .find(child => child.id === key);
          if (!item) return null;
          // 防止原 schema 的 attributes 被修改
          const renderItem = { ...item };
          // attributes 合并处理，先对prps分类
          const classifyProps = classifyAttributes({}, prps);
          renderItem.attributes = {
            // classifyAttributes 不会返回newAttrs中的on参数，所以要进行一次合并
            ...renderItem.attributes,
            ...classifyProps,
            // 插件 attributes 可以覆盖调用方的 props 参数，所以是作为newAttrs
            ...classifyAttributes(classifyProps, renderItem.attributes, true)
          };
          renderItem.attributes.attrs = {
            ...renderItem.attributes.attrs,
            'data-sifo-fragment': key, // 防止插件覆盖
          };
          const comps = this.mApi ? this.mApi.getComponents() : {};
          return renderFactory(
            renderItem,
            createElement,
            comps,
            this.sifoAppNodesMap,
            this.optimize
          );
        }
      };
    };
    const modelOptions = {
      components: combinedComponents,
      modelApiRef: mApiRef,
      externals: { ...externals, initProps, fragments },
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
    this.sifoModel = new SifoModel(
      namespace,
      refreshApi,
      schema,
      combinedPlugins,
      modelOptions
    );
    this.sifoModel.run();
    const wrappedComponents = this.mApi.getComponents();
    // 注册局部组件，在此处执行可获取到包装后的组件
    // 不能替换原对象 this.$options.components = { ...combinedComps };
    Object.keys(wrappedComponents).forEach(name => {
      this.$options.components[name] = wrappedComponents[name];
    });
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
    if (this.sifoMode) {
      this.sifoMode.destroy();
    }
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
    const { sifoApp, renderChildren, className } = this;
    const injectProps = {
      sifoApp: {
        ...sifoApp,
        getFragment: (...args) => {
          const dynamicComp = {
            functional: true,
            render() {
              return sifoApp.getFragment(createElement, ...args);
            }
          };
          // Vue 的动态组件需要传组件的选项对象
          return dynamicComp;
        }
      }
    };
    const headerFragment = sifoApp.getFragment(createElement, '$sifo-header');
    const footerFragment = sifoApp.getFragment(createElement, '$sifo-footer');
    const { namespace: nameSps } = this;
    const namespace = this.mApi ? this.mApi.namespace : nameSps;
    return createElement(
      'div',
      // 传入了 sifoApp 到被修饰组件，所以需要用instanceId保证实例指向正确
      {
        key: this.mApi.instanceId,
        class: { 'sifo-vue': true, [className]: !!className },
        attrs: {
          'data-sifo-namespace': namespace,
          'data-sifo-render-count': this.renderCount
        }
      },
      [
        headerFragment,
        renderChildren(injectProps),
        footerFragment
      ]
    );
  },
  props: {
    namespace: {
      type: String,
      required: true
    },
    components: {
      type: Object,
    },
    initProps: {
      type: Object,
    },
    // schema: T.object.isRequired,
    fragments: {
      type: Array
    },
    plugins: {
      type: Array
    },
    externals: {
      type: Object,
    },
    modelApiRef: {
      type: Function
    },
    getModelPluginArgs: {
      type: Function
    },
    openLogger: {
      type: Boolean
    },
    renderChildren: {
      type: Function
    },
    className: {
      type: String
    }
  }
};

const sifoAppDecorator = (namespace, otherProps = {}) => Target => {
  const {
    components = {}, fragments = [], plugins = [], class: className
  } = otherProps;
  const sifoAppDecoratorWrap = {
    functional: true,
    render: function (createElement, context) {
      const {
        props
      } = context;
      const renderChildren = injectProps => {
        return createElement(
          Target,
          {
            ...context.data,
            props: {
              ...props,
              ...injectProps,
            }
          },
          context.children
        );
      };
      return createElement(
        Decorator,
        {
          props: {
            ...otherProps,
            initProps: { ...props },
            namespace,
            plugins,
            components,
            fragments,
            className,
            renderChildren
          }
        }
      );
    }
  };
  return sifoAppDecoratorWrap;
};

export default sifoAppDecorator;
