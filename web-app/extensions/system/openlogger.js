import SifoSingleton from '@schema-plugin-flow/sifo-singleton';

const singleton = new SifoSingleton('form-demo');

singleton.registerItem('openlogger', () => {
  return {
    plugins: [],
    openLogger: true
  };
});

export default singleton;
