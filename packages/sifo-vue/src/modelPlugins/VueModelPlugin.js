import { classifyAttributes } from './utils';
import renderFactory from '../utils/render-factory';

class VueModelPlugin {
  static ID = 'sifo_vue_model_plugin';
  constructor(props) {
    const { sifoVueInstance } = props;
    this.mApi = null;
    this.sifoVueInstance = sifoVueInstance;
    this.createElement = sifoVueInstance && sifoVueInstance.$createElement;
  }
  onNodePreprocess = node => {
    const { attributes } = node;
    const classifiedAttrs = classifyAttributes({}, attributes);
    return { ...node, attributes: classifiedAttrs };
  }
  onSchemaInstantiated = params => {
    const { event } = params;
    const { schemaInstance } = event;
    // 将实例保存起来
    this.schemaInstance = schemaInstance;
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    this.mApi = mApi;
    const { applyModelApiMiddleware } = event;
    // 定义获取vue实例的接口
    const getSifoVueInstance = next => () => {
      return next(this.sifoVueInstance);
    };
    applyModelApiMiddleware('getSifoVueInstance', getSifoVueInstance);
    const createElement = () => (...args) => {
      if (!this.createElement) {
        throw new Error('[sifo-vue] createElement not found.');
      }
      return this.createElement(...args);
    };
    applyModelApiMiddleware('createElement', createElement);
    const renderSlot = () => (id, prps = {}) => {
      const item = this.schemaInstance.nodeMap[id];
      if (item && item.attributes.slot) {
        // 防止原 schema 的 attributes 被修改
        const renderItem = { ...item };
        // attributes 合并处理，先对prps分类
        const classifyProps = classifyAttributes({}, { ...prps });
        renderItem.attributes = {
          // classifyAttributes 不会返回newAttrs中的on参数，所以要进行一次合并
          ...renderItem.attributes,
          ...classifyProps,
          // 插件 attributes 可以覆盖调用方的 props 参数，所以是作为newAttrs
          ...classifyAttributes(classifyProps, renderItem.attributes, true)
        };
        // 去除slot标
        delete renderItem.attributes.slot;
        const comps = this.mApi ? this.mApi.getComponents() : {};
        return renderFactory(
          renderItem,
          this.createElement,
          comps,
          {},
          false
        );
      }
      return null;
    };
    applyModelApiMiddleware('renderSlot', renderSlot);
    // 定义setAttributes中间件
    const setAttrsMiddleware = next => (id, attributes, ...args) => {
      const oldAttrs = mApi.getAttributes(id) || {};
      // 除了class/style等几个是放到对应的属性上，其它都放到props中
      // 对on 属性的保护
      const classifiedAttrs = classifyAttributes(oldAttrs, attributes);
      return next(id, classifiedAttrs, ...args);
    };
    // 对mApi的setAttributes方法进行再组装
    applyModelApiMiddleware('setAttributes', setAttrsMiddleware);

    const addEventListenerMiddleware = next => (id, name, ...args) => {
      // 先附加监听, 这里会直接把方法放到属性上
      next(id, name, ...args);
      const attrs = mApi.getAttributes(id) || {};
      const method = attrs[name];
      const item = this.schemaInstance.nodeMap[id];
      if (!item) {
        return;
      }
      const reAttrs = {
        ...attrs, // 此中可能已经有[eventName]了
        on: {
          ...attrs.on,
          [name]: method
        }
      };
      delete reAttrs[name];
      // 这里不能用setAttributes方法修改属性,因为setAttributes要保护监听方法不被覆盖
      item.attributes = reAttrs;
      this.mApi.setAttributes(id, {}, true);
    };
    // 对mApi的saddEventListener方法进行再组装
    applyModelApiMiddleware('addEventListener', addEventListenerMiddleware);
  }
  onDestroy = () => {
    this.sifoVueInstance = null;
  }
}

export default VueModelPlugin;
