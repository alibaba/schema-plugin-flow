/**
 * @author FrominXu
 */
class Sifo_SINGLETON_INSTANCE {//eslint-disable-line
  constructor() {
    this.version = 'v1.0';
    // 闭包实现，以防止外部直接修改对象
    const container = {};
    /**
     * 获取命名空间下的项
     */
    this.getRegisteredItems = namespace => {
      // 防止外部读取
      if (typeof namespace !== 'string') {
        console.error('[sifo-singleton] namespace should be string');
        return [];
      }
      const result = (container[namespace] || []).map(item => ({ ...item }));
      return ([...result]);
    };
    /**
     * 注册
     * @param namespace 命名空间
     * @param id 扩展件的身份id
     * @param registerFunction 注册函数
     */
    this.registerItem = (namespace, id, registerFunction) => {
      // 防止外部读取
      if (typeof namespace !== 'string') {
        console.error('[sifo-singleton] namespace should be string');
        return;
      }
      if (typeof registerFunction !== 'function') {
        // 只允许用func形式，这样外部是无法修改function返回内容的
        console.error(`[sifo-singleton] registerFunction should be a function, namespace: ${namespace}, id: ${id}`);
        return;
      }
      const items = this.getRegisteredItems(namespace);
      // 同一命名空间下，同一id的插件，后来者优先
      const latestItems = items.filter(i => !(i.namespace === namespace && i.id === id));
      container[namespace] = [
        ...latestItems,
        {
          namespace,
          id,
          registerFunction
        }
      ];
    };
    ['version', 'getRegisteredItems', 'registerItem'].forEach(key => {
      Object.defineProperty(this, key, {
        writable: false, // 不可写
        configurable: false, // 不可删
      });
    });
  }
}
const getSifoGlobalHolder = function () {
  if (typeof globalThis !== 'undefined') { return globalThis; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  if (typeof self !== 'undefined') { return self; }
  console.error('[sifo-singleton]: sifoGlobalHolder not found!');
  return {};
};
var sifoGlobalHolder = getSifoGlobalHolder();
const UNIQUE = 'cc419ae8-1890-46e2-874f-eaf918f3a880';
export default class SifoSingleton {//eslint-disable-line
  constructor(namespace) {
    this.namespace = namespace;
    if (typeof namespace !== 'string' || namespace.replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, '') === '') {
      console.error('[sifo-singleton] namespace is undefined!');
      this.namespace = '--';
    }
    let instance = sifoGlobalHolder[UNIQUE];
    if (!instance) {
      sifoGlobalHolder[UNIQUE] = new Sifo_SINGLETON_INSTANCE();
      // 是否限制写？
      instance = sifoGlobalHolder[UNIQUE];
    }
    ['getRegisteredItems', 'registerItem'].forEach(key => {
      Object.defineProperty(this, key, {
        writable: false, // 不可写
        configurable: false, // 不可删
      });
    });
  }
  registerItem = (id, registerFunction) => {
    const instance = sifoGlobalHolder[UNIQUE];
    // 说明是旧版本的实例，无法注册
    if (instance.register) {
      console.error('[sifo-singleton] 已存在的全局实例版本太旧，无法注册，请升级');
    } else {
      instance.registerItem(this.namespace, id, registerFunction);
    }
  }
  getRegisteredItems = options => {
    const instance = sifoGlobalHolder[UNIQUE];
    // 兼容旧版本实例
    if (instance.register) {
      console.warn('[sifo-singleton] 已存在的全局实例版本太旧，请升级');
      const container = instance.getContainer(this.namespace);
      // 旧版可能在当前的命名空间下并未实例化过
      if (!container) return [];
      const customComps = container.components || {};
      const customPlugins = container.plugins || {};
      // 插件改为可支持多个，所以是数组
      return [{
        plugins: [customPlugins],
        components: customComps,
      }];
    }
    const items = instance.getRegisteredItems(this.namespace);
    // 这里的逻辑越少，兼容性越好
    const result = [];
    items.forEach(item => {
      const { registerFunction, id } = item;
      // 只允许用func形式，这样外部是无法修改function返回内容的
      if (typeof registerFunction !== 'function') {
        return;
      }
      const registerItem = registerFunction(options);
      result.push({
        ...registerItem,
        id
      });
    });
    return result;
  }
}
