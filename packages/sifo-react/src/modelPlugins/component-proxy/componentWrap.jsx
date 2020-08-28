/**
 * @author FrominXu
 */
import React from 'react';
import ReactDOM from 'react-dom';
import T from 'prop-types';

class RenderComponentProxy extends React.Component {
  static propTypes = {
    renderProxy: T.func.isRequired,
    /**
     * 渲染标识，如果不传值，则代理组件会在每次渲染时进行渲染；如果传值，则只在前后两次值不相同时进行渲染
     */
    rerenderKey: T.string,
    rerenderType: T.oneOf(['normal', 'rerenderKey']),
    unmount: T.func,
  }
  static defaultProps = {
    rerenderKey: null,
    rerenderType: 'normal',
    unmount: undefined,
  }
  constructor(props) {
    super(props);
    this.el = null;
    this.proxyInstance = null;
  }
  componentDidMount() {
    this.renderProxy(false);
  }
  componentDidUpdate(prevProps) {
    const { renderProxy: preRenderProxy, rerenderKey: preRerenderKey, rerenderType } = prevProps;
    const { renderProxy, rerenderKey } = this.props;
    // rerenderType 为 normal 时，保持react渲染模式不变
    // renderProxy 不同时一定要渲染
    // 在没传rerenderKey时，保持react渲染模式不变，即每次渲染都进行调用
    if (rerenderType === 'normal' || preRenderProxy !== renderProxy || !rerenderKey || (preRerenderKey !== rerenderKey)) {
      // 进行重渲染就可以了 this.unmountProxy();
      /**
       * ReactDOM.render() controls the contents of the container node you pass in.
       * Any existing DOM elements inside are replaced when first called.
       * Later calls use React’s DOM diffing algorithm for efficient updates.
       */
      this.renderProxy();
    }
  }
  componentWillUnmount() {
    this.unmountProxy();
  }
  unmountProxy = () => {
    const { el } = this;
    const { unmount } = this.props;
    if (el) {
      if (unmount) {
        // 传入代理渲染的返回值（如果有）
        unmount(el, this.proxyInstance);
      } else {
        ReactDOM.unmountComponentAtNode(el);
      }
    }
  }
  containerRef = ref => {
    this.el = ref;
  }
  /**
   * 是否是更新
   */
  renderProxy = (update = true) => {
    const {
      renderProxy, rerenderType, rerenderKey, unmount, ...others
    } = this.props;
    const { el } = this;
    if (!renderProxy || !el) {
      return;
    }
    this.proxyInstance = renderProxy(el, others, update, this.proxyInstance);
  }
  render() {
    return (<div className="schema-render-comp-proxy" ref={this.containerRef} />);
  }
}

const defaultComponentName = 'NonStandardComponent';
const initRerenderKey = 'init-rerender-key';
const componentWrap = Component => {
  const compName = Component ?
    (Component.name || Component.displayName || defaultComponentName)
    : defaultComponentName;
  const wrapName = `${compName}RenderProxy`;
  const RenderProxyWrap = props => {
    if (!Component) return null;
    // 特殊组件默认按正常渲染走
    const { render, rerenderType = 'normal', unmount } = Component;
    const { rerenderKey, rerenderType: dynamicType, ...others } = props;
    const renderType = dynamicType || rerenderType;
    // 如果是rerenderKey类型，则按rerenderKey渲染
    const rednerKey = renderType === 'rerenderKey' ? (rerenderKey || initRerenderKey) : null;
    return (
      <RenderComponentProxy
        {...others}
        renderProxy={render} // 渲染方法
        rerenderType={renderType}
        rerenderKey={rednerKey} // 重渲染标识
        unmount={unmount}
      />
    );
  };
  RenderProxyWrap.displayName = wrapName;
  RenderProxyWrap.propTypes = {
    rerenderKey: T.string,
    rerenderType: T.oneOf(['normal', 'rerenderKey']).isRequired,
  };
  RenderProxyWrap.defaultProps = {
    rerenderKey: ''
  };
  return RenderProxyWrap;
};
export default componentWrap;
