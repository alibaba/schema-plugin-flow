import React, { useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';
import componentWrap from './componentWrap';

const APIs = ["getFieldValue", "getFieldsValue", "getFieldError", "getFieldsError", "isFieldsTouched", "isFieldTouched", "isFieldValidating", "isFieldsValidating", "resetFields", "setFields", "setFieldsValue", "validateFields", "submit", "getInternalHooks", , "scrollToField", "getFieldInstance"];
const needSyncAPIS = ["resetFields", "setFields", "setFieldsValue", "setFields"];
const AntdForm = props => {
  const { formRef, children, ...others } = props;
  const [form] = Form.useForm();
  useEffect(() => {
    formRef && formRef(form)
  }, []);
  return (
    <Form form={form} {...others}>{children}</Form>
  );
};

const { TextArea } = Input;
const { Item: FormItem } = Form;
class FormModelPlugin {
  static ID = 'antd-form-model-plugin';
  constructor() {
    this.schemaInstance = null;
    this.mApi = null;
    this.formId = null;
  }
  // 表单组件的包装
  onComponentsWrap = components => {
    // preset antd components
    const rComp = Object.assign({}, { Form: AntdForm, FormItem, Input, Button, Select, TextArea }, components);
    const wrappedComps = {};
    Object.keys(rComp).forEach(key => {
      const comp = rComp[key];
      wrappedComps[key] = componentWrap(comp, FormItem);
    });
    return wrappedComps;
  }
  onSchemaInstantiated = params => {
    const { event } = params;
    const { schemaInstance } = event;
    this.schemaInstance = schemaInstance;
    this.schemaInstance.loopDown(node => {
      if (node.component === 'Form') {
        const { id } = node;
        this.formId = id;
        return false;
      }
      return true;
    });
    this.schemaInstance.loopDown(node => {
      const { attributes = {}, id, __parentId__, component } = node;
      const { name } = attributes;
      const parent = __parentId__ && (this.schemaInstance.nodeMap[__parentId__]);
      const parentIsFormItem = (parent && parent.component == 'FormItem' && parent.attributes.name);
      if (parentIsFormItem) {
        return 'continue'; // 不再进行子节点遍历
      }
      const skipWrap = !!(component == 'FormItem' && name);
      if (name) {
        Object.assign(
          node.attributes,
          {
            __isField__: true,
            __skipWrap__: skipWrap
          }
        );// 标识是字段实体节点
      }
      if (skipWrap) {
        return 'continue'; // 不再进行子节点遍历
      }
    });
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    console.log('onModelApiCreated.mApi.submit', mApi.submit, event);
    this.mApi = mApi;
    if (!this.formId) return;
    const formRef = {
      api: null
    }
    const { applyModelApiMiddleware } = event;
    this.mApi.formRef = formRef;
    mApi.addEventListener(this.formId, 'formRef', (ctx, api) => {
      formRef.api = api;
    }, true);
    APIs.forEach(api => {
      applyModelApiMiddleware(api, (next) => (...args) => {
        if (formRef.api[api] && typeof formRef.api[api] !== 'function') return formRef.api[api];
        if (formRef.api[api]) {
          if (needSyncAPIS.indexOf(api) >= 0) {
            const result = formRef.api[api](...args);
            // 状态同步
            const syncObj = formRef.api.getFieldsValue();
            Object.keys(syncObj).forEach(id => {
              mApi.setAttributes(id, {
                value: syncObj[id]
              }, false);
            });
            return result;
          }
          return formRef.api[api](...args);
        }
        return next(...args);
      });
    });
    const setAttrsMiddleware = next => (id, attributes, refresh) => {
      const { __isField__, name } = this.mApi.getAttributes(id) || {};
      if (__isField__ && attributes.hasOwnProperty('value') && this.mApi.formRef.api && name) {
        // 调用api上的方法，不会再触发setAttributes
        this.mApi.formRef.api.setFieldsValue({ [name]: attributes.value });
        return next(id, attributes, refresh);
      }
      return next(id, attributes, refresh);
    };
    applyModelApiMiddleware('setAttributes', setAttrsMiddleware);
    mApi.addEventListener(this.formId, 'onValuesChange', (ctx, changedValues, allValues) => {
      const { mApi } = ctx;
      // 状态同步
      Object.keys(changedValues).forEach(id => {
        mApi.setAttributes(id, {
          value: changedValues[id]
        }, false);
      });
    }, true);
  }
  onModelApiReady = params => { 
    const { mApi, event } = params;
    console.log('onModelApiReady.mApi.submit', mApi.submit, event);
  }
  afterRender = params => {
    console.log('model afterRender');
  }
  onDestroy = () => { 
    console.log('model onDestroy');
  }
}

export default FormModelPlugin;