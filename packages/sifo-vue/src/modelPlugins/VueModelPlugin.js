import { classifyAttributes } from './utils';

class VueModelPlugin {
  static ID = 'sifo_vue_model_plugin';
  constructor(props) {
    const { sifoVueInstance } = props;
    this.mApi = null;
    this.sifoVueInstance = sifoVueInstance;
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
