/* eslint-disable react/prop-types */
import React from 'react';
import { Checkbox, Select } from 'antd';

const Settings = props => {
  const {
    sysExtTypes, sysExts = [], customer = '', customerTyps, onSysExtChange, onCustomExtChange
  } = props;
  return (
    <>
      <div className="system-setting">
        <h4 className="setting-sub-title">选择系统扩展：</h4>
        <Checkbox.Group
          value={sysExts}
          itemDirection="ver"
          options={sysExtTypes}
          onChange={onSysExtChange}
        />
      </div>
      <div className="customer-setting">
        <h4 className="setting-sub-title">选择客户扩展：</h4>
        <Select
          placeholder="设置客户"
          className="customer-select"
          allowClear
          options={customerTyps}
          value={customer}
          onChange={onCustomExtChange}
        />
        {
          customer && (
            <p className="customer-description">
              {customerTyps.find(c => c.value === customer).description}
            </p>
          )
        }
      </div>
    </>
  );
};

export default Settings;
