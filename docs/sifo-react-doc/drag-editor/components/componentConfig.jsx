import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
const BlurInput = props => {
  const { value } = props;
  const [val, setVal] = useState(value);
  useEffect(() => {
    setVal(value);
  }, [value]);
  return (
    <Input onChange={e => { setVal(e.target.value) }} value={val} onBlur={() => props.onChange(val)} />
  )
};
/**
 * 描述组件节点的生成与属性编辑
 */
const componentList = [
  {
    type: 'input',
    name: '文本',
    component: 'Input',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'text_' + uuid,
        attributes: {
          label: '文本-' + uuid,
          fieldKey: 'text_' + uuid
        }
      }
    },
    propsRender: (id, node, api) => {
      const { attributes } = node;
      const { label, fieldKey } = attributes;
      return (
        <div>
          <div>
            ID:<Input value={id} onChange={e => {
              api.updateId(e.target.value);
            }}></Input>
          </div>
          <div>
            标签:<Input value={label} onChange={e => {
              api.setAttributes({ label: e.target.value });
            }}></Input>
          </div>
          <div>
            字段标识:<Input value={fieldKey} onChange={e => {
              api.setAttributes({ fieldKey: e.target.value }, true);
            }}></Input>
          </div>
        </div>
      );
    }
  },
  {
    type: 'select',
    name: '选择器',
    component: 'Select',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'sel_' + uuid,
        attributes: {
          label: '选择器-' + uuid,
          fieldKey: 'sel_' + uuid
        }
      }
    },
    propsRender: (id, node, api) => {
      const { attributes } = node;
      const { label, fieldKey } = attributes;
      return (
        <div>
          <div>
            ID:<Input value={id} onChange={e => {
              api.updateId(e.target.value);
            }}></Input>
          </div>
          <div>
            标签:<Input value={label} onChange={e => {
              api.setAttributes({ label: e.target.value });
            }}></Input>
          </div>
          <div>
            字段标识:<Input value={fieldKey} onChange={e => {
              api.setAttributes({ fieldKey: e.target.value }, true);
            }}></Input>
          </div>
        </div>
      );
    }
  },
  {
    type: 'container',
    name: '容器',
    component: 'Container',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'con_' + uuid,
        acceptable: true, // 可接收子节点
        attributes: {
          label: '容器-' + uuid,
          style: { minHeight: '10px' }
        }
      }
    },
    propsRender: (id, node, api) => {
      const { attributes } = node;
      const { label } = attributes;
      return (
        <div>
          <div>
            ID:<Input value={id} onChange={e => {
              api.updateId(e.target.value);
            }}></Input>
          </div>
          <div>
            标签:<Input value={label} onChange={e => {
              api.setAttributes({ label: e.target.value });
            }}></Input>
          </div>
        </div>
      );
    }
  },
  {
    type: 'gridPanel',
    name: '栅格面板',
    component: 'GridPanel',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'gridp_' + uuid,
        acceptable: true, // 可接收子节点
        attributes: {
          label: '两栏栅格' + uuid,
          colNum: 2,
          style: { minHeight: '10px' }
        }
      }
    },
    propsRender: (id, node, api) => {
      const { attributes } = node;
      const { label, colNum, holdSpan=1 } = attributes;
      return (
        <div>
          <div>
            ID:<Input value={id} onChange={e => {
              api.updateId(e.target.value);
            }}></Input>
          </div>
          <div>
            标签:<Input value={label} onChange={e => {
              api.setAttributes({ label: e.target.value });
            }}></Input>
          </div>
          <div>
            分栏数:<Input value={colNum} onChange={e => {
              api.setAttributes({ colNum: e.target.value });
            }}></Input>
          </div>
          <div>
            占栏数:<Input value={holdSpan} onChange={e => {
              api.setAttributes({ holdSpan: e.target.value });
            }}></Input>
          </div>
        </div>
      );
    }
  },
  {
    type: 'button',
    name: '按钮',
    component: 'Button',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'btn_' + uuid,
        acceptable: true, // 可接收子节点
        attributes: {
          label: '按钮' + uuid
        }
      }
    },
    propsRender: (id, node, api) => {
      const { attributes } = node;
      const { label } = attributes;
      return (
        <div>
          <div>
            ID:<Input value={id} onChange={e => {
              api.updateId(e.target.value);
            }}></Input>
          </div>
          <div>
            标签:<Input value={label} onChange={e => {
              api.setAttributes({ label: e.target.value });
            }}></Input>
          </div>
        </div>
      );
    }
  }
];

export default componentList;