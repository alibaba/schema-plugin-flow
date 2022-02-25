/* eslint-disable */
import React from 'react';
import './index.less';

const SplitPanel = props => {
  const { label, colNum, children } = props;
  let count = React.Children.count(props.children);
  if (count === 0) return null;
  // 如果有传列数，直接按列数分
  if (colNum) {
    count = colNum
  }
  const style = { width: (100 / count) + "%" };
  return (
    <div className="split-panel">
      {
        React.Children.map(children, (child, i) => {
          return (
            <div className="split-item" style={style}>
              {
                child
              }
            </div>
          )
        })
      }
    </div>
  );
}

export default SplitPanel;