/* eslint-disable import/no-unresolved */
import defaultFormItemWrapper from './componentWrap';
// eslint-disable-next-line import/extensions
import Form from './form';

export { default as baseComponents } from './components';

class AdmFormModelPlugin {
  static ID = 'sifo_antd_form_model_plugin';
  constructor(props) {
    const { formItemWrapper, formItemProps = {} } = props || {};
    this.mApi = null;
    this.formItemWrapper = formItemWrapper || defaultFormItemWrapper;
    this.mApi = null;
    // this.formItemWrapper = componentWrap;
    // 统一配置 FormItem 属性，如 labelAlign, labelCol
    this.formItemProps = formItemProps;
  }
  onComponentsWrap = components => {
    const rComp = Object.assign({}, components, { Form });
    const wrappedComps = {};
    // 包含FormItem组件，识别__isField__属性
    Object.keys(rComp).forEach(key => {
      const comp = rComp[key];
      wrappedComps[key] = this.formItemWrapper(comp, this.formItemProps);
    });
    return wrappedComps;
  }
}
export default AdmFormModelPlugin;
