import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import NoticeComp from './NoticeComp';

const pagePlugin = {
  onNodePreprocess: node => {
    if (node.id === 'main_id') {
      node.children.unshift({
        component: 'NoticeComp'
      });
    }
  }
};
const singleton = new SifoSingleton('form-demo');

singleton.registerItem('noticeExt', () => {
  return {
    plugins: [
      {
        pagePlugin
      }
    ],
    components: {
      NoticeComp
    }
  };
});

export default singleton;
