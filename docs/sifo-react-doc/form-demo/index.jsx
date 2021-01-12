
import SifoApp from "@schema-plugin-flow/sifo-react";
import { DatePicker, Button as AButton, Input, Select, Row, Col } from "antd";
import SifoFormCore from "@schema-plugin-flow/sifo-mplg-form-core";
import AntdFormModelPlugin from "@schema-plugin-flow/sifo-mplg-form-antd";
import schema from "./schema-form.json";
import plugins from './plugins';

const components = {
  Container: ({ children, ...other}) => (
    <div style={{ border: "1px solid #f5f5f5" }} {...other}>
      {children}
    </div>
  ),
  Input,
  Button: ({ label, title, ...other }) => <AButton {...other}>{label || title}</AButton>,
  Row,
  Col,
  Select,
};
const plgs = [
  {
    modelPlugin: {
      plugin: SifoFormCore,
      argsProvider: (mId, info) => {
        return {
          // 字段的key，无返回值认为不是字段
          fieldKey: (attr) => attr.name,
          fieldChange: {
            // 表单字段change使用的handler
            changeHandler: (context, e) => {
              const { event, mApi } = context;
              let val = e;
              if (typeof e === "string" || typeof e === "number") {
                val = e;
              } else if (typeof e === "object") {
                val = e.target ? e.target.value : e;
              }
              mApi.setAttributes(event.key, { value: val }, true);
            },
            eventName: "onChange",
          },
        };
      },
    },
  },
  {
    modelPlugin: {
      plugin: AntdFormModelPlugin,
      argsProvider: (mId, info) => {
        return {
          formItemProps: {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
          }
        };
      }
    }
  },
  ...plugins
];
const FormDemo = props => {
  return(
    <SifoApp
      namespace="form-demo"
      className="form-demo"
      components={components}
      plugins={plgs}
      schema={schema}
      optimize={false}
      openLogger={true}
    />
  );
}

export default FormDemo;

