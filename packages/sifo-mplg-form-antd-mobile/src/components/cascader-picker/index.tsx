/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import React from 'react';
import classnames from 'classnames';
import { Cascader } from 'antd-mobile';
import FieldContent from '../field-content';
import './index.less';

interface SelectItem {
  value: string;
  label: string;
  children?: SelectItem[];
}
interface SelectState {
  dataSource: SelectItem[];
  value: string[];
  cols?: number;
  visible: boolean;
}
interface CascaderProps {
  onChange: (value: string[], extra: { selectedItems: Object[] }) => void;
  value: string[];
  label?: string;
  disabled?: boolean;
  format?: Function;
  className?: string;
  onReady?: Function; // 用来暴露api，比如getExtra方法
  extra: any;
  placeholder?: string;
  itemClicked: boolean;
  resetItemClicked?: Function;
  setTriggerOnClick?: (c: boolean) => void;
  /**
   * 获取对应层级的数据源，第一级时，currDsPath是[],
   */
  onLoadDataSource: (
    currentDataSourcePath: string[],
    currentDataSource: SelectItem[],
    currentValue: any,
  ) => Promise<SelectItem[]>;
}
function defaultFormat(labels) {
  return labels.map((label, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <span key={i} className="sifo-adm-cascader-value">
      {label || '--'}
    </span>
  ));
}
class CascaderPicker extends React.Component<CascaderProps, SelectState> {
  // eslint-disable-next-line react/sort-comp
  initValue: any;
  defaultValue: any;
  unmounted: boolean;
  constructor(props: CascaderProps) {
    super(props);
    const { value: defVal } = props; // 防止props.value是非法
    this.initValue = defVal || [];
    this.defaultValue = defVal || [];
    this.unmounted = false;
    this.state = {
      value: defVal || [],
      dataSource: [],
      visible: false,
    };
  }
  componentDidMount() {
    this.getDefaultDataSource(false);
    const { onReady } = this.props;
    if (onReady) {
      onReady({
        getExtra: this.getExtra,
      });
    }
  }
  componentWillReceiveProps(nextProps: CascaderProps) {
    const { value } = nextProps;
    if (JSON.stringify(this.props.value || '') !== JSON.stringify(value || '')) {
      this.initValue = value || [];
      this.markedSetState(
        {
          value: value || [],
        },
        () => {
          this.getDefaultDataSource(false);
        },
      );
    }
  }
  componentWillUnmount(): void {
    this.unmounted = true;
  }
  markedSetState = (...arg) => {
    if (this.unmounted) return;
    return this.setState(...arg);
  }
  onOk = () => {
    this.markedSetState(
      {
        visible: false,
      },
      () => {
        const { value } = this.state;
        this.initValue = value;
        const { onChange } = this.props;
        if (onChange) {
          // 调用 onChange和onOk 是同步，setState是异步，直接用val
          // const { value } = this.state;
          // 构建完整数据
          const extra = this.getExtra(value);
          onChange(value, extra);
        }
      },
    );
  };
  onCancel = () => {
    this.markedSetState({
      visible: false,
      value: this.initValue,
    });
  };
  // 先调onChange,再调onOk
  onChange = (value: string[]) => {
    this.markedSetState({
      visible: false,
      value,
    });
  };

  // 说明这一级的dataSource是有值的
  onPickerChange = (val: string[]) => {
    // 会自动取到已有的dataSource的最子级
    const value = [...val];
    this.markedSetState(
      {
        value,
      },
      () => {
        this.getDefaultDataSource();
      },
    );
  };
  onContentClick = () => {
    const { disabled } = this.props;
    if (disabled) return;
    // document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
    const { value, visible } = this.state;
    this.initValue = value;
    if (!this.initValue || this.initValue.length === 0) {
      this.markedSetState({
        value: this.defaultValue,
      });
    }
    if (!visible) {
      this.markedSetState({
        visible: true,
      });
    }
  };
  /**
   * 通过当前dataSource/value/path来判断是否进行取数据
   * 1. 如果有value,按value的层级取
   * 2. 如果无value,取当前展示的最子级
   * 3. 切换选择时，取到当前切换的最子级 ！！！！！
   */
  getDefaultDataSource = (setDefaultValue = true) => {
    const { value = [] } = this.state; // 注意，要用这一个value作为整个加载过程的变量
    this.loadChildren([]).then(() => {
      // const { dataSource, value = [] } = this.state; // 不能取这个value
      const { dataSource } = this.state; // 要取这个dataSource
      if (dataSource.length === 0) return;
      let firstItem: any = dataSource[0].value;
      if (value.length >= 1 && value[0]) {
        firstItem = value[0];
      }
      this.loadChildren([firstItem]).then(() => {
        // const { dataSource, value = [] } = this.state; // 不能取这个value
        // eslint-disable-next-line no-shadow
        const { dataSource } = this.state; // 要取这个dataSource
        const firstItemObj: any = dataSource.find(ds => ds.value === firstItem);
        if (!firstItemObj || !firstItemObj.children || firstItemObj.children.length === 0) return;
        let secondItem = firstItemObj.children[0].value;
        if (value.length >= 2 && value[0] && value[1]) {
          // to fix: 在这个位置时，可能是取到的重新赋值过的value，所以，这个地方要通过异步传参进行
          firstItem = value[0];
          secondItem = value[1];
        } // 如果只有两级，可以考虑在这里处理
        this.loadChildren([firstItem, secondItem]).then(() => {
          // 两种情况，一种是value是全的，一种是value不全，不全时要强制设置为全的路径
          // const { dataSource, value = [] } = this.state; // 不能取这个value
          const secondItemObj: any = firstItemObj.children.find((ds: SelectItem) => ds.value === secondItem,);
          if (!secondItemObj || !secondItemObj.children || secondItemObj.children.length === 0) { return; }
          const thirdItem: any = secondItemObj.children[0].value;
          if (value.length >= 3 && value[0] && value[1] && value[2]) {
            // 全地址
          } else if (setDefaultValue) {
            // console.log('设置初始值', firstItem, secondItem, thirdItem)
            this.markedSetState({
              value: [firstItem, secondItem, thirdItem],
            });
          } else {
            // 用加载的第一个值作默认值，也可以用最后一个选择的值作默认值
            this.defaultValue = [firstItem, secondItem, thirdItem];
          }
        });
      });
    });
  };

