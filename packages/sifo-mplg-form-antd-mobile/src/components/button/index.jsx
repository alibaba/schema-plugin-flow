import React from 'react';
import { Button } from 'antd-mobile';
import cls from 'classnames';
import './index.less';

const ButtonX = props => {
  /* eslint-disable react/prop-types */
  const {
    title, className, label, ...other
  } = props;
  return (
    <Button
      {...other}
      className={cls('sifo-adm-button', className)}
    >
      {title == null ? (label || '') : title }
    </Button>
  );
};

export default ButtonX;
