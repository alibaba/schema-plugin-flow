import React from 'react';
import sifoAppDecorator from '../../lib/sifoAppDecorator';

const IContainer = props => <div {...props} />;
const Input = props => <div>{props.label}<input {...props}></input></div>
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
      console.log(mApi);
      mApi.setAttributes(event.key, {
        label: '内置插件'
      });
      mApi.addEventListener(event.key, 'onChange', (ctx, e) => {
        console.log(e.target.value);
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
const getModelPluginArgs = (id, info) => {
  console.log('getModelPluginArgs', id, info)
}
@sifoAppDecorator('TestJsx', {
  components,
  plugins,
  externals: { aa: 1 },
  fragments: ['$header', innerSchema, '$body'],
  getModelPluginArgs,
  openLogger: true
})
class Target extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: 0
    };
    const { sifoApp } = props;
    const mApi = sifoApp.mApi;
    console.log('mApi', mApi);
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
  render() {
    const { test, customState } = this.state;
    console.log('render ---- origin state:', this.state);
    const headFragment = this.props.sifoApp.getFragment('$header');
    const bodyFragment = this.props.sifoApp.getFragment('$body');
    const testInnerSchema = this.props.sifoApp.getFragment('$test_inner');
    return <div>
      <div>实例值{this.instanceValue}</div>
      <div>内部状态：{test}</div>
      <div>外部状态：{customState}</div>
      <button onClick={this.onClickArrow}>箭头函数式</button>
      <button onClick={this.onClick}>函数式</button>
      <div>header片段
        {headFragment}
      </div>
      <div>内置 schema
        {testInnerSchema}
      </div>
      <div>body片段
        {bodyFragment}
      </div>
    </div>;
  }
}
export default Target;