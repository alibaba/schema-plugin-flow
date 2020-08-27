class Sifo_SINGLETON_INSTANCE {//eslint-disable-line
  constructor() {
    this.container = {};
  }
  getContainer = namespace => this.container[namespace]
  createContainer = namespace => {
    const plugins = {
      modelPlugin: null
    };
    Object.defineProperty(plugins, 'modelPlugin', {
      writable: false, // 不可写
      configurable: false, // 不可删
    });
    const container = {
      plugins
    };
    Object.defineProperty(container, 'plugins', {
      writable: false, // 不可写
      configurable: false, // 不可删
    });
    this.container[namespace] = container;
  }
  /**
   * 注册
   * @param namespace 命名空间
   * @param category 类别（plugins或components）
   * @param type 类型
   * @param obj 对象
   */
  register = (namespace, category, type, obj) => {
    if (category === 'plugins' && type === 'modelPlugin') {
      // 暂不开放客制模型插件
      console.info('modelPlugin is not supported.');
      return;
    }
    if (!this.container[namespace][category]) {
      this.container[namespace][category] = {};
    }
    this.container[namespace][category][type] = obj;
  }
}
const window = window || {};
const UNIQUE = 'cc419ae8-1890-46e2-874f-eaf918f3a880';
export default class SifoSingleton {//eslint-disable-line
  constructor(namespace) {
    this.namespace = namespace;
    if (typeof namespace !== 'string' || namespace.replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, '') === '') {
      console.error('namespace is undefined!');
      this.namespace = '--';
    }
    let instance = window[UNIQUE];
    if (!instance) {
      window[UNIQUE] = new Sifo_SINGLETON_INSTANCE();
      instance = window[UNIQUE];
    }
    const container = instance.getContainer(this.namespace);
    if (!container) {
      instance.createContainer(this.namespace);
    }
  }
  registerPlugin = (type, obj) => {
    const instance = window[UNIQUE];
    instance.register(this.namespace, 'plugins', type, obj);
  }
  registerComponent = (name, component) => {
    const instance = window[UNIQUE];
    instance.register(this.namespace, 'components', name, component);
  }
  getRegisteredPlugins = () => {
    const instance = window[UNIQUE];
    const container = instance.getContainer(this.namespace);
    return container.plugins || {};
  }
  getRegisteredComponents = () => {
    const instance = window[UNIQUE];
    const container = instance.getContainer(this.namespace);
    return container.components || {};
  }
}
