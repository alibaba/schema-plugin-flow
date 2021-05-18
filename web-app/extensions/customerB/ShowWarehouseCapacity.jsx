/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import {
  SyncOutlined
} from '@ant-design/icons';

const ShowWarehouseCapacity = props => {
  const [counts, setCount] = useState({});
  const refreshCount = () => setTimeout(() => {
    const newCounts = { ...counts };
    (props.options || []).forEach(item => {
      newCounts[item.value] = Math.ceil(Math.random() * 100);
    });
    setCount(newCounts);
  }, 50);
  useEffect(() => {
    refreshCount();
  }, []);
  const {
    style = {}, options = [], onChange, value
  } = props;
  return (
    <div style={style}>
      <SyncOutlined className="capacity-refresh" onClick={refreshCount} />
      <div className="capacity-select">
        {
          options.map(item => {
            const cls = item.value === value ? 'capacity-item selected' : 'capacity-item';
            return (
              <div
                className={cls}
                onClick={() => onChange(item.value)}
              >
                {`${item.label} 库存：${counts[item.value] || ''}`}
              </div>
            );
          })
        }
      </div>
    </div>
  );
};
export default ShowWarehouseCapacity;
