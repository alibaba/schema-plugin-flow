/* eslint-disable */
import React from 'react';
import { Calendar, Popup } from 'antd-mobile';
// import enUS from 'antd-mobile/lib/calendar/locale/en_US';
import FieldContent from './field-content';
import classnames from 'classnames';
import dayjs from 'dayjs';

const DATETIME = 'YYYY-MM-DD HH:mm:ss';
const DATE = 'YYYY-MM-DD';
class DateRangePicker extends React.Component {
  // originbodyScrollY = document.getElementsByTagName('body')[0].style.overflowY;
  constructor(props) {
    super(props);
    const { dataType, format } = props;
    this.state = {
      show: false,
      format: format || (dataType === 'dateTime' ? DATETIME : DATE)
    };
  }
  onChange = (val) => {
    const [startTime, endTime] = val;
    this.setState({
      startTime, endTime,
    });
  };
  onConfirm = () => {
    // document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY;
    const { onChange } = this.props;
    const { format, startTime,
      endTime } = this.state;
    this.setState({
      show: false,
    }, () => {
      if (onChange) {
        onChange({
          startTime: dayjs(startTime).format(format),
          endTime: dayjs(endTime).format(format),
        });
      }
    });
  };

  onCancel = () => {
    // document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY;
    this.setState({
      show: false,
      startTime: undefined,
      endTime: undefined,
    }, () => {
      // 取消不处理数据
      // if (onChange) {
      //   onChange({
      //     startTime: undefined,
      //     endTime: undefined,
      //   })
      // }
    });
  };

  render() {
    const {
      className, disabled, onChange, label,
      onCancel, placeholder, value, onConfirm,
      setTriggerOnClick, itemClicked, resetItemClicked,
      extra, ...other } = this.props;
    const cls = classnames('sifo-adm-canlander', className);
    const { show, format } = this.state;
    return (
      <div className={cls}>
        <FieldContent
          value={value}
          label={label}
          placeholder={placeholder}
          setTriggerOnClick={setTriggerOnClick}
          itemClicked={itemClicked}
          resetItemClicked={resetItemClicked}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            // document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
            this.setState({
              show: true,
            });
          }}
          contentRender={
            (val) => {
              if (!val) return '';
              const startTime = val.startTime && val.startTime.toLocaleString ? dayjs(val.startTime).format(format) : val.startTime;
              const endTime = val.endTime && val.endTime.toLocaleString ? dayjs(val.endTime).format(format) : val.endTime;
              return `${startTime || ''} - ${endTime || ''}`;
            }
          }
        />
        <Popup
          visible={show}
          destroyOnClose
          onMaskClick={this.onCancel}
          className="adm-picker-popup"
          footer={() => null}
        >
          <>
            <div className="adm-picker-header">
              <a
                className="adm-picker-header-button"
                onClick={this.onCancel}
              >取消
              </a>
              <div className="adm-picker-header-title"> {extra || ''}</div>
              <a
                className="adm-picker-header-button"
                onClick={this.onConfirm}
              >
                确定
              </a>
            </div>
            <Calendar
              {...other}
              selectionMode="range"
              value={[value?.startTime, value?.endTime]}
              onChange={this.onChange}
              onCancel={this.onCancel}
              visible={show}
            />
          </>
        </Popup>
      </div>
    );
  }
}

export default DateRangePicker;
