/* eslint-disable */
import * as React from 'react';
import { Row, Col } from 'antd';
import classnames from 'classnames';
import './gridPanel.less';

// 支持的分栏数, 24分栏数
const colSpanMap = {
  1: '24',
  2: '12',
  3: '8',
  4: '6',
  5: '1p5',
  6: '4',
};
const calcSpan = (colNum, holdSpanValue) => {
  let holdSpan = holdSpanValue;
  if (!holdSpan) holdSpan = 1;
  const defSpan = colSpanMap[colNum];// 默认一位宽
  let span = null;//
  const mod = (24 * holdSpan) % colNum;
  if (mod === 0) {
    const ret = (24 * holdSpan) / colNum;
    span = `${ret}`;
  }
  if (!span && defSpan === '1p5') { // 有分组，没取到占位, 只有5份时有计算价值
    span = `${holdSpan}p5`;
  }
  return span || defSpan || '6';// 都没有按四份分
};

class GridPanel extends React.Component {
  static defaultProps  = {
    colNum: 4, // 默认分四栏
    label: undefined,
    hideTitle: false, // 是否显示标题
  }
  assignCol = (colN = 1) => {
    const colNum = Number(colN);
    const count = React.Children.count(this.props.children);
    const children = React.Children.toArray(this.props.children);
    if (count === 0) return [];
    const col = [];
    let row = {
      rest: colNum, // 剩余位置
      data: []
    };
    const toHoldSpan = (child) => {
      try {
        if (!child || !child.props) return;//非组件式不处理
        let { holdSpan = 1, itemVisible } = child.props;
        if (itemVisible === false) row.rest += 1;// 不占位，不在Col内渲染，而在外部渲染
        if (holdSpan) holdSpan = Math.max(Number(holdSpan), 1);
        if (holdSpan <= row.rest) { // 占位少于空位
          row.rest -= (holdSpan - 1);// 除自己外剩余位数，即减去多占位数，要给自己留一位
        } else {
          // 不够直接换行
          // 有字段先存
          if (row.data.length > 0) {
            col.push(row.data);
          }
          row = {
            rest: colNum, // 剩余位置
            data: []
          };
          // 占位多于剩余位，有可能空行都不够，有可能占后有剩
          if (holdSpan >= colNum) { // 全占不够
            row.rest = 1;//  只给自己留一个位置
          } else { // 占后有剩
            row.rest -= (holdSpan - 1);
          }
        }
      } catch (e) {
        // 不生效
      }
    };
    for (let i = 0; i < count; i++) {
      const child = children[i];
      toHoldSpan(child);// 占位，不包含本身的一个位子
      if (row.rest > 0) {
        row.data.push(child);
        row.rest -= 1;
      }
      // 一旦被占完就换行
      if (row.rest <= 0) {
        col.push(row.data);
        row = {
          rest: colNum,
          data: []
        };
      }
    }
    // 跑完所有，位子还没满
    if (row.data.length > 0) {
      col.push(row.data);
    }
    return col;
  }

  renderCol = (row, colNum, colKey) => {
    return row.map((field, i) => {
      if (!field) return null;
      const {
        id = undefined, holdSpan = 1, itemVisible = true, itemClassName = "", clearSpace = false, // 清除边距
      } = field.props || {};
      if (itemVisible === false) return <Col key={colKey + i} style={{ display: 'none' }}> {field} </Col>; // 应保证field在 itemVisible false下不显示
      const span = calcSpan(colNum, Number(holdSpan));
      const classN = classnames({
        'grid-panel-item': true,
        'grid-panel-item-clear-space': `${clearSpace}` === 'true'
      }, itemClassName);
      return (
        <Col key={colKey + i} span={span} className={classN}>
          {
            field
          }
        </Col>
      );
    })
  }

  render() {
    const {
      colNum = 1, label, className, hideTitle
    } = this.props;
    let showTitle = true;
    if (`${hideTitle}` === 'true') {
      showTitle = false;
    }
    if(label === undefined){
      showTitle = false;
    }
    const rows = this.assignCol(colNum);
    const classN = classnames('grid-panel', className);
    return (
      <div className={classN} >
        {showTitle && <div className="grid-panel-label">{label}</div>}
        <div className="grid-panel-wrapper">
        {
          rows.map((row, i) => (
            <Row key={i}>
              {
                this.renderCol(row, colNum, `${i}`)
              }
            </Row>
          ))
        }
        </div>
      </div>);
  }
}

export default GridPanel;
