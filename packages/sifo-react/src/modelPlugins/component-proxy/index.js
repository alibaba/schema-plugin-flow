/**
 * @author FrominXu
 */
import componentWrap from './componentWrap';

function wrapper(components) {
  const wrappedComps = { ...components };
  Object.keys(components).forEach(name => {
    const component = components[name];
    // React.forwardRef 返回带render方法的对象作为组件，增加useSifoRenderProxy标
    if (component && component.useSifoRenderProxy &&
      component.render && typeof component.render === 'function') {
      wrappedComps[name] = componentWrap(component);
    }
  });
  return wrappedComps;
}
/**
 * 对提供render(element, props)方法类型的“组件”进行一次封装，以转化为普通React组件
 */
class ComponentRenderProxyPre {
  static ID = 'render_object_type_component_proxy_pre';
  onComponentsWrap = wrapper;
}
/**
 * 后置位置时还要进行一次，因为有可能有新的组件加入
 */
class ComponentRenderProxyAfter {
  static ID = 'render_object_type_component_proxy_after';
  onComponentsWrap = wrapper;
}

export default { ComponentRenderProxyPre, ComponentRenderProxyAfter };

