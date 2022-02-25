/* eslint-disable import/no-unresolved */
import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/extensions
import FormItem from './form-item';

const { createElement } = React;
/* eslint-disable no-underscore-dangle */

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
    const {
      label,
      hideLabel = false,
      labelAlign,
      itemVisible,
      rules,
      description,
      validators,
      validateDisabled,
      validateInfo,
      itemClassName,
      onItemClick,
      propsFormatter,
      extraIcon, // 转换字段的属性到组件属性
      ...fieldProps // 这是字段本身属性
    } = mixinFormItemProps || {};
    let renderProps = fieldProps;
    if (propsFormatter) {
      renderProps = propsFormatter(fieldProps) || fieldProps;
    }
    return (
      <FormItem
        label={label}
        hideLabel={hideLabel}
        description={description}
        labelAlign={labelAlign}
        itemVisible={itemVisible}
        onItemClick={onItemClick}
        rules={rules}
        validateInfo={validateInfo}
        itemClassName={itemClassName}
        extraIcon={extraIcon}
        __fieldKey__={__fieldKey__}
        dataFieldId={dataFieldId}
        fieldProps={renderProps}
      >
        <Component {...renderProps}>
          {children}
        </Component>
      </FormItem>
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
    'data-field-id': '',
  };
  SifoFormWrap.displayName = wrapName;
  return SifoFormWrap;
};

export default componentWrap;
