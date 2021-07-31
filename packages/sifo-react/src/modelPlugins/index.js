import ComponentNotFound from './ComponentNotFound';
import componentRenderProxy from './component-proxy';
import ReactModelPlugin from './ReactModelPlugin';

const { ComponentRenderProxyPre, ComponentRenderProxyAfter } = componentRenderProxy;
// 注意PluginResetter单独用
// // 后置插件
const presetPlugins = [
  { modelPlugin: ComponentRenderProxyAfter },
  { modelPlugin: ComponentNotFound },
];

// 前置插件
export const baseOrderPlugins = [
  { modelPlugin: ComponentRenderProxyPre },
  { modelPlugin: ReactModelPlugin }
];

export default presetPlugins;
