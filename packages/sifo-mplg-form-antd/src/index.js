import defaultFormItemWrapper from './componentWrap';

class AntdFormModelPlugin {
  static ID = 'sifo_antd_form_model_plugin';
  constructor(props) {
    const { formItemWrapper, formItemProps = {} } = props || {};
    this.mApi = null;
    this.formItemWrapper = formItemWrapper || defaultFormItemWrapper;
    // 统一配置 FormItem 属性，如 labelAlign, labelCol
    this.formItemProps = formItemProps;
  }
  onComponentsWrap = components => {
    const rComp = Object.assign({}, components);
    const wrappedComps = {};
    // 包含FormItem组件，识别__isField__属性
    Object.keys(rComp).forEach(key => {
      const comp = rComp[key];
      wrappedComps[key] = this.formItemWrapper(comp, this.formItemProps);
    });
    return wrappedComps;
  }
}
export default AntdFormModelPlugin;