  getItemByPath = (path: string[]) => {
    const { dataSource = [] } = this.state;
    const newDs = [...dataSource];
    let targetDs: any = newDs;
    let key = '';
    path.forEach((pathKey, idx) => {
      key = pathKey;
      const subDs = targetDs.find((re: SelectItem) => re.value === pathKey);
      if (subDs) {
        if (idx === path.length - 1) {
          targetDs = subDs;
        } else {
          if (!subDs.children) {
            subDs.children = [];
          }
          targetDs = subDs.children;
        }
      } else {
        // 异常
        // console.error('未匹配到dataSource路径', newDs, pathKey);
        targetDs = null; // 置空
        // Promise.reject();
        // return;
      }
    });
    return { dataSource: newDs, targetItem: targetDs, pathKey: key };
  };
  /**
   * 在父级dataSource存在的情况下，取子级dataSource
   */
  loadChildren: any = (currentDataSourcePath: string[]) => {
    const { onLoadDataSource } = this.props;
    if (!onLoadDataSource) {
      console.error('onLoadDataSource is undefined');
      return Promise.resolve();
    }
    const { dataSource, value } = this.state;
    // const currentDataSourcePath: string[] = [];
    const currentDataSource = dataSource;
    const currentValue = value;
    if (currentDataSourcePath.length === 0) {
      if (dataSource.length > 0) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        onLoadDataSource(currentDataSourcePath, currentDataSource, currentValue).then(data => {
          // 异步验证锁
          const checkDs = this.state.dataSource;
          if (checkDs && checkDs.length > 0) {
            return resolve({});
          }
          this.markedSetState(
            {
              dataSource: data,
            },
            () => { resolve({}); },
          );
        });
      });
    }
    const {
      dataSource: newDs,
      targetItem: targetDs,
      pathKey,
    } = this.getItemByPath(currentDataSourcePath);
    if (!targetDs) {
      console.error('未匹配到dataSource路径', newDs, pathKey, currentDataSourcePath);
      return Promise.reject();
    }
    if (targetDs) {
      // 已经有值，或是叶子节点，则不用取
      if (targetDs.isLeaf || (targetDs.children && targetDs.children.length > 0)) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        onLoadDataSource(currentDataSourcePath, currentDataSource, currentValue).then(data => {
          // 异步验证锁
          const {
            dataSource: newDs,
            targetItem: targetDs,
          } = this.getItemByPath(currentDataSourcePath);
          if (targetDs) {
            // 已经有值，或是叶子节点，则不用取
            if (targetDs.isLeaf || (targetDs.children && targetDs.children.length > 0)) {
              return resolve({});
            }
            targetDs.children = data;
            this.markedSetState(
              {
                dataSource: newDs,
              },
              () => { resolve({}); },
            );
          }
        });
      });
    }

    return Promise.reject();
  };
  // 通过value，获取取它信息
  getExtra = (value: string[]) => {
    const selectedItems: any = [];
    const { dataSource = [] } = this.state;
    let temp = dataSource;
    (value || []).forEach((key, idx) => {
      const re = temp.find(item => item.value === key);
      selectedItems[idx] = { ...re };
      temp = re && re.children ? re.children : [];
    });
    return {
      selectedItems,
    };
  };
  render() {
    const {
      label,
      className,
      placeholder,
      itemClicked,
      resetItemClicked,
      setTriggerOnClick,
      disabled,
      format
    } = this.props;
    const {
      dataSource, value, visible
    } = this.state;
    const cls = classnames('sifo-adm-cascader-picker', className);
    return (
      <div className={cls}>
        <FieldContent
          value={value && value.length > 0 ? [...value] : ''}
          label={label || ''}
          placeholder={placeholder}
          setTriggerOnClick={setTriggerOnClick}
          itemClicked={itemClicked}
          resetItemClicked={resetItemClicked}
          disabled={disabled}
          onClick={this.onContentClick}
          contentRender={val => {
            const { selectedItems = [] } = this.getExtra(val || []);
            const labels = selectedItems.map(i => i.label);
            if (format) {
              return format(labels);
            }
              return defaultFormat(labels);
          }}
        />
        <Cascader
          visible={visible}
          options={dataSource}
          value={[...value]}
          onCancel={() => {
            this.onCancel();
          }}
          onClose={() => { }}
          onConfirm={this.onOk}
          onSelect={this.onPickerChange}
        />
      </div>
    );
  }
}

export default CascaderPicker;
