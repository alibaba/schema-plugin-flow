/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { List, Input, TextArea, ImageUploader, Cascader } from 'antd-mobile';
import Button from './button';
import Picker from './picker';
import SplitPanel from './split-panel';
import DatePicker from './date-picker';
import DateRangePicker from './date-range-picker';
import Container from './container';
import NumberInput from './number-input';
import Checkbox from './checkbox';
import Radio from './radio';
import CascaderPicker from './cascader-picker';

const None = () => null;

export default {
  Cascader,
  // 异步的级联
  CascaderPicker,
  Button,
  List,
  ListItem: List.Item,
  None, // 由于sifo-adm-form的字段识别依赖组件的渲染
  Container,
  Picker,
  ImageUploader,
  Input,
  DatePicker,
  DateRangePicker,
  Checkbox,
  TextArea,
  SplitPanel,
  Radio,
  NumberInput
};
