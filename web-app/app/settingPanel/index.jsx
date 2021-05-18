/* eslint-disable react/prop-types */
import React from 'react';
import { Switch } from 'antd';
import Settings from './settings';

const SettingPanel = props => {
  const {
    settingType = 'bizPlg', onTypeChange,
    useSavedSchema = false, onSchemaTypeChange,
    sysExtTypes,
    sysExts, customer, customerTyps,
    onCustomExtChange, onSysExtChange
  } = props;
  return (
    <>
      <h3 className="setting-title">页面扩展设置</h3>
      <Switch
        className="setting-type"
        checked={settingType === 'bizPlg'}
        onChange={onTypeChange}
        checkedChildren="业务态"
        unCheckedChildren="开发态"
      />
      <Switch checked={useSavedSchema} onChange={onSchemaTypeChange} checkedChildren="使用保存的schema" unCheckedChildren="使用默认的schema" />
      <div>
        {
          settingType === 'bizPlg' ? (
            <Settings
              sysExtTypes={sysExtTypes}
              sysExts={sysExts}
              customer={customer}
              customerTyps={customerTyps}
              onCustomExtChange={onCustomExtChange}
              onSysExtChange={onSysExtChange}
            />
          ) : (
            <div>
              使用Sifo拖拽插件构建新的schema，允许对初始schema的节点进行拖拽编辑，也支持添加注册的组件节点。
            </div>
          )
        }
      </div>
    </>
  );
};

export default SettingPanel;
