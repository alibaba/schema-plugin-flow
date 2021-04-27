import React from "react";
import SifoApp from "@schema-plugin-flow/sifo-react";
import { DatePicker, Button as AButton, Input, Select, Col, Row } from "antd";
import SifoFormCore from "@schema-plugin-flow/sifo-mplg-form-core";
import AntdFormModelPlugin from "@schema-plugin-flow/sifo-mplg-form-antd";
import DragModelPlugin from '@schema-plugin-flow/sifo-mplg-drag-react';
import schema from "./schema.json";
import "antd/dist/antd.css";
import "@schema-plugin-flow/sifo-mplg-form-antd/lib/index.less";
import "./index.less";
import GridPanel from './components/gridPanel';
import componentList from './components/componentConfig';

const { TextArea } = Input;
const components = {
  GridPanel,
  Header: ({ title, ...others }) => (<h3 {...others}>{title || ''}</h3>),
  Container: ({ children, ...other }) => (
    <div {...other}>
      {children}
    </div>
  ),
  Input,
  TextArea,
  Button: ({ label, title, ...other }) => (
    <AButton {...other}>{label || title}</AButton>
  ),
  Row,
  Col,
  Select
};
const dragPluin = {
  sifo_mplg_drag_editor_id: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        componentList
      });
      mApi.addEventListener(event.key, 'onSave', (ctx, schema) => {
        console.log('this is edited schema:', schema);
      });
    }
  }
}
const FormDemo = (props) => {
  const plgs = [
    {
      modelPlugin: {
        plugin: SifoFormCore,
        argsProvider: (mId, info) => {
          return {
            // 字段的key，无返回值认为不是字段
            fieldKey: (attr) => attr.fieldKey,
            fieldChange: {
              // 表单字段change使用的handler
              changeHandler: (context, e) => {
                const { event, mApi } = context;
                let val = e;
                if (typeof e === "string" || typeof e === "number") {
                  val = e;
                } else if (e && typeof e === "object") {
                  val = e.target ? e.target.value : e;
                }
                mApi.setAttributes(event.key, { value: val }, true);
              },
              eventName: "onChange"
            }
          };
        }
      }
    },
    {
      modelPlugin: AntdFormModelPlugin
    },
    {
      modelPlugin: {
        plugin: DragModelPlugin, argsProvider: () => {
          return {
            dropFilter: (args) => {
              console.log('dropFilter', args);
              return true;
            },
            getDraggable: (node) => {
              // 所有节点都可拖拽
              return true;
            },
            getDropable: (node) => {
              if (node.acceptable !== undefined) return !!node.acceptable;
              // 字段不可拖入子节点
              if (node?.attribute?.fieldKey) return false;
              if (node.component === 'Container') return true;
              return false;
            }
          }
        }
      }
    },
    {
      componentPlugin: dragPluin
    }
  ];
  return (
    <SifoApp
      namespace="drag-demo"
      className="drag-demo"
      components={components}
      plugins={plgs}
      schema={schema}
      openLogger={props.openLogger}
    />
  );
};

export default FormDemo;
