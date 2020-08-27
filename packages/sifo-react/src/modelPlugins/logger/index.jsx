/**
 * Logger
 */
class SifoLogger {
  static ID = 'sifo_logger_model_plugin';
  constructor() {
    console.log('[sifo-logger] Initial');
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    const { namespace } = mApi;
    if (!window.SifoLogger) window.SifoLogger = {};
    window.SifoLogger[namespace] = { mApi };
    console.log(`[sifo-logger] mApi is appended to %c window.SifoLogger['${namespace}'].mApi`, 'background: yellow; color: red');
    const { applyModelApiMiddleware } = event;
    Object.keys(mApi).forEach(api => {
      if (typeof mApi[api] !== 'function' || /^get/.test(api) || api === 'hasEventListener') return;
      const loggerMiddleware = next => (...args) => {
        console.log(`[sifo-logger] mApi.${api}. args: `, args);
        return next(...args);
      };
      applyModelApiMiddleware(api, loggerMiddleware);
    });
  }
  onReadyToRender = params => {
    const { mApi } = params;
    console.log('[sifo-logger] schema: ', mApi.getSchema());
    console.log('[sifo-logger] components: ', mApi.getComponents());
  }
  onDestroy = ({ mApi }) => {
    const { namespace } = mApi;
    console.log(`[sifo-logger] %c onDestroy: ${namespace}`, 'background: yellow; color: red');
    delete window.SifoLogger[namespace];
  }
}

export default SifoLogger;
