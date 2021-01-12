import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import cls from 'classnames';

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
    labelAlign,
    labelCol,
    rules = [],
    validateDisabled
  } = props;
  const required = rules.some(rule => rule.required === true);
  const mergedLabelCol = labelCol || { span: 8 };
  const labelColClassName = cls({
    'sifo-antd-form-item-label': true,
    'sifo-antd-form-item-label-left': labelAlign === 'left'
  });
  const labelClassName = cls({
    'sifo-antd-form-item-required': required && validateDisabled !== true
  });
  const colProps = {
    ...mergedLabelCol,
    className: labelColClassName,
    key: 'label',
  };
  return label ? (
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
    'sifo-antd-form-item-control-wrapper': true
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
        className: 'sifo-antd-form-item-has-error'
      },
      [errorMsg]
    ));
  }
  const controlClassName = cls({
    'sifo-antd-form-item-control': true,
    'ant-form-item-has-error': !!errorMsg // 使用 antd 的 Form 对 表单字段组件的样式
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
const componentWrap = Component => {
  const compName = Component ?
    (Component.name || Component.displayName || defaultComponentName)
    : defaultComponentName;
  const wrapName = `${compName}ItemWrap`;
  const SifoFormWrap = props => {
    const {
      __isField__, __fieldKey__, 'data-field-key': dataFieldKey, children, ...rest
    } = props;
    if (!Component) return null;
    if (!__isField__) {
      return createElement(Component, rest, children);
    }
    // 字段
    const {
      rules, validators, validateDisabled, validateInfo,
      itemClassName, labelAlign, labelCol, wrapperCol, ...fieldProps
    } = rest || {};
    const errorMsg = getErrorMsg(validateInfo);
    const itemClssName = cls({
      'sifo-antd-form-item': true,
      'sifo-antd-form-item-with-error': !!errorMsg,
      [itemClassName]: !!itemClassName,
    });
    return createElement(
      Row,
      {
        className: itemClssName,
        'data-field-key': dataFieldKey
      },
      [
        renderLabel(createElement, props, {}),
        renderWrapper(
          createElement, props, { errorMsg },
          createElement(Component, {
            ...fieldProps,
            key: __fieldKey__
          }, children)
        )
      ]
    );
  };
  SifoFormWrap.propTypes = {
    __isField__: PropTypes.bool,
    __fieldKey__: PropTypes.string,
    'data-field-key': PropTypes.string,
  };
  SifoFormWrap.defaultProps = {
    __isField__: false,
    __fieldKey__: '',
    'data-field-key': ''
  };
  SifoFormWrap.displayName = wrapName;
  return SifoFormWrap;
};

export default componentWrap;
