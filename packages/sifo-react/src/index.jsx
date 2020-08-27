/**
 * @author FrominXu
 */
import React, { PureComponent } from 'react';
import T from 'prop-types';
import cls from 'classnames';
import SifoModel from '@schema-plugin-flow/sifo-model';
import SifoLogger from './modelPlugins/logger';
import renderFactory from './utils/render-factory';
import { getRegisteredItems } from './utils/singleton-utils';
import presetPlugins, { baseOrderPlugins } from './modelPlugins';
import PluginResetter from './modelPlugins/PluginResetter';
import sifoAppDecorator from './sifoAppDecorator';

class SifoApp extends PureComponent {
  static propTypes = {
    namespace: T.string.isRequired,
    components: T.object.isRequired,
    schema: T.object.isRequired,
    plugins: T.array,
    externals: T.object,
    modelApiRef: T.func,
    getModelPluginArgs: T.func,
    openLogger: T.bool,
  };

  static defaultProps = {
    plugins: [],
    externals: {},
    modelApiRef: () => { },
    openLogger: false,
    getModelPluginArgs: () => ([]),
  };

  constructor(props) {
    super(props);
    this.state = {
      refresh: 0
    };
    const {
      namespace, schema, components: comps,
      plugins, externals, modelApiRef: mApiRef, openLogger, getModelPluginArgs
    } = props;
    const {
      plugins: customPlugins, components: customComps, openLogger: showLogger = false
    } = getRegisteredItems(namespace);
    const combinedPlugins = [...baseOrderPlugins].concat(
      plugins,
      customPlugins,
      ...presetPlugins,
      { modelPlugin: PluginResetter },
    );
    if (openLogger || showLogger) {
      combinedPlugins.push({ modelPlugin: SifoLogger });
    }
    const modelOptions = {
      components: Object.assign({}, comps, customComps),
      modelApiRef: mApi => {
        this.mApi = mApi;
        if (mApiRef) {
          mApiRef(mApi);
        }
      },
      externals,
      getModelPluginArgs: (id, info) => {
        if (id === 'plugin_reset_model_plugin') {
          return [{ openLogger: openLogger || showLogger }];
        }
        if (getModelPluginArgs) {
          return getModelPluginArgs(id, info);
        }
        return [];
      }
    };
    this.model = new SifoModel(
      namespace,
      this.refreshApi,
      schema,
      combinedPlugins,
      modelOptions
    );
  }
  componentDidMount() {
    this.model.run();
  }
  componentWillUnmount() {
    this.model.destroy();
    this.model = null;
  }
  /* react 模式时，model.render 后的执行顺序：
    -> schema node componentDidMount
    -> root componentDidUpdate ( SifoModel.run 在 root.componentDidMount 中调用)
    -> refreshApi callback
    -> pagePlugin afterRender
    -> destroy
    -> root componentWillUnmount
    -> schema node componentWillUnmount
  */
  refreshApi = callback => {
    this.setState({
      refresh: this.state.refresh > 1000 ? 0 : this.state.refresh + 1
    }, () => {
      if (callback) {
        callback();
      }
    });
  }
  render() {
    const schema = this.mApi ? this.mApi.getSchema() : {};
    const components = this.mApi ? this.mApi.getComponents() : {};
    const { className, namespace: nameSps } = this.props;
    const namespace = this.mApi ? this.mApi.namespace : nameSps;
    return (
      <div
        key={namespace}
        data-sifo-namespace={namespace}
        className={cls('sifo-react', className)}
      >
        {
          renderFactory(schema, components)
        }
      </div>
    );
  }
}

export { sifoAppDecorator };
export default SifoApp;
