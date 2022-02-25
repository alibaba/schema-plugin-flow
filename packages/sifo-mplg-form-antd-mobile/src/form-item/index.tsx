/* eslint-disable consistent-return */
import React from 'react';
import { List, Popover } from 'antd-mobile';
import cls from 'classnames';
import { QuestionCircleOutline } from 'antd-mobile-icons';

const { useState } = React;
const getErrorMsg = validateInfo => {
  if (validateInfo && Array.isArray(validateInfo)) {
    const notPassedInfos = validateInfo.filter(i => !i.passed);
    if (notPassedInfos.length > 0) {
      return notPassedInfos[0].message || '校验失败';
    }
  }
  return null;
};
interface FormItemProps {
  label: string;
  hideLabel?: boolean;
  description?: string;
  labelAlign: 'left' | 'top';
  itemVisible: boolean;
  rules: any;
  validateInfo: any;
  itemClassName: string;
  onItemClick: Function;
  extraIcon: any;
  __fieldKey__: string;
  dataFieldId: string;
  children: any;
  fieldProps: any;
}

const FormItem = (props: FormItemProps) => {
  const {
    label,
    hideLabel,
    description,
    labelAlign,
    itemVisible,
    onItemClick,
    rules = [],
    validateInfo,
    itemClassName,
    __fieldKey__,
    dataFieldId,
    fieldProps,
    children,
  } = props || {};
  const { disabled } = fieldProps;
  const errorMsg = getErrorMsg(validateInfo);
  const required = rules && rules.some(rule => rule.required === true);
  const formItemCls = cls('sifo-adm-form-item', itemClassName);
  const contentCls = cls('sifo-adm-form-item-content');
  // 是否将FormItem的点击事件透传到字段组件上
  const [triggerOnClick, setTriggerOnClick] = useState(!!onItemClick); // 是否透传点击事件
  const [itemClicked, clickTrigger] = useState(false); // 点击事件触发标识
  const resetItemClicked = (flag: boolean) => {
    clickTrigger(!!flag);
  };
  const doItemClick = e => {
    if (onItemClick) {
      onItemClick(e);
    }
    clickTrigger(true);
  };
  const renderChildren = React.Children.map(children, child => {
    if (!child) return null;
    if (typeof child === 'string') return child;
    if (child && child.props) {
      const injectProps = {
        key: __fieldKey__, itemClicked, resetItemClicked, setTriggerOnClick
      };
      return React.cloneElement(child, injectProps);
    }
  });
  const itemProps: any = {
    'data-field-id': dataFieldId,
    'data-field-key': __fieldKey__,
    className: formItemCls,
  };
  if (itemVisible === false) {
    itemProps.style = {
      display: 'none',
    };
  }
  const labelElement =
    label && hideLabel !== true ? (
      <label className="sifo-adm-form-item-label">
        {label}
        {required && <span className="sifo-adm-form-item-label-required">*</span>}
        {description && (
          <span className="sifo-adm-form-item-label-help">
            <Popover content={description} mode="dark" trigger="click">
              <QuestionCircleOutline />
            </Popover>
          </span>
        )}
      </label>
    ) : null;
  return (
    <List.Item
      {...itemProps}
      // disabled={!!disabled}
      onClick={disabled !== true && triggerOnClick ? doItemClick : undefined}
      title={labelAlign !== 'left' && labelElement}
      prefix={labelAlign === 'left' && labelElement}
      description={errorMsg && <div className="sifo-adm-form-item-error-msg">{errorMsg}</div>}
    >
      <div className={contentCls}>{renderChildren}</div>
    </List.Item>
  );
};

export default FormItem;
