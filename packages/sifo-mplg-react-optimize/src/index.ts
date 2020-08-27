import { SifoModelTypes } from "@schema-plugin-flow/sifo-react";
import uuid from 'uuid';
import componentWrap from './componentWrap';

// 对react 渲染进行优化
class reactOptimizeModelPlugin implements SifoModelTypes.ModelPlugin {
  // 用来标识模型插件身份
  static ID = 'sifo-react-optimize-model-plugin';
  schemaInstance: any;
  mApi: SifoModelTypes.ModelApi;
  constructor() {
    this.schemaInstance = null;
    this.mApi = null;
  }
  // 带优化的SCU组件
  onComponentsWrap = components => {
    const wrappedComps = {};
    Object.keys(components).forEach(key => {
      const comp = components[key];
      wrappedComps[key] = componentWrap(comp);
    });
    return wrappedComps;
  }
  onSchemaInstantiated = params => {
    const { event } = params;
    const { schemaInstance } = event;
    // 将实例保存起来
    this.schemaInstance = schemaInstance;
    this.schemaInstance.loopDown(node => {
      if (!node.attributes) return;
      // 对所有节点进行一次初始标记
      node.attributes.__renderOptimizeMark__ = "sifo-react-optimize-init-mark";// eslint-disable-line
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
        node.attributes.__renderOptimizeMark__ = guid;// eslint-disable-line
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
        node.attributes.__renderOptimizeMark__ = guid;// eslint-disable-line
      });// 从此key向下标记，包含此key的节点
      next(...args);
      return mApi.refresh();
    };
    applyModelApiMiddleware('forceRefresh', forceRefreshMiddleware);
  }
}

export default reactOptimizeModelPlugin;
