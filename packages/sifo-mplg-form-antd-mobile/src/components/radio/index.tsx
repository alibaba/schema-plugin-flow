import React from 'react';
import { Radio, Space } from 'antd-mobile';
import './index.less';

interface RadioProps {
  dataSource: any;
  value: any;
  onChange: any;
}
const RadioX = (props: RadioProps) => {
  const {
    dataSource = [], value, onChange, ...other
  } = props;
  return (
    <Radio.Group {...other} value={value} onChange={onChange}>
      <Space direction="vertical">
        {(dataSource || []).map(item => {
          return (
            <Radio
              key={item.value}
              disabled={item.disabled}
              // eslint-disable-next-line no-unused-vars
              icon={(checked: boolean) => <span className="sifo-adm-radio-icon" />}
              value={item.value}
            >
              {item.label || item.value}
            </Radio>
          );
        })}
      </Space>
    </Radio.Group>
  );
};

export default RadioX;
