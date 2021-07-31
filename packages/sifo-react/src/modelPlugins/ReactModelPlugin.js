class ReactModelPlugin {
  static ID = 'sifo_react_model_plugin';
  constructor(props) {
    const { sifoReactInstance } = props;
    this.mApi = null;
    this.sifoReactInstance = sifoReactInstance;
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    this.mApi = mApi;
    const { applyModelApiMiddleware } = event;
    // 定义获取react实例的接口
    const getSifoExtProps = next => () => {
      const { props = {} } = this.sifoReactInstance || {};
      const { sifoExtProps = {} } = props;
      return next(sifoExtProps);
    };
    applyModelApiMiddleware('getSifoExtProps', getSifoExtProps);
  }
  onDestroy = () => {
    this.sifoReactInstance = null;
  }
}

export default ReactModelPlugin;
