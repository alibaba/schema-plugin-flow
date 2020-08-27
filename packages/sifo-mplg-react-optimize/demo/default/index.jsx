import React from 'react';
import SifoApp from '@schema-plugin-flow/sifo-react';
import test_schema from './schema.json';
import reactOptimizeModelPlugin from '../../src/index';
import formModelPlugin from './formModelPlugin';
import componentPlugin from './componnetPlugin';
import CWrap from './custom-wrap-component'
import './index.css';

const components = {
  'Container': (props) => <div {...props}></div>,
  'Input': (props) => {
    console.log('input render', props.name);
    return <div className="demo-input">{props.name}:<input {...props} />重渲染检测：{new Date().getMilliseconds()}</div>
  },
  CWrap
}
class Component extends React.Component {
  constructor(props) {
    super(props);
  }

  onClick = () => {
    this.mApi.forceRefresh().then(() => {
      console.log('force refreshed');
    });
  }

  render() {
    return (
      <div className='div-test'>
        <button onClick={this.onClick}>强制渲染</button>
        <SifoApp
          namespace="test"
          schema={test_schema}
          components={components}
          modelApiRef={(mApi) => {
            this.mApi = mApi;
          }}
          plugins={[{ modelPlugin: formModelPlugin, componentPlugin }, { modelPlugin: reactOptimizeModelPlugin }]}
        />
      </div>
    );
  }
}

export default Component;
