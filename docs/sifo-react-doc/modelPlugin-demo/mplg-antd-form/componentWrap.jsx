import React from 'react';
const formItemProps = ["name", "fieldKey", "noStyle", "dependencies", "prefixCls", "style", "className", "shouldUpdate", "hasFeedback", "help", "rules", "validateStatus", "children", "required", "label", "trigger", "validateTrigger", "hidden"];
function pickItemProps(props) {
  const prps = {};
  const rest = {};
  Object.keys(props).forEach(key => {
    if (formItemProps.indexOf(key) >= 0) {
      prps[key] = props[key];
    } else {
      rest[key] = props[key];
    }
  });
  return [prps, rest];
}
const defaultComponentName = 'FieldComp';
const componentWrap = (Component, FormItem) => {
  const compName = Component ?
    (Component.name || Component.displayName || defaultComponentName)
    : defaultComponentName;
  const wrapName = `${compName}FormItemWrap`;
  const SifoFormWrap = props => {
    const {
      __isField__, __skipWrap__, children, ...realProps
    } = props;
    if (!Component) return null;
    if (__isField__) {
      if (__skipWrap__) {
        let child;
        if (Array.isArray(children)) {
          [child] = children;
        } else {
          child = children;
        }
        return (<Component {...realProps} >{child}</Component>);
      }
      // 捡出所有Form.Item 的属性
      const [itemProps, rest] = pickItemProps(realProps);
      const {
        fieldProps = {}, ...others
      } = rest;
      return (
        <FormItem
          {...itemProps}
        >
          {
            React.createElement(Component, { ...fieldProps, ...others }, children)
          }
        </FormItem>
      )
    }
    return (<Component {...realProps} >{children}</Component>);
  }
  SifoFormWrap.displayName = wrapName;
  return SifoFormWrap;
};

export default componentWrap;
