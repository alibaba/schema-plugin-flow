---
title: modelPlugin Demo
order: 5
---
form modelPlugin for Ant Design Form
```jsx
import * as React from 'react';
import SifoApp, { SifoModelTypes } from "@schema-plugin-flow/sifo-react";
import FormModelPlugin from './modelPlugin-demo/mplg-antd-form';
import schema from './modelPlugin-demo/schema.json';
import './modelPlugin-demo/index.less';
import 'antd/dist/antd.css';
//
const components = {
  Container: props => <div {...props} />
};
const componentPlugin = {
  $form_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        labelCol: {
          span: 6,
        },
        wrapperCol: {
          span: 14,
        },
      });
      mApi.addEventListener(event.key, 'onValuesChange', (ctx, changedValues, allValues) => { 
        console.log(changedValues);
      })
    }
  },
  $submit: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', () => {
        // mApi.submit()
        mApi.validateFields().then(d => { 
          const values = mApi.getFieldsValue();
          console.log('values:', values);
        }).catch(e => { 
          console.log(e)
        })
      })
    }
  }
};
const plugins = [
  {
    componentPlugin, modelPlugin: FormModelPlugin 
  }
];
//
const FormDemo = (props) => {
  const {  } = props;
  return (
    <SifoApp
      className='sifo-form-demo'
      namespace='form-demo'
      components={components}
      schema={schema}
      plugins={plugins}
      openLogger={true}
    />
  );
};
//
export default FormDemo;
```

