import defaultFormItemWrapper from './componentWrap';

class AntdVueFormModelPlugin {
  static ID = 'sifo_antdv_form_model_plugin';
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

  onModelApiCreated = params => {
    const { mApi, event } = params;
    this.mApi = mApi;
    const { applyModelApiMiddleware } = event;
    const getPropsMiddleware = () => id => {
      const attr = this.mApi.getAttributes(id) || {};
      return attr.props;
    };
    applyModelApiMiddleware('getProps', getPropsMiddleware);
    const setPropsMiddleware = () => (id, props) => {
      return this.mApi.setAttributes(id, { props });
    };
    applyModelApiMiddleware('setProps', setPropsMiddleware);
    // form-core 依赖这个方法取FormItem属性，vue中重写这个方法
    const getFormItemPropsMiddleware = () => id => {
      const attr = this.mApi.getAttributes(id);
      if (!attr) return {};
      const props = attr.props || {};
      return {
        rules: props.rules,
        value: props.value,
        defaultValue: props.defaultValue,
        validators: props.validators,
        validateDisabled: props.validateDisabled
      };
    };
    applyModelApiMiddleware('getFormItemProps', getFormItemPropsMiddleware);
    const setFormItemPropsMiddleware = () => (id, props, refreshImmediately) => {
      const attr = this.mApi.getAttributes(id);
      if (!attr) return Promise.reject(new Error(`[sifo-mplg-form-antdv] field not found: ${id}`));
      const prps = attr.props || {};
      return this.mApi.setAttributes(id, {
        props: { ...prps, ...props }
      }, refreshImmediately);
    };
    applyModelApiMiddleware('setFormItemProps', setFormItemPropsMiddleware);
  }
}
export default AntdVueFormModelPlugin;
