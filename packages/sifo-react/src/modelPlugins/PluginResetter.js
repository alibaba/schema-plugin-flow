/**
 * @author FrominXu
 */
import SifoLogger from './logger';
import presetPlugins, { baseOrderPlugins } from './index';
import { getRegisteredItems } from '../utils/singleton-utils';
/**
 * 处理reloadPage方法时预置插件、客制插件和组件的重绑
 */
class PluginResetter {
  // 用来标识模型插件身份
  static ID = 'plugin_reset_model_plugin';
  constructor(props) {
    const { openLogger } = props;
    this.openLogger = openLogger;
    this.schemaInstance = null;
    this.mApi = null;
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    const { applyModelApiMiddleware } = event;
    const { namespace } = mApi;
    // 定义setAttributes中间件
    const reloadPageMiddleware = next => (reloadPageParams = {}, ...args) => {
      const {
        plugins, components, ...others
      } = reloadPageParams;
      let newPlgs = plugins;
      let newComps = components;
      const {
        plugins: customPlugins, components: customComps, openLogger: showLogger = false
      } = getRegisteredItems(namespace);
      if (plugins) { // 只有当外部传新插件时，才重绑
        newPlgs = [...baseOrderPlugins].concat(
          plugins,
          customPlugins,
          ...presetPlugins,
          { modelPlugin: PluginResetter },
        );
        if (this.openLogger || showLogger) {
          newPlgs.push({ modelPlugin: SifoLogger });
        }
      }
      if (components) {
        newComps = Object.assign({}, components, customComps); // sifo-model中是做的合并
      }
      const newReloadParams = {
        plugins: newPlgs,
        components: newComps,
        ...others,
      };
      return next(newReloadParams, ...args);
    };
    applyModelApiMiddleware('reloadPage', reloadPageMiddleware);
  }
}

export default PluginResetter;
