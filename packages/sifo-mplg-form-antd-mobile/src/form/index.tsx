import React from 'react';
import { List } from 'antd-mobile';
import cls from 'classnames';

const Form = props => {
  return <List {...props} className={cls('sifo-adm-form', props.className)} />;
};
export default Form;
