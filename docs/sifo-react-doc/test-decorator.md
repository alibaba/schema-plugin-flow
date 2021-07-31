---
title: testDecorator
order: 2
---


```jsx
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import React from 'react';
// 
const customOnChange = (context, value) => {
  const { event, mApi } = context;
  const { key } = event;
  mApi.setAttributes(key, { value: value + 'CTest' });
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
    if (id === '$temp_panel') {
      // 将片段直接换成新的组件，这个组件就可以拿到getFragment的参数
      return {
        ...node,
        component: 'DynamicPropsCom',
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
            backgroundColor: "green"
          }
        },
        children: ['这是扩展的footer']
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
            id: 'custom'
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
            children: ['扩展按钮']
          }
        ]
      }
    }
    return node;
  },
}
const componentPlugin = {
  'test-sifo-decorator': {
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
            value: `扩展插件${va} `
          });
          //context.event.stop();
        }, true);
    }
  }
};
const singleton = new SifoSingleton('test-sifo-decorator');
const Cinput = (props) => <input {...props} value={props.value || ''} onChange={e => props.onChange(e.target.value)} />;
const DynamicPropsCom = (props) => {
  const { stateValue, others } = props;
  console.log('动态参数：', props);
  console.log('others.ok 应该是 false: ', others.ok);
  return (
    <div style={{ color: 'red' }}>我是动态传参组件：
      {stateValue}
    </div>
  );
};
singleton.registerItem('ccc', () => {
  return {
    plugins: [
      {
        pagePlugin,
        componentPlugin
      }
    ],
    components: {
      Cinput,
      DynamicPropsCom
    }
  }
})
//
export default () => <>This is a extension for test-decorator in another js, it changed schema and injected plugins. </>;
```

```jsx
import React, { useState } from 'react';
import { sifoAppDecorator } from "@schema-plugin-flow/sifo-react";
import './test-decorator/index.css';
//
const IContainer = props => <div {...props} />;
const Input = props => <div>{props.label}<input {...props} value={props.value || ''} /></div>
const innerSchema = {
  component: "IContainer",
  id: "$test_inner",
  attributes: {
    style: {
      background: '#fcff58'
    }
  },
  children: [
    {
      component: "Input",
      id: 'inner_input',
      attributes: {
        label: '内置文本',
        value: ''
      }
    },
    {
      component: "Input",
      id: 'inner_input2',
      attributes: {
        label: '赋值文本',
        value: ''
      }
    }
  ]
};
const components = { IContainer, Input };
const componentPlugin = {
  inner_input: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        label: '内置插件'
      });
      mApi.addEventListener(event.key, 'onChange', (ctx, e) => {
        const extProps = mApi.getSifoExtProps();
        console.log('getSifoExtProps: ', extProps);
        mApi.setAttributes(event.key, {
          value: e.target.value
        })
        mApi.setAttributes('inner_input2', {
          value: e.target.value
        })
      });
    }
  }
}
const plugins = [{ componentPlugin }];
@sifoAppDecorator('test-sifo-decorator', {
  components,
  plugins,
  externals: { aa: 1 },
  fragments: ['$header', innerSchema, '$temp_panel', '$body'],
  className: "decorator-test",
  openLogger: true
})
class TestDecorator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: 0
    };
    const { sifoApp } = props;
    const mApi = sifoApp.mApi;
    console.log('test-decorator: constructor')
    this.setState = sifoApp.addEventListener('setState', this.setState.bind(this));
    this.onClick = sifoApp.addEventListener('onClick', this.onClick.bind(this));
    this.onClickArrow = sifoApp.addEventListener('onClickArrow', this.onClickArrow);
    sifoApp.watch('getState', (e, getter) => {
      getter(this.state);
    });
    sifoApp.watch('setState', (e, state) => {
      this.setState({
        ...state
      });
    });
    this.instanceValue = new Date().getMilliseconds()
  }
  onClick(e) {
    console.log('origin onClick', e, this.props);
    this.setState({
      test: new Date().getMilliseconds()
    });
  }
  onClickArrow = (e) => {
    console.log('origin arrow click', e, this.props);
    this.setState({
      test: new Date().getMilliseconds()
    })
  }
  componentWillUnmount() {
    console.log('test-decorator unmounted!')
  }
  render() {
    const { test, customState } = this.state;
    console.log('render ---- origin state:', this.state);
    console.log('render ---- mApi instance:', this.props.sifoApp.mApi.instanceId);
    this.props.sifoApp.mApi.getAttributes('$test_inner')
    const headFragment = this.props.sifoApp.getFragment('$header');
    const bodyFragment = this.props.sifoApp.getFragment('$body');
    const testInnerSchema = this.props.sifoApp.getFragment('$test_inner');
    const dynamicPanel = this.props.sifoApp.getFragment('$temp_panel', { 
      stateValue: test, others: { ok: true } 
    });
    return (
      <div>
        <div>实例值{this.instanceValue}</div>
        <div>内部状态：{test}</div>
        <div>外部状态：{customState}</div>
        <button onClick={this.onClickArrow}>箭头函数式</button>
        <button onClick={this.onClick}>函数式</button>
        <div>header片段区
        {headFragment}
        </div>
        <div>内置 schema 片段区
        {testInnerSchema}
        </div>
        <div>动态传参片段
        {dynamicPanel}
        </div>
        <div>body片段区
        {bodyFragment}
        </div>
      </div>
    );
  }
}
const App = props => {
  const [val, setVal] =  useState(Math.random().toString().substr(3,8));
  return (
    <div>
      <button onClick={()=>{
        setVal(Math.random().toString().substr(3,8))
      }}>点击更新extProps</button>
      <p>value:{ val }</p>
      <TestDecorator sifoExtProps={{val}}/>
    </div>
  );
}
export default App;
``` 

```jsx
import React from 'react';
import { sifoAppDecorator } from "@schema-plugin-flow/sifo-react";
const TestFnDecorator = props => {
    const { sifoApp } = props;
    console.log('render ---- mApi instance:', sifoApp.mApi.instanceId);
    const dynamicPanel = sifoApp.getFragment('$temp_panel', { 
      stateValue: '函数式',
      others: { ok: true } 
    });
    return (
      <div>
      <h3>函数式组件</h3>
        { dynamicPanel }
      </div>
    );
}
const App = sifoAppDecorator('test-sifo-decorator', {
  externals: { aa: 1 },
  fragments: ['$temp_panel'],
  className: "decorator-fn-test",
  openLogger: true
})(TestFnDecorator);
export default App;
```