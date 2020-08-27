
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import React from 'react';

const customOnChange = (context, value) => {
  const { event, mApi } = context;
  const {
    key
  } = event;
  mApi.setAttributes(key, { value: value + 'CTest' });
}
const pagePlugin = {
  onNodePreprocess: (node, info) => {
    const { id, component } = node;
    if (id === 'TestJsx') {
      return {
        ...node
      }
    }
    if(id==='$sifo-header'){
      return {
        ...node,
        attributes: {
          style: {
            backgroundColor: "green"
          }
        },
        children:['这是扩展的header']
      }
    }
    if(id==='$sifo-footer'){
      return {
        ...node,
        attributes: {
          style: {
            backgroundColor: "green"
          }
        },
        children:['这是扩展的footer']
      }
    }
    if (id === '$header') {
      return {
        ...node,
        attributes: {
          style: {
            backgroundColor: 'red'
          }
        },
        children: [
          {
            component: 'Cinput',
            id: 'custom',
            attributes: {

            }
          }
        ]
      }
    }
    if (id === '$body') {
      return {
        ...node,
        children: [
          {
            component: 'button',
            id: 'testbtn',
            attributes: {

            },
            children: ['扩展按钮']
          }
        ]
      }
    }
    return node;
  },
}
const componentPlugin = {
  TestJsx: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', (context, e) => {
        //context.event.stop();
        console.log('custom click', context, e);
      });
      mApi.addEventListener(event.key, 'onClickArrow', (context, e) => {
        console.log('custom arrow click', context, e)
      });
      mApi.addEventListener(event.key, 'setState', (e, state) => {
        console.log('origin set state', state);
        const nextState = {
          ...state,
          customState: 'customstate' + new Date().getMilliseconds()
        };
        console.log('custom set state:', nextState)
        e.event.next(nextState);
      });
    },
    afterPageRender: ({ mApi, event }) => {
      mApi.addEventListener(event.key, 'onClick', (context, e) => {
        //context.event.stop();
        console.log('custom after click', context, e);
      });
    }
  },
  custom: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.replaceComponent(event.key, 'Cinput');
      mApi.addEventListener(event.key, 'onChange', customOnChange);
    }
  },
  testbtn: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick',
        context => {
          console.log('客户插件 clicked!!');
          mApi.dispatchWatch('getState', (state) => {
            console.log('get state', state);
          });
          const va = new Date().getMilliseconds();
          mApi.dispatchWatch('setState', {
            test: 'custom set state' + va,
          });
          context.mApi.setAttributes('custom', {
            value: `扩展插件${va}`
          });
          //context.event.stop();
        }, true);
    }
  }
};
const singleton = new SifoSingleton('TestJsx');
const Cinput = (props) => <input {...props} value={props.value || ''} onChange={e => props.onChange(e.target.value)} />;
singleton.registerItem('ccc', () => {
  return {
    plugins: [
      {
        pagePlugin,
        componentPlugin
      }
    ],
    components: {
      Cinput
    }
  }
})
console.log('sifo singleton 222')

export default {}; // 触发打包

