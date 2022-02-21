import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@alifd/next';
import cls from 'classnames';

const { Row, Col } = Grid;
const { createElement } = React;
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
    hideLabel = false,
    labelAlign,
    labelCol,
    rules = [],
    validateDisabled
  } = props;
  const required = rules.some(rule => rule.required === true);
  const mergedLabelCol = labelCol || { span: 8 };
  const labelColClassName = cls({
    'next-form-item-label': true,
    'sifo-fusion-form-item-label': true,
    'sifo-fusion-form-item-label-left': labelAlign === 'left'
  });
  const labelClassName = cls({
    'sifo-fusion-form-item-required': required && validateDisabled !== true
  });
  const colProps = {
    ...mergedLabelCol,
    className: labelColClassName,
    key: 'label',
  };
  return (label && hideLabel !== true) ? (
    h(
      Col,
      { ...colProps },
      h(
        'label',
        {
          className: labelClassName,
          title: typeof label === 'string' ? label : ''
        },
        [label]
      )
    )
  ) : null;
}
function renderWrapper(h, props, opts, fieldNode) {
  const { wrapperCol } = props;
  const { errorMsg } = opts;
  const mergedWrapperCol = wrapperCol || { span: 16 };
  const controlWrapperClass = cls({
    'sifo-fusion-form-item-control-wrapper': true
  });
  const colProps = {
    ...mergedWrapperCol,
    className: controlWrapperClass,
    key: 'control',
  };
  const extraNodes = [];
  if (errorMsg) {
    extraNodes.push(h(
      'div',
      {
        key: 'field-error',
        className: 'sifo-fusion-form-item-has-error'
      },
      [errorMsg]
    ));
  }
  const controlClassName = cls({
    'next-form-item-control': true,
    'sifo-fusion-form-item-control': true
  });
  return h(
    Col, { ...colProps },
    h(
      'div',
      {
        className: controlClassName
      },
      [
        fieldNode,
        ...extraNodes,
      ]
    )
  );
}
const defaultComponentName = 'SifoForm';
const componentWrap = (Component, formItemProps) => {
  const compName = Component ?
    (Component.name || Component.displayName || defaultComponentName)
    : defaultComponentName;
  const wrapName = `${compName}ItemWrap`;
  const SifoFormWrap = props => {
    const {
      __isField__, __fieldKey__, 'data-field-id': dataFieldId, children, ...rest
    } = props;
    if (!Component) return null;
    if (!__isField__) {
      return createElement(Component, rest, children);
    }
    // 对统一配置的属性进行合并
    const mixinFormItemProps = { ...formItemProps, ...rest };
    // 字段
    const {
      labelAlign, labelCol, wrapperCol, itemVisible,
      rules, validators, validateDisabled, validateInfo,
      itemClassName, propsFormatter, label, // 转换字段的属性到组件属性
      ...fieldProps // 这是字段本身属性
    } = mixinFormItemProps || {};
    let renderProps = fieldProps;
    if (propsFormatter) {
      renderProps = propsFormatter(fieldProps) || fieldProps;
    }
    const errorMsg = getErrorMsg(validateInfo);
    const itemClssName = cls({
      'next-form-item': true,
      'sifo-fusion-form-item': true,
      'sifo-fusion-form-item-with-error': !!errorMsg,
      [itemClassName]: !!itemClassName,
    });
    const compProps = {};
    if (errorMsg) {
      compProps.state = 'error';
    }
    const itemProps = {};
    if (itemVisible === false) {
      itemProps.style = {
        display: 'none'
      };
    }
    return createElement(
      Row,
      {
        className: itemClssName,
        'data-field-id': dataFieldId,
        'data-field-key': __fieldKey__,
        ...itemProps
      },
      [
        renderLabel(createElement, mixinFormItemProps, {}),
        renderWrapper(
          createElement, mixinFormItemProps, { errorMsg },
          createElement(Component, {
            ...renderProps,
            ...compProps,
            key: __fieldKey__
          }, children)
        )
      ]
    );
  };
  SifoFormWrap.propTypes = {
    __isField__: PropTypes.bool,
    __fieldKey__: PropTypes.string,
    'data-field-id': PropTypes.string,
  };
  SifoFormWrap.defaultProps = {
    __isField__: false,
    __fieldKey__: '',
    'data-field-id': ''
  };
  SifoFormWrap.displayName = wrapName;
  return SifoFormWrap;
};

export default componentWrap;
