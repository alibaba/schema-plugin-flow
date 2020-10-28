import defaultFormItemWrapper from './componentWrap';

class AntdFormModelPlugin {
  static ID = 'sifo_antd_form_model_plugin';
  constructor(props) {
    const { formItemWrapper } = props || {};
    this.mApi = null;
    this.formItemWrapper = formItemWrapper || defaultFormItemWrapper;
  }
  onComponentsWrap = components => {
    const rComp = Object.assign({}, components);
    const wrappedComps = {};
    // 包含FormItem组件，识别__isField__属性
    Object.keys(rComp).forEach(key => {
      const comp = rComp[key];
      wrappedComps[key] = this.formItemWrapper(comp);
    });
    return wrappedComps;
  }
}
export default AntdFormModelPlugin;
