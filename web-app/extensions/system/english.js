import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import config from './english-config';

const pagePlugin = {
  onNodePreprocess(node) {
    const tItem = config.find(item => item.id === node.id);
    if (tItem) {
      return {
        ...node,
        attributes: {
          ...node.attributes,
          ...tItem.attributes,
        }
      };
    }
    return node;
  }
};
const singleton = new SifoSingleton('form-demo');

singleton.registerItem('englishExt', () => {
  return {
    plugins: [
      {
        pagePlugin
      }
    ]
  };
});

export default singleton;

