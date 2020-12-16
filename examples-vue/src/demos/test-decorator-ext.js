import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import { Input, Button } from "ant-design-vue";

const customOnChange = (context, e) => {
  const { event, mApi } = context;
  const { key } = event;
  mApi.setAttributes(key, { value: e.target.value + 'extVal' });
}
const pagePlugin = {
  onNodePreprocess: (node, info) => {
    const { id, component } = node;
    if (id === '$sifo-header') {
      return {
        ...node,
        attributes: {
          style: {
            color: "green"
          }
        },
        children: ['这是扩展的header']
      }
    }
    if (id === '$dynamic_panel' || id === '$static_panel') {
      // 将片段直接换成新的组件，这个组件就可以拿到getFragment的参数
      return {
        ...node,
        component: 'Input',
        attributes: {
          ...node.attributes,
          others: {
            ok: false
          }
        }
      }
    }
    if (id === '$sifo-footer') {
      return {
        ...node,
        attributes: {
          style: {
            border: "1px solid green",
            padding: "4px"
          }
        },
        children: [
          {
            component: 'div',
            children: ['这是扩展的footer']
          },
          {
            component: 'Button',
            id: 'updateDataBtn',
            children: ['updateCount']
          }]
      }
    }
    return node;
  }
}
const componentPlugin = {
  'test-sifo-decorator': {
    onComponentInitial: params => {
      const { event, mApi } = params;
      let fcount = 0;
      mApi.addEventListener(event.key, 'click', (context, e) => {
        //context.event.stop();
        console.log('ext: click', context, e);
        mApi.setAttributes('$static_panel', {
          value: `ext click fired: ${++fcount}`
        });
      });
    }
  },
  $dynamic_panel: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'change', customOnChange);
    }
  },
  $static_panel: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'change', customOnChange);
    }
  },
  updateDataBtn: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'click', () => {
        mApi.dispatchWatch('getData', data => {
          console.log('old data:', data);
        });
        mApi.dispatchWatch('updateData', 'count');
      });
    }
  }
};
const singleton = new SifoSingleton('test-sifo-decorator');
singleton.registerItem('ccc', () => {
  return {
    plugins: [
      {
        pagePlugin,
        componentPlugin
      }
    ],
    components: {
      Input
    },
    openLogger: true
  };
});

export default {};