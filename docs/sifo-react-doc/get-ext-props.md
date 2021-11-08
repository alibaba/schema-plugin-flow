---
title: getExtProps
order: 8
---
# getExtProps

```jsx
import React from 'react';
import SifoApp from '@schema-plugin-flow/sifo-react';
// 一些组件
const Container = props => <div {...props} />;
const Show = ({ content, mApi, ...other }) => {
  const extProps = mApi.getSifoExtProps();
  console.log('getSifoExtProps in : ', extProps);
  return (<h2 {...other}>{content}</h2>);
}
const Button = props => <button {...props}>click to change</button>;
// schema 定义了初始的页面结构
const schema = {
  component: "Container",
  id: 'mainId',
  attributes: {},
  children: [
    {
      component: "Show",
      id: 'show_id',
      attributes: {
        content: 'show'
      }
    },
    {
      component: "Button",
      id: 'test_btn_id',
      attributes: {}
    }
  ]
};

const componentPlugin = {
  test_btn_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', (context, e) => {
        const extProps = mApi.getSifoExtProps();
        console.log('getSifoExtProps: ', extProps);
      })
    }
  },
  show_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        mApi
      })
    }
  }
};

const components = { Container, Show, Button };
const plugins = [
  { componentPlugin: componentPlugin }
];
class App extends React.Component {
  constructor(props){
    super(props);
    this.state={
      test: Math.random().toString().substr(3,8)
    }
  }
  render() {
    const extProps = {
      value: this.state.test,
      other: Math.random().toString().substr(3,8)
    };
    return (
      <div>
      <button onClick={()=>{
        this.setState({
          test: Math.random().toString().substr(3,8)
        })
      }}>点击更新extProps</button>
      <p>value:{ this.state.test}/other:{extProps.other}</p>
      <SifoApp
        className='get-ext-props'
        namespace='get-ext-props'
        components={components}
        schema={schema}
        plugins={plugins}
        sifoExtProps={extProps}
        openLogger={true}
      />
      </div>
    );
  }
}
export default App;
``` 