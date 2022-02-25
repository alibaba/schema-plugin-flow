/* eslint-disable */
import * as React from 'react';
import { Picker } from 'antd-mobile';
import FieldContent from './field-content';

const PickerX = (props) => {
  const {
    title, value = '',
    disabled, dataSource = [],
    multiple = false, placeholder,
    label, onChange,
    setTriggerOnClick, itemClicked, resetItemClicked,
    ...rest } = props;
  const contentRender = (val, prps) => {
    // Picker 会将显示内容放到children的props.extra内
    if (prps.extra) {
      return prps.extra;
    }
    if (!multiple) {
      const r = dataSource.find((d) => d.value === val);
      if (r) {
        return r.label || r.value;
      }
      return val || ''; // 没有匹配时，如果有值就显示值
    }
    if (!Array.isArray(val) || val.length <= 0) return '--';
    return (
      <span>
        {val.map((v, i) => {
          const p = dataSource.find((d) => d.value === v);
          let display = '';
          if (p) {
            display = p.label || p.value;
          } else {
            display = v || '--'; // 没有匹配时，如果有值就显示值
          }
          if (i < val.length - 1) display = `${display}/`;
          return display;
        })}
      </span>
    );
  };
  const change = (v) => {
    if (!multiple) {
      onChange(v[0]);
    } else {
      onChange(v);
    }
  };
  const [visible, setVisible] = React.useState(false);
  return (
    <Picker
      columns={[dataSource]}
      title={title}
      value={multiple ? value : (value ? [value] : [])}
      onConfirm={change}
      {...rest}
      disabled={disabled}
      visible={visible}
      onClose={() => {
        setVisible(false);
      }}
    >
      {(items) => {
        return <FieldContent
          label={label}
          onClick={() => { setVisible(true); }}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          contentRender={contentRender}
          setTriggerOnClick={setTriggerOnClick}
          itemClicked={itemClicked}
          resetItemClicked={resetItemClicked}
        />;
      }
      }
    </Picker>
  );
};

export default PickerX;
