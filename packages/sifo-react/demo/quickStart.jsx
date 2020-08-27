import React from 'react';
import SifoApp from '@schema-plugin-flow/sifo-react';
// 一些组件
const Container = props => <div {...props} />;
const Slogan = ({ content, ...other }) => <h2 {...other}>{content}</h2>;
const Button = props => <button {...props}>click to change</button>;
// schema 定义了初始的页面结构
const schema = {
  component: "Container",
  id: 'mainId',
  attributes: {},
  children: [
    {
      component: "Slogan",
      id: 'slogan_id',
      attributes: {
        content: 'hello world'
      }
    },
    {
      component: "Button",
      id: 'test_btn_id',
      attributes: {}
    }
  ]
};
// 组件插件可以实现与组件相关的功能
const componentPlugin1 = {
  test_btn_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', (context) => {
        mApi.setAttributes('slogan_id', {
          content: 'hello sifo'
        });
      })
    }
  }
};
// 第二个插件
const componentPlugin2 = {
  test_btn_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', () => {
        console.log('test_btn_id clicked!')
      })
    }
  }
};
const components = { Container, Slogan, Button };
const plugins = [
  { componentPlugin: componentPlugin1 },
  { componentPlugin: componentPlugin2 }
];
class App extends React.Component {
  render() {
    return (
      <SifoApp
        className='quick-start'
        namespace='quick-start'
        components={components}
        schema={schema}
        plugins={plugins}
        openLogger={false}
      />
    );
  }
}
export default App;