import React from 'react';
import T from 'prop-types';
import { Input } from 'antd-mobile';
import classnames from 'classnames';

class NumberInput extends React.Component {
  static propTypes = {
    value: T.string,
    onChange: T.func,
    scale: T.number, // 数字的整数位数，默认10
    precision: T.number, // 数字的小数精度，默认0
    disabled: T.bool,
  };
  static defaultProps = {
    value: '',
    onChange: null,
    scale: 10,
    precision: 0,
    disabled: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value || '' });
  }
  onBlur = () => {
    const { value } = this.state;
    if (value && /\d*\.$/.test(value)) {
      const toVal = value.replace('.', '');
      this.setState({ value: toVal });
      if (this.props.onChange) {
        this.props.onChange(toVal);
      }
    }
  };
  onChange = val => {
    const { precision = 0, scale = 10 } = this.props;// 精度与范围，精度指小数位，范围指整数位数
    const floatRegx = precision > 0 ? `(\\.\\d{0,${precision}})?` : '';
    const regx = `^\\d{0,${scale}}${floatRegx}$`;// 数字的整数部分不能超过10位
    if (new RegExp(regx).test(val) === false) return false;
    // 小数点开头补为"0."
    const toVal = /^\./.test(val) ? `0${val}` : val;
    this.setState({ value: toVal });
    if (this.props.onChange) {
      this.props.onChange(toVal);
    }
    return true;
  };
  render() {
    const { disabled, className, ...other } = this.props;
    return (
      <Input
        {...other}
        disabled={disabled}
        className={classnames({ 'sifo-adm-number-input': true, className })}
        value={this.state.value}
        onChange={this.onChange}
        onBlur={this.onBlur}
      />
    );
  }
}

export default NumberInput;

