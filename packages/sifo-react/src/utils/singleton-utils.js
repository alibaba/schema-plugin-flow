import SifoSingleton from '@schema-plugin-flow/sifo-singleton';

export function getRegisteredItems(namespace) {
  const singleton = new SifoSingleton(namespace);
  const singletonItems = singleton.getRegisteredItems();
  const result = {
    openLogger: false,
    plugins: [],
    components: {},
  };
  singletonItems.forEach(registerItem => {
    if (!registerItem) return;
    const { components = {}, openLogger = false } = registerItem;
    // 允许扩展插件打开日志
    if (openLogger) {
      result.openLogger = true;
    }
    let { plugins = [] } = registerItem;
    if (!Array.isArray(plugins)) {
      plugins = [plugins];
    }
    // 由接收方来控制获取哪些数据
    const validatedPlugins = plugins.map(plg => {
      const vplg = {};
      // 只支持页面和组件插件
      if (plg.pagePlugin) {
        vplg.pagePlugin = plg.pagePlugin;
      }
      if (plg.componentPlugin) {
        vplg.componentPlugin = plg.componentPlugin;
      }
      return vplg;
    });
    result.plugins = [...result.plugins, ...validatedPlugins];
    result.components = { ...result.components, ...components };
  });
  // const { plugins, components } = result;
  // return {
  //   plugins,
  //   components
  // };
  return result;
}

export default {
  getRegisteredItems
};
