import React from 'react';
import { Modal, Input } from 'antd';
const { confirm } = Modal;

export function showPasswordConfirm(props) {
  let pswd = '';
  const onChange = e => {
    pswd = e.target.value;
  }
  confirm({
    title: '特殊入库授权',
    content: (
      <div>
        <p>化学品类一般要求放到三号仓库，建议重新选择仓库，如果仍要入库，请输入特殊入库授权码：</p>
        <Input.Password
          placeholder="请输入特殊入库授权码"
          onChange={onChange}
        // iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </div>
    ),
    ...props,
    onOk: () => {
      if (props.onOk) {
        return props.onOk(pswd);
      } else {
        return Promise.reject();
      }
    }
  });
}
export default {
  showPasswordConfirm
};