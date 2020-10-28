import { Row, Col } from 'ant-design-vue';
/* eslint-disable no-underscore-dangle */
const getErrorMsg = validateInfo => {
  if (validateInfo && Array.isArray(validateInfo)) {
    const notPassedInfos = validateInfo.filter(i => !i.passed);
    if (notPassedInfos.length > 0) {
      return notPassedInfos[0].message || '校验失败';
    }
  }
  return null;
};
function renderLabel(h, props) {
  const {
    label,
    labelAlign,
    labelCol,
    rules = [],
    validateDisabled
  } = props;
  const required = rules.some(rule => rule.required === true);
  const mergedLabelCol = labelCol || { span: 8 };
  const labelColClassName = {
    'sifo-antdv-form-item-label': true,
    'sifo-antdv-form-item-label-left': labelAlign === 'left'
  };
  const labelClassName = {
    'sifo-antdv-form-item-required': required && validateDisabled !== true
  };
  const colProps = {
    // ...restProps,
    props: {
      ...mergedLabelCol
    },
    class: labelColClassName,
    key: 'label',
  };
  return label ? (
    h(
      Col,
      { ...colProps },
      [
        h(
          'label',
          {
            class: labelClassName,
            title: typeof label === 'string' ? label : ''
          },
          [label]
        )
      ]
    )
  ) : null;
}
function renderWrapper(h, props, opts, fieldNode) {
  const { wrapperCol, validateInfo } = props;
  const mergedWrapperCol = wrapperCol || { span: 16 };
  const controlWrapperClass = {
    'sifo-antdv-form-item-control-wrapper': true
  };
  const colProps = {
    // ...restProps,
    props: {
      ...mergedWrapperCol,
    },
    class: controlWrapperClass,
    key: 'control',
  };
  const extraNodes = [];
  const errorMsg = getErrorMsg(validateInfo);
  if (errorMsg) {
    extraNodes.push(h(
      'div',
      {
        key: 'field-error',
        class: 'sifo-antdv-form-item-has-error'
      },
      [errorMsg]
    ));
  }
  const controlClassName = {
    'sifo-antdv-form-item-control': true,
  };
  return h(Col, { ...colProps }, [
    h(
      'div',
      {
        class: controlClassName
      },
      [
        fieldNode,
        ...extraNodes,
      ]
    )
  ]);
}
const componentWrap = Component => {
  const SifoFormWrap = {
    functional: true,
    render(createElement, context) {
      const {
        props, __isField__, __fieldKey__, 'data-field-key': dataFieldKey, ...rest
      } = context.data; // 一般的属性都在props中
      if (!Component) return null;
      if (!__isField__) {
        return createElement(Component, context.data, context.children);
      }
      // 字段
      const {
        rules, validators, validateDisabled, validateInfo,
        itemClassName, labelAlign, labelCol, wrapperCol, ...fieldProps
      } = props || {};// 字段的属性已经有分类
      const itemClssName = {
        'sifo-antdv-form-item': true,
        [itemClassName]: !!itemClassName,
      };
      return createElement(
        Row,
        {
          class: itemClssName,
          attrs: {
            'data-field-key': dataFieldKey
          },
          props: {}
        },
        [
          renderLabel(createElement, props, {}),
          renderWrapper(
            createElement, props, {},
            createElement(Component, {
              ...rest,
              props: fieldProps,
              key: __fieldKey__,
            }, context.children)
          )
        ]
      );
    }
  };
  return SifoFormWrap;
};

export default componentWrap;
