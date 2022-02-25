/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-expressions */
import React from 'react';
import classnames from 'classnames';
import './index.less';

const { useEffect } = React;
interface FieldContentProps {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  value: any;
  dataType?: string;
  /**
   * 渲染内容的方法
   */
  contentRender?: Function;
  resetItemClicked?: Function;
  setTriggerOnClick: (trigger: boolean) => void;
  itemClicked?: boolean;
  onClick?: Function;
}
function defalutFormatter(value: any) {
  return `${value}`;
}
// DatePicker、Calender、Picker 等需要提供内容组件
const FieldContent = (props: FieldContentProps) => {
  const {
    label,
    placeholder,
    disabled = false,
    value,
    dataType,
    contentRender = defalutFormatter,
    setTriggerOnClick,
    itemClicked,
    resetItemClicked,
    ...other
  } = props;
  const { onClick } = props;
  const doClick = () => {
    if (!disabled) {
      onClick && onClick();
    }
  };
  useEffect(() => {
    if (onClick) {
      setTriggerOnClick(true); // 有Click事件，就需要在FormItem上透传
    }
  }, []);
  useEffect(() => {
    // FormItem 被点击了
    if (itemClicked && onClick && resetItemClicked) {
      resetItemClicked();
      doClick();
    }
  }, [itemClicked]);
  const formatedValue = value ? contentRender(value, props) : '';
  const cls = classnames('sifo-adm-field-content', {
    'sifo-adm-field-disabled': disabled,
  });
  return formatedValue ? (
    <div className={cls} {...other} onClick={doClick}>
      {formatedValue}
    </div>
  ) : (
    <div className={cls} {...other} onClick={doClick}>
      <span className="sifo-adm-field-placeholder">
        {placeholder || label || '请输入'}
      </span>
    </div>
  );
};

export default FieldContent;
