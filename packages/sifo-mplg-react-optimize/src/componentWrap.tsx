import * as React from 'react';
/* eslint-disable no-underscore-dangle,react/prop-types */
type RenderMarkCompProps = {
  renderOptimizeMark: string; // 渲染标识
  muteRenderOptimizeMark: boolean; // 是否禁用渲染标识
};
// 因为有children，不好用PurComponent
class RenderMarkComp extends React.Component<RenderMarkCompProps> {
  shouldComponentUpdate(nextProps) {
    // 无渲染标，直接渲染。有时候将包装组件作为普通组件使用时，就没有标记
    // console.log('nextProps.renderOptimizeMark:', nextProps.renderOptimizeMark)
    if (!nextProps.renderOptimizeMark) return true;
    if (nextProps.muteRenderOptimizeMark) return true;
    return this.props.renderOptimizeMark !== nextProps.renderOptimizeMark;
  }
  render() {
    return this.props.children;
  }
}
const defaultComponentName = 'SifoReactOptimise';
const componentWrap = Component => {
  const compName = Component ?
    (Component.name || Component.displayName || defaultComponentName)
    : defaultComponentName;
  const wrapName = `${compName}RenderMarkWrap`;
  const RenderMarkWrap: any = props => {
    if (!Component) return null;
    const { __renderOptimizeMark__, muteRenderOptimizeMark = false, ...other } = props;
    return (
      <RenderMarkComp
        renderOptimizeMark={__renderOptimizeMark__}
        muteRenderOptimizeMark={muteRenderOptimizeMark}
      >
        <Component {...other} />
      </RenderMarkComp>
    );
  };
  RenderMarkWrap.displayName = wrapName;
  return RenderMarkWrap;
};
export default componentWrap;
