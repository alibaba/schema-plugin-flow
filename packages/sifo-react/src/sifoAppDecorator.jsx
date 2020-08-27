import React from 'react';
import T from 'prop-types';
import cls from 'classnames';
import SifoModel from '@schema-plugin-flow/sifo-model';
import SifoLogger from './modelPlugins/logger';
import renderFactory from './utils/render-factory';
import { getRegisteredItems } from './utils/singleton-utils';
import presetPlugins, { baseOrderPlugins } from './modelPlugins';
import PluginResetter from './modelPlugins/PluginResetter';

const FragmentContainer = props => {
  const fragmentId = props['data-sifo-fragment'];
  return <div {...props} data-sifo-fragment={fragmentId} />;
};
FragmentContainer.propTypes = {
  'data-sifo-fragment': T.string.isRequired
};
const SifoAppContainer = () => null;
class Decorator extends React.Component {
  static propTypes = {
    namespace: T.string.isRequired,
    components: T.object.isRequired,
    initProps: T.object.isRequired,
    // schema: T.object.isRequired,
    fragments: T.array,
    plugins: T.array,
    externals: T.object,
    modelApiRef: T.func,
    getModelPluginArgs: T.func,
    openLogger: T.bool,
  };

  static defaultProps = {
    fragments: [],
    plugins: [],
    externals: {},
    modelApiRef: () => { },
    openLogger: false,
    getModelPluginArgs: () => ([]),
  };
  constructor(props) {
    super(props);
    this.state = {
      refreshKey: 0,
    };
    this.refreshTimer = undefined;
    const {
      namespace, fragments = [], components, openLogger, initProps,
      plugins, getModelPluginArgs, externals, modelApiRef
    } = props;
    const schema = {
      component: 'SifoAppContainer',
      id: namespace,
      attributes: {
        initProps
      },
      children: [
        {
          component: 'FragmentContainer',
          id: '$sifo-header',
          attributes: {
            'data-sifo-fragment': '$sifo-header'
          },
          children: []
        },
        {
          component: 'FragmentContainer',
          id: '$sifo-footer',
          attributes: {
            'data-sifo-fragment': '$sifo-footer'
          },
          children: []
        },
        ...fragments.map(fragment => {
          if (!fragment) return null;
          if (typeof fragment === 'string') {
            return {
              component: 'FragmentContainer',
              id: fragment,
              attributes: {
                'data-sifo-fragment': fragment
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
    const { plugins: customPlugins, components: customComps } = getRegisteredItems(namespace);
    const combinedPlugins = [...baseOrderPlugins].concat(
      plugins,
      customPlugins,
      ...presetPlugins,
      { modelPlugin: PluginResetter },
    );
    if (openLogger) {
      combinedPlugins.push({ modelPlugin: SifoLogger });
    }
    const combinedComponents = {
      ...components,
      ...customComps,
      FragmentContainer,
      SifoAppContainer
    };
    const modelOptions = {
      components: combinedComponents,
      modelApiRef: mApi => {
        this.mApi = mApi;
        if (modelApiRef) {
          modelApiRef(mApi);
        }
      },
      externals: { ...externals, initProps, fragments },
      getModelPluginArgs: (id, info) => {
        if (id === 'plugin_reset_model_plugin') {
          return [{ openLogger }];
        }
        if (getModelPluginArgs) {
          return getModelPluginArgs(id, info);
        }
        return [];
      }
    };
    this.sifoModel = new SifoModel(
      namespace,
      this.refresh,
      schema,
      combinedPlugins,
      modelOptions
    );
    this.sifoModel.run();
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
      addEventListener: (name, func, ...arg) => {
        // 被修饰对象不暴露context，以减少对原方法的侵入
        const middleFunc = (e, ...other) => func(...other);
        this.mApi.addEventListener(namespace, name, middleFunc, ...arg);
        const handler = this.mApi.getAttributes(namespace)[name];
        return handler;
      },
      getFragment: key => {
        // 按节点id获取片段
        const item = this.mApi.getSchema().children.find(child => child.id === key);
        if (!item) return null;
        item.attributes['data-sifo-fragment'] = key; // 防止插件覆盖
        return renderFactory(item, combinedComponents);
      }
    };
  }
  componentDidMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.sifoModel.destroy();
    this.sifoModel = null;
    this.mApi = null;
    this.sifoApp = null;
  }
  update = callback => {
    this.setState({
      refreshKey: this.state.refreshKey > 1000 ? 0 : this.state.refreshKey + 1
    }, () => {
      if (callback) callback();
    });
  };
  refresh = callback => {
    clearTimeout(this.refreshTimer);
    if (!this.mounted) {
      this.refreshTimer = setTimeout(() => {
        this.update(callback);
      }, 0);
    } else {
      this.update(callback);
    }
  }
  render() {
    const { sifoApp } = this;
    const headerFragment = sifoApp.getFragment('$sifo-header');
    const footerFragment = sifoApp.getFragment('$sifo-footer');
    const { className, namespace: nameSps } = this.props;
    const namespace = this.mApi ? this.mApi.namespace : nameSps;
    return (
      <div
        key={namespace}
        data-sifo-namespace={namespace}
        className={cls('sifo-react', className)}
      >
        {headerFragment}
        {
          React.Children.map(this.props.children, child => React.cloneElement(
            child,
            {
              sifoApp
            }
          ))
        }
        {footerFragment}
      </div>
    );
  }
}

const sifoAppDecorator = (namespace, otherProps = {}) => Target => {
  const { components = {}, fragments = [] } = otherProps;
  return props => (
    <Decorator
      {...otherProps}
      initProps={{ ...props }}
      namespace={namespace}
      components={components}
      fragments={fragments}
    >
      <Target {...props} />
    </Decorator>
  );
};

export default sifoAppDecorator;
