import React from 'react';
import { Checkbox, Space } from 'antd-mobile';

interface CheckboxProps {
  dataSource: any;
  value: any;
  onChange: any;
}
const CheckboxX = (props:CheckboxProps) => {
  const {
    dataSource = [], value, onChange, ...other
  } = props;
  return (
    <Checkbox.Group {...other} value={value} onChange={onChange}>
      <Space direction="vertical">
        {(dataSource || []).map(item => {
          return (
            <Checkbox key={item.value} value={item.value} disabled={item.disabled}>
              {item.label || item.value}
            </Checkbox>
          );
        })}
      </Space>
    </Checkbox.Group>
  );
};

export default CheckboxX;
