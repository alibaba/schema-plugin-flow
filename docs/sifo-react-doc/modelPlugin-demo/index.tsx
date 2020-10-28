import * as React from 'react';
import SifoApp, { SifoModelTypes } from "@schema-plugin-flow/sifo-react";
import FormModelPlugin from './mplg-antd-form';
import schema from './schema.json';
import './index.less';

const components = {
  Container: props => <div {...props} />
};
const componentPlugin: SifoModelTypes.ComponentPluginSet = {
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
    componentPlugin, modelPlugin: FormModelPlugin as SifoModelTypes.ModelPlugin
  }
];
type FormDemoProps = {
};
const FormDemo = (props: FormDemoProps) => {
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

export default FormDemo;