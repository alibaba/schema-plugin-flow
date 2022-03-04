/* eslint-disable */
import React from 'react';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import FieldContent from './field-content';

const DATETIME = 'YYYY-MM-DD HH:mm:ss';
const DATE = 'YYYY-MM-DD';
const DatePickerX = (props) => {
  const {
    label,
    placeholder,
    disabled,
    value,
    onChange,
    dataType,
    format,
    setTriggerOnClick,
    itemClicked,
    resetItemClicked,
    ...other
  } = props;
  const change = (v) => {
    const fmat = format ? format : dataType === 'dateTime' ? DATETIME : DATE;
    onChange(dayjs(v).format(fmat));
  };
  const [visible, setVisible] = React.useState(false);
  return (
    <DatePicker
      value={value ? new Date(value) : null}
      precision={dataType === 'dateTime' ? 'second' : 'day'}
      onConfirm={change}
      onClose={() => {
        setVisible(false);
      }}
      {...other}
      disabled={disabled}
      visible={visible}
    >
      {(val) => {
        return (
          <FieldContent
            onClick={() => {
              setVisible(true);
            }}
            label={label}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            setTriggerOnClick={setTriggerOnClick}
            itemClicked={itemClicked}
            resetItemClicked={resetItemClicked}
          />
        );
      }}
    </DatePicker>
  );
};

export default DatePickerX;
