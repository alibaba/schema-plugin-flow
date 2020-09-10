import uuid from 'uuid';

// 对 vue 渲染进行优化
class vueOptimizeModelPlugin {
  // 用来标识模型插件身份
  static ID = 'sifo-vue-optimize-model-plugin';
  constructor() {
    this.schemaInstance = null;
    this.mApi = null;
  }

  onSchemaInstantiated = params => {
    const { event } = params;
    const { schemaInstance } = event;
    // 将实例保存起来
    this.schemaInstance = schemaInstance;
    this.schemaInstance.loopDown(node => {
      if (!node.attributes) return;
      // 对所有节点进行一次初始标记
      node.__renderOptimizeMark__ = "sifo-vue-optimize-init-mark";// eslint-disable-line
      // 节点唯一标识，不使用节点id
      node.__renderOptimizeId__ = uuid(); // eslint-disable-line
      // 禁用渲染优化标记初始为false
      node.attributes.muteRenderOptimizeMark = false;// eslint-disable-line
    });
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    const { applyModelApiMiddleware } = event;

    const setAttributesMiddleware = next => (key, ...args) => {
      const guid = uuid();
      // 进行渲染标识
      this.schemaInstance.loopUp(node => {
        if (!node.attributes) return;
        node.__renderOptimizeMark__ = guid;// eslint-disable-line
      }, key);// 从此key向上标记，包含此key的节点
      return next(key, ...args);
    };
    // 对mApi的setAttributes方法进行再组装
    applyModelApiMiddleware('setAttributes', setAttributesMiddleware);

    // 替换渲染组件方法
    const replaceComponentMiddleware = next => (key, componentName) => {
      mApi.setAttributes(key, {}, false);// 强制标识
      return next(key, componentName);
    };
    applyModelApiMiddleware('replaceComponent', replaceComponentMiddleware);

    // 强制渲染
    const forceRefreshMiddleware = next => (...args) => {
      const guid = uuid();
      // 进行渲染标识
      this.schemaInstance.loopDown(node => {
        if (!node.attributes) return;
        node.__renderOptimizeMark__ = guid;// eslint-disable-line
      });// 从此key向下标记，包含此key的节点
      next(...args);
      return mApi.refresh();
    };
    applyModelApiMiddleware('forceRefresh', forceRefreshMiddleware);
  }
}

export default vueOptimizeModelPlugin;
